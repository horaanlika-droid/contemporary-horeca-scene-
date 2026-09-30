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

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
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

function respond(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
  res.end(message);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch {
    return respond(res, 400, 'Bad request');
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
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=300',
      'Content-Length': stat.size,
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Contemporary HoReCa Scene listening on http://${HOST}:${PORT}`);
});

server.on('error', error => {
  console.error('Unable to start the web app:', error.message);
  process.exitCode = 1;
});
