'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};
const ADMIN_IDS = new Set((process.env.ADMIN_IDS || '').split(/[\s,;]+/).filter(Boolean));

/* --- course access gate ----------------------------------------------------
   The course opens with a cohort password. A correct password issues a signed,
   HttpOnly cookie that unlocks the course content files. Override with
   COURSE_PASSWORD (or a comma-separated COURSE_PASSWORDS list) and ACCESS_SECRET
   in production; the defaults keep the local/BotHost prototype working.       */
const PASSWORDS = (process.env.COURSE_PASSWORDS || process.env.COURSE_PASSWORD || 'Mzgnxtj8')
  .split(/[\s,;]+/).map(value => value.trim()).filter(Boolean);
const ACCESS_SECRET = process.env.ACCESS_SECRET
  || crypto.createHash('sha256').update(`chs-access|${PASSWORDS.join('|')}`).digest('hex');
const ACCESS_COOKIE = 'chs_access';
const ACCESS_TTL = 60 * 60 * 24 * 30; // 30 days
/* Content that only an unlocked visitor may read. */
const PROTECTED = ['/course-data.js', '/course/', '/presentation/dist/', '/presentation/build/'];

const attempts = new Map();
const ATTEMPT_WINDOW = 10 * 60 * 1000;
const ATTEMPT_LIMIT = 12;

function json(res, status, data, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function respond(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(message);
}

function signAccess(expiry) {
  return crypto.createHmac('sha256', ACCESS_SECRET).update(`chs-access|${expiry}`).digest('hex');
}

function issueToken() {
  const expiry = Math.floor(Date.now() / 1000) + ACCESS_TTL;
  return `${expiry}.${signAccess(expiry)}`;
}

function tokenFromRequest(req) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ACCESS_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function accessGranted(req) {
  const token = tokenFromRequest(req);
  if (!token) return false;
  const [expiry, signature] = token.split('.');
  const expiryNumber = Number(expiry);
  if (!Number.isFinite(expiryNumber) || expiryNumber < Math.floor(Date.now() / 1000)) return false;
  if (typeof signature !== 'string' || signature.length !== 64) return false;
  const expected = Buffer.from(signAccess(expiryNumber), 'hex');
  const received = Buffer.from(signature, 'hex');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function cookieHeader(value, req, maxAge = ACCESS_TTL) {
  const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = forwarded === 'https';
  return [
    `${ACCESS_COOKIE}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

function readBody(req, limit = 8192) {
  return new Promise((resolve, reject) => {
    let body = '';
    let tooLarge = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > limit && !tooLarge) {
        tooLarge = true;
        reject(Object.assign(new Error('Request too large'), { status: 413 }));
        req.destroy();
      }
    });
    req.on('end', () => { if (!tooLarge) resolve(body); });
    req.on('error', reject);
  });
}

function throttle(ip) {
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, resetAt: now + ATTEMPT_WINDOW };
  if (now > record.resetAt) { record.count = 0; record.resetAt = now + ATTEMPT_WINDOW; }
  record.count += 1;
  attempts.set(ip, record);
  if (attempts.size > 5000) {
    for (const [key, value] of attempts) if (now > value.resetAt) attempts.delete(key);
  }
  return record.count > ATTEMPT_LIMIT ? Math.ceil((record.resetAt - now) / 1000) : 0;
}

function matchesPassword(candidate) {
  const value = Buffer.from(String(candidate ?? ''));
  let ok = false;
  for (const password of PASSWORDS) {
    const expected = Buffer.from(password);
    if (expected.length === value.length && crypto.timingSafeEqual(expected, value)) ok = true;
  }
  return ok;
}

function verifyTelegramInitData(initData) {
  if (!process.env.BOT_TOKEN || typeof initData !== 'string' || initData.length > 16_384) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) return null;
  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate > now + 300 || now - authDate > 86_400) return null;

  const checkString = [...params.entries()]
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN).digest();
  const expected = crypto.createHmac('sha256', secretKey).update(checkString).digest();
  const received = Buffer.from(hash, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;

  try {
    const telegramUser = JSON.parse(params.get('user') || 'null');
    if (!telegramUser || !Number.isSafeInteger(telegramUser.id)) return null;
    return {
      id: String(telegramUser.id),
      name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || 'Student',
      username: telegramUser.username || null,
      role: ADMIN_IDS.has(String(telegramUser.id)) ? 'ADMIN' : 'STUDENT',
      institutionId: 'him-001',
    };
  } catch {
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch {
    return respond(res, 400, 'Bad request');
  }

  /* --- course access API --- */
  if (pathname === '/api/access') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      return json(res, 200, { unlocked: accessGranted(req), course: 'Contemporary Horeca Scene' });
    }
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';
    let payload;
    try {
      payload = JSON.parse(await readBody(req) || '{}');
    } catch (error) {
      if (error.status === 413) return json(res, 413, { error: 'Request too large' });
      return json(res, 400, { error: 'Invalid request body' });
    }
    if (payload.action === 'revoke') {
      return json(res, 200, { unlocked: false }, { 'Set-Cookie': cookieHeader('', req, 0) });
    }
    const retryAfter = throttle(ip);
    if (retryAfter > 0) {
      return json(res, 429, { error: 'Too many attempts', retryAfter }, { 'Retry-After': String(retryAfter) });
    }
    if (!matchesPassword(payload.password)) {
      return json(res, 401, { unlocked: false, error: 'Incorrect course password' });
    }
    attempts.delete(ip);
    return json(res, 200, { unlocked: true, course: 'Contemporary Horeca Scene' }, { 'Set-Cookie': cookieHeader(issueToken(), req) });
  }

  if (pathname === '/api/telegram-auth') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    if (!process.env.BOT_TOKEN) return json(res, 503, { error: 'Telegram authentication is not configured' });
    let body = '';
    let tooLarge = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 32_768 && !tooLarge) {
        tooLarge = true;
        json(res, 413, { error: 'Request too large' });
        req.destroy();
      }
    });
    req.on('end', () => {
      if (tooLarge) return;
      try {
        const profile = verifyTelegramInitData(JSON.parse(body).initData);
        if (!profile) return json(res, 401, { error: 'Invalid or expired Telegram session' });
        return json(res, 200, { user: profile });
      } catch {
        return json(res, 400, { error: 'Invalid request body' });
      }
    });
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') return respond(res, 405, 'Method not allowed');

  if (pathname === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : 'ok');
  }

  /* --- course content is password-protected --- */
  if (PROTECTED.some(prefix => pathname === prefix || pathname.startsWith(prefix)) && !accessGranted(req)) {
    return json(res, 403, { error: 'Course access required', course: 'Contemporary Horeca Scene' });
  }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relative);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) return respond(res, 403, 'Forbidden');

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) return respond(res, 404, 'Not found');
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': ext === '.html' ? 'no-cache' : (PROTECTED.some(prefix => pathname === prefix || pathname.startsWith(prefix)) ? 'private, max-age=300' : 'public, max-age=300'),
      'Content-Length': stat.size,
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Contemporary Horeca Scene listening on http://${HOST}:${PORT}`);
  console.log(`Course access: ${PASSWORDS.length} password(s) configured · content behind ${ACCESS_COOKIE} cookie`);
});

server.on('error', error => {
  console.error('Unable to start the web app:', error.message);
  process.exitCode = 1;
});
