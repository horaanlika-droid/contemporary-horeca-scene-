'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const AUTHOR_EMAIL = 'egor.tarasenko@him-mail.ch';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};

const ADMIN_IDS = new Set((process.env.ADMIN_IDS || '').split(/[\s,;]+/).filter(Boolean));
const PASSWORDS = (process.env.COURSE_PASSWORDS || process.env.COURSE_PASSWORD || 'Mzgnxtj8')
  .split(/[\s,;]+/).map(value => value.trim()).filter(Boolean);
const ACCESS_SECRET = process.env.ACCESS_SECRET
  || crypto.createHash('sha256').update(`chs-access|${PASSWORDS.join('|')}`).digest('hex');
const ACCESS_COOKIE = 'chs_access';
const ACCESS_TTL = 60 * 60 * 24 * 30; // 30 days
const PROTECTED = ['/course-data.js', '/course/', '/presentation/dist/', '/presentation/build/'];

const ALL_LESSON_IDS = [
  'signals',
  'atmosphere',
  'perception',
  'point-of-view',
  'automation',
  'human-ai',
  'new-formats',
  'from-idea',
  'budget-builds',
  'scenography',
  'final-brief',
];

const attempts = new Map();
const ATTEMPT_WINDOW = 10 * 60 * 1000;
const ATTEMPT_LIMIT = 20;

/* --- persistent store (passwords, submissions, Tribute stub, Admin Bot) --- */
function ensureDirs() {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch { /* ignore */ }
}

function defaultStore() {
  return {
    students: [],
    submissions: [],
    progress: {},
    quizzes: {},
    tribute: {
      mode: 'stub',
      productId: process.env.TRIBUTE_PRODUCT_ID || 'chs-2026-digital-elective',
      productTitle: 'Contemporary Horeca Scene — 2026 Edition (Digital Product)',
      productPrice: process.env.TRIBUTE_PRICE || '49 EUR',
      productUrl: process.env.TRIBUTE_PRODUCT_URL || '',
      orders: [],
    },
    adminBot: {
      adminChatIds: [...ADMIN_IDS],
      logs: [
        {
          id: 'log-boot',
          at: new Date().toISOString(),
          type: 'system',
          text: 'Admin Bot & Tribute Digital Product API ready. Commands: /pending, /approve <id> <feedback>, /revise <id> <feedback>, /genpass [name] [email], /students',
        },
      ],
    },
  };
}

function loadStore() {
  ensureDirs();
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      const def = defaultStore();
      return {
        ...def,
        ...parsed,
        tribute: { ...def.tribute, ...(parsed.tribute || {}) },
        adminBot: { ...def.adminBot, ...(parsed.adminBot || {}) },
      };
    }
  } catch (err) {
    console.warn('Could not load store.json, using default:', err.message);
  }
  return defaultStore();
}

let store = loadStore();

function saveStore() {
  ensureDirs();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write store.json:', err.message);
  }
}

function addBotLog(type, text) {
  store.adminBot.logs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    type,
    text,
  });
  if (store.adminBot.logs.length > 80) store.adminBot.logs.length = 80;
  saveStore();
}

function generatePersonalPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 4; i++) part1 += alphabet[bytes[i] % alphabet.length];
  for (let i = 4; i < 8; i++) part2 += alphabet[bytes[i] % alphabet.length];
  const code = `CHS-${part1}-${part2}`;
  if (store.students.some(s => s.password === code)) return generatePersonalPassword();
  return code;
}

function createStudentPassword({ name, email, telegramId, telegramUsername, source = 'tribute', tributeOrderId = null, clientId = null }) {
  const password = generatePersonalPassword();
  const cleanEmail = (email || '').trim().toLowerCase() || `student-${password.toLowerCase()}@chs.local`;
  const cleanName = (name || '').trim() || (telegramUsername ? `@${telegramUsername}` : cleanEmail.split('@')[0]);
  const student = {
    id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    password,
    name: cleanName,
    email: cleanEmail,
    role: 'STUDENT',
    institutionId: 'him-001',
    telegramId: telegramId ? String(telegramId) : null,
    telegramUsername: telegramUsername || null,
    boundClientId: clientId || null,
    boundAt: clientId ? new Date().toISOString() : null,
    source,
    tributeOrderId,
    unlockedLessons: [...ALL_LESSON_IDS],
    completedLessons: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
  store.students.unshift(student);
  saveStore();
  return student;
}

/* --- HTTP & auth helpers -------------------------------------------------- */
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

function signTokenPayload(payloadStr) {
  return crypto.createHmac('sha256', ACCESS_SECRET).update(`chs-access|${payloadStr}`).digest('hex');
}

function issueToken(subject = 'master') {
  const expiry = Math.floor(Date.now() / 1000) + ACCESS_TTL;
  const payloadStr = `${expiry}:${subject}`;
  return `${payloadStr}.${signTokenPayload(payloadStr)}`;
}

function parseToken(token) {
  if (!token || typeof token !== 'string') return null;
  const dotIdx = token.lastIndexOf('.');
  if (dotIdx === -1) return null;
  const payloadStr = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);
  if (signature.length !== 64) return null;
  const [expiryRaw, ...subjectParts] = payloadStr.split(':');
  const expiryNumber = Number(expiryRaw);
  if (!Number.isFinite(expiryNumber) || expiryNumber < Math.floor(Date.now() / 1000)) return null;
  try {
    const expected = Buffer.from(signTokenPayload(payloadStr), 'hex');
    const received = Buffer.from(signature, 'hex');
    if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  } catch {
    return null;
  }
  return { expiry: expiryNumber, subject: subjectParts.join(':') || 'master' };
}

function tokenFromRequest(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
  if (req.headers['x-access-token']) return String(req.headers['x-access-token']).trim();
  try {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (u.searchParams.get('token')) return u.searchParams.get('token');
  } catch { /* ignore */ }
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === ACCESS_COOKIE) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function resolveSession(req) {
  const raw = tokenFromRequest(req);
  const parsed = parseToken(raw);
  if (!parsed) return null;
  if (parsed.subject === 'master') {
    return {
      unlocked: true,
      token: raw,
      isAdmin: true,
      user: {
        id: 'master-admin',
        name: 'Egor Tarasenko',
        email: AUTHOR_EMAIL,
        role: 'ADMIN',
        isMaster: true,
        institutionId: 'him-001',
        passwordCode: 'MASTER',
        unlockedLessons: [...ALL_LESSON_IDS],
      },
    };
  }
  const student = store.students.find(s => s.id === parsed.subject && s.active !== false);
  if (!student) return null;
  return {
    unlocked: true,
    token: raw,
    isAdmin: false,
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'STUDENT',
      isMaster: false,
      institutionId: student.institutionId || 'him-001',
      passwordCode: student.password,
      telegramId: student.telegramId || null,
      telegramUsername: student.telegramUsername || null,
      unlockedLessons: [...ALL_LESSON_IDS],
      completedLessons: student.completedLessons || [],
    },
  };
}

function accessGranted(req) {
  return Boolean(resolveSession(req));
}

function cookieHeader(value, req, maxAge = ACCESS_TTL) {
  const forwarded = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const secure = forwarded === 'https';
  return [
    `${ACCESS_COOKIE}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    secure ? 'SameSite=None' : 'SameSite=Lax',
    `Max-Age=${maxAge}`,
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

function readBody(req, limit = 25 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let tooLarge = false;
    req.on('data', chunk => {
      length += chunk.length;
      if (length > limit && !tooLarge) {
        tooLarge = true;
        reject(Object.assign(new Error('Request too large'), { status: 413 }));
        req.destroy();
      } else if (!tooLarge) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (!tooLarge) resolve(Buffer.concat(chunks).toString('utf8'));
    });
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

function matchesMasterPassword(candidate) {
  const value = Buffer.from(String(candidate ?? '').trim());
  if (!value.length) return false;
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
    const isAdmin = ADMIN_IDS.has(String(telegramUser.id)) || store.adminBot.adminChatIds.includes(String(telegramUser.id));
    return {
      id: String(telegramUser.id),
      name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || 'Student',
      username: telegramUser.username || null,
      role: isAdmin ? 'ADMIN' : 'STUDENT',
      institutionId: 'him-001',
    };
  } catch {
    return null;
  }
}

/* --- Telegram Admin Bot helper & command processor ----------------------- */
async function sendTelegramMessage(chatId, text, replyMarkup = undefined) {
  if (!process.env.BOT_TOKEN || !chatId) return false;
  try {
    const body = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    const res = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function notifyAdminsOnSubmission(submission) {
  const fileNames = (submission.files || []).map(f => f.name).join(', ') || 'No files';
  const summary = `📩 <b>New submission: ${submission.assignment}</b>\nStudent: ${submission.name} (${submission.student})\nPassword: ${submission.passwordCode || '—'}\nFiles: ${fileNames}\nID: <code>${submission.id}</code>\n\nAnswer:\n${submission.answer.slice(0, 600)}`;
  addBotLog('submission', `New submission ${submission.id} from ${submission.name} (${submission.assignment}) · Files: ${fileNames}`);
  for (const chatId of store.adminBot.adminChatIds) {
    await sendTelegramMessage(chatId, summary, {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: `approve:${submission.id}` },
          { text: '✏️ Request revision', callback_data: `revise:${submission.id}` },
        ],
      ],
    });
  }
}

function applyAdminReview({ submissionId, decision, feedbackText, score = null, via = 'admin-panel' }) {
  const sub = store.submissions.find(s => s.id === submissionId);
  if (!sub) return { error: 'Submission not found' };
  const status = decision === 'REVISION REQUESTED' ? 'REVISION REQUESTED' : 'APPROVED';
  sub.status = status;
  sub.feedback = {
    text: String(feedbackText || '').trim() || (status === 'APPROVED' ? 'Your assignment has been reviewed and approved.' : 'Please revise your assignment using the feedback.'),
    score: score !== '' && score !== null && score !== undefined ? Number(score) : null,
    status,
    reviewer: 'Egor Tarasenko',
    via,
    updatedAt: new Date().toISOString(),
  };
  sub.updatedAt = new Date().toISOString();

  if (status === 'APPROVED' && sub.lessonId) {
    const stu = store.students.find(s => s.id === sub.studentId || s.email === sub.student || s.password === sub.passwordCode);
    if (stu) {
      if (!stu.completedLessons.includes(sub.lessonId)) stu.completedLessons.push(sub.lessonId);
    }
    const pKey = `${sub.student}:contemporary-horeca-scene:2026`;
    const list = store.progress[pKey] || [];
    if (!list.includes(sub.lessonId)) {
      list.push(sub.lessonId);
      store.progress[pKey] = list;
    }
  }
  saveStore();
  addBotLog('review', `[${via}] ${status} for ${sub.name} (${sub.assignment}): "${sub.feedback.text}"`);
  if (sub.telegramId) {
    sendTelegramMessage(
      sub.telegramId,
      `💬 <b>Feedback from Egor Tarasenko</b>\nAssignment: <b>${sub.assignment}</b>\nStatus: <b>${status === 'APPROVED' ? 'APPROVED ✓' : 'REVISION REQUESTED ↺'}</b>\n${sub.feedback.score !== null ? `Score: ${sub.feedback.score}/100\n` : ''}\n${sub.feedback.text}`
    );
  }
  return { ok: true, submission: sub };
}

function executeBotCommand(rawCommand) {
  const cmdLine = String(rawCommand || '').trim();
  if (!cmdLine) return { ok: false, reply: 'Enter a command, for example: /pending, /genpass, /approve <id> <feedback>, /revise <id> <feedback>, /students' };
  const [cmd, ...args] = cmdLine.split(/\s+/);
  const command = cmd.toLowerCase();

  if (command === '/start' || command === '/help') {
    const reply = [
      '🤖 <b>Contemporary Horeca Scene Admin Bot</b>',
      'Available commands:',
      '• <code>/pending</code> — list submissions awaiting review',
      '• <code>/approve &lt;id&gt; &lt;feedback&gt;</code> — approve an assignment and send feedback to the student',
      '• <code>/revise &lt;id&gt; &lt;feedback&gt;</code> — request a revision with feedback',
      '• <code>/genpass [Name] [email]</code> — generate a personal password (one password per person)',
      '• <code>/students</code> — list issued passwords and students',
    ].join('\n');
    addBotLog('command', `${cmdLine} → help displayed`);
    return { ok: true, reply };
  }

  if (command === '/pending') {
    const waiting = store.submissions.filter(s => s.status === 'WAITING FOR REVIEW');
    if (!waiting.length) {
      const reply = 'No submissions are awaiting review.';
      addBotLog('command', '/pending → 0 submissions');
      return { ok: true, reply };
    }
    const reply = waiting.map(s => `• <code>${s.id}</code> | ${s.name} (${s.student}) — ${s.assignment} [Files: ${(s.files || []).map(f => f.name).join(', ') || 'none'}]`).join('\n');
    addBotLog('command', `/pending → ${waiting.length} submissions found`);
    return { ok: true, reply };
  }

  if (command === '/genpass') {
    const emailArg = args.find(a => a.includes('@')) || '';
    const nameArg = args.filter(a => !a.includes('@')).join(' ') || 'Tribute Buyer';
    const existing = emailArg ? store.students.find(s => s.email.toLowerCase() === emailArg.toLowerCase()) : null;
    if (existing) return { ok: false, reply: `A personal password has already been issued for ${emailArg}. Use the existing account.` };
    const student = createStudentPassword({ name: nameArg, email: emailArg, source: 'admin-bot' });
    const reply = `🔑 Personal password generated (one person): ${student.password}\nStudent: ${student.name} (${student.email})`;
    addBotLog('command', `/genpass → password ${student.password} created for ${student.name}`);
    return { ok: true, reply, student };
  }

  if (command === '/students') {
    if (!store.students.length) {
      return { ok: true, reply: 'No personal passwords have been created yet. Use /genpass or Tribute checkout.' };
    }
    const reply = store.students.slice(0, 20).map(s => `• ${s.password} — ${s.name} (${s.email}) · ${s.boundClientId ? 'Assigned (activated)' : 'Not yet activated'} · source: ${s.source}`).join('\n');
    addBotLog('command', `/students → ${store.students.length} records`);
    return { ok: true, reply };
  }

  if (command === '/approve' || command === '/revise') {
    const subId = args[0];
    const feedbackText = args.slice(1).join(' ').trim();
    if (!subId || !feedbackText) {
      return { ok: false, reply: `Usage: ${command} <submission_id> <feedback text>` };
    }
    const decision = command === '/approve' ? 'APPROVED' : 'REVISION REQUESTED';
    const res = applyAdminReview({ submissionId: subId, decision, feedbackText, via: 'admin-bot' });
    if (res.error) return { ok: false, reply: `Error: submission ${subId} was not found.` };
    return {
      ok: true,
      reply: `✅ Status ${decision} saved for submission ${subId} (${res.submission.name}). Feedback sent to the student.`,
      submission: res.submission,
    };
  }

  return { ok: false, reply: `Unknown command: ${command}. Enter /help for the command list.` };
}

/* Optional Telegram long-polling when BOT_TOKEN is configured */
if (process.env.BOT_TOKEN) {
  let offset = 0;
  const pollTelegram = async () => {
    try {
      const res = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates?timeout=15&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        for (const upd of data.result || []) {
          offset = upd.update_id + 1;
          const msg = upd.message;
          if (msg?.text && msg?.chat?.id) {
            const chatId = String(msg.chat.id);
            if (msg.text.startsWith('/admin ')) {
              const candidate = msg.text.slice(7).trim();
              if (matchesMasterPassword(candidate)) {
                if (!store.adminBot.adminChatIds.includes(chatId)) {
                  store.adminBot.adminChatIds.push(chatId);
                  saveStore();
                }
                await sendTelegramMessage(chatId, '✅ You are authorised as an administrator for Contemporary Horeca Scene. Enter /help for the command list.');
              }
              continue;
            }
            if (store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId)) {
              const out = executeBotCommand(msg.text);
              await sendTelegramMessage(chatId, out.reply);
            }
          }
          const cb = upd.callback_query;
          if (cb?.data && cb?.message?.chat?.id) {
            const chatId = String(cb.message.chat.id);
            if (store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId)) {
              const [act, subId] = cb.data.split(':');
              if (act === 'approve') {
                const r = applyAdminReview({
                  submissionId: subId,
                  decision: 'APPROVED',
                  feedbackText: 'Great work! Your assignment has been approved through the Admin Bot.',
                  via: 'admin-bot',
                });
                if (!r.error) await sendTelegramMessage(chatId, `✅ Submission ${subId} approved! To add detailed feedback: <code>/approve ${subId} your feedback</code>`);
              } else if (act === 'revise') {
                await sendTelegramMessage(chatId, `✏️ Send a command with your feedback:\n<code>/revise ${subId} what needs to change</code>`);
              }
            }
          }
        }
      }
    } catch { /* ignore network errors in sandbox */ }
    setTimeout(pollTelegram, 3000);
  };
  setTimeout(pollTelegram, 1500);
}

/* --- HTTP server --------------------------------------------------------- */
const server = http.createServer(async (req, res) => {
  let parsedUrl;
  let pathname;
  try {
    parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    return respond(res, 400, 'Bad request');
  }

  /* --- 1. Course Access API (/api/access) --- */
  if (pathname === '/api/access') {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const session = resolveSession(req);
      return json(res, 200, {
        unlocked: Boolean(session),
        token: session?.token || null,
        user: session?.user || null,
        course: 'Contemporary Horeca Scene',
        authorEmail: AUTHOR_EMAIL,
        tribute: {
          mode: store.tribute.mode,
          productTitle: store.tribute.productTitle,
          productPrice: store.tribute.productPrice,
          productUrl: store.tribute.productUrl,
        },
      });
    }
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 32768) || '{}');
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

    const candidate = String(payload.password || '').trim();
    const clientId = String(payload.clientId || '').trim() || ip;

    /* Check master/admin password first */
    if (matchesMasterPassword(candidate)) {
      attempts.delete(ip);
      const token = issueToken('master');
      return json(res, 200, {
        unlocked: true,
        token,
        course: 'Contemporary Horeca Scene',
        user: {
          id: 'master-admin',
          name: 'Egor Tarasenko',
          email: AUTHOR_EMAIL,
          role: 'ADMIN',
          isMaster: true,
          institutionId: 'him-001',
          passwordCode: 'MASTER',
          unlockedLessons: [...ALL_LESSON_IDS],
        },
      }, { 'Set-Cookie': cookieHeader(token, req) });
    }

    /* Check personal 1-per-person passwords generated via Tribute or Admin */
    const personal = store.students.find(
      s => s.active !== false && s.password.toUpperCase() === candidate.toUpperCase()
    );
    if (personal) {
      const requestTelegramId = String(payload.telegramId || '').trim();
      if (personal.telegramId && requestTelegramId !== String(personal.telegramId)) {
        return json(res, 403, {
          unlocked: false,
          error: 'This password is assigned to your Telegram profile. Open the course from the Telegram account used for your purchase.',
        });
      }
      if (personal.boundClientId && personal.boundClientId !== clientId) {
        return json(res, 403, {
          unlocked: false,
          error: 'This personal password has already been activated by another person (one password per person). Get your own access through Tribute.',
        });
      }
      if (!personal.boundClientId) {
        personal.boundClientId = clientId;
        personal.boundAt = new Date().toISOString();
      }
      if (payload.name && (!personal.name || personal.name === 'Tribute Buyer')) {
        personal.name = String(payload.name).trim();
      }
      if (payload.email && personal.email.endsWith('@chs.local')) {
        personal.email = String(payload.email).trim().toLowerCase();
      }
      saveStore();
      attempts.delete(ip);
      const token = issueToken(personal.id);
      return json(res, 200, {
        unlocked: true,
        token,
        course: 'Contemporary Horeca Scene',
        user: {
          id: personal.id,
          name: personal.name,
          email: personal.email,
          role: 'STUDENT',
          isMaster: false,
          institutionId: personal.institutionId || 'him-001',
          passwordCode: personal.password,
          telegramId: personal.telegramId || null,
          telegramUsername: personal.telegramUsername || null,
          unlockedLessons: [...ALL_LESSON_IDS],
          completedLessons: personal.completedLessons || [],
        },
      }, { 'Set-Cookie': cookieHeader(token, req) });
    }

    return json(res, 401, {
      unlocked: false,
      error: 'Incorrect password. Enter your personal Tribute password or the administrator password.',
    });
  }

  /* --- 2. Tribute Digital Product API Stub & Webhook (/api/tribute/*) --- */
  if (pathname === '/api/tribute/status') {
    return json(res, 200, {
      mode: store.tribute.mode,
      productId: store.tribute.productId,
      productTitle: store.tribute.productTitle,
      productPrice: store.tribute.productPrice,
      productUrl: store.tribute.productUrl,
      webhookEndpoint: '/api/tribute/webhook',
      issuedCount: store.students.length,
      ordersCount: store.tribute.orders.length,
    });
  }

  if (pathname === '/api/tribute/checkout') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 32768) || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid JSON body' });
    }
    const buyerName = String(payload.name || '').trim() || 'Student';
    const buyerEmail = String(payload.email || '').trim().toLowerCase() || `buyer-${Date.now()}@student.him.edu`;
    const telegramUsername = String(payload.telegram || '').trim().replace(/^@/, '') || null;
    const telegramId = payload.telegramId ? String(payload.telegramId) : null;
    const clientId = String(payload.clientId || '').trim() || null;
    const existingBuyer = store.students.find(s =>
      s.email.toLowerCase() === buyerEmail
      || (telegramId && String(s.telegramId || '') === telegramId)
      || (telegramUsername && s.telegramUsername?.toLowerCase() === telegramUsername.toLowerCase())
    );
    if (existingBuyer) {
      return json(res, 409, { ok: false, error: 'A personal password has already been issued for this buyer. Please use the password from your original checkout or contact egor.tarasenko@him-mail.ch.' });
    }

    const orderId = `trbt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const student = createStudentPassword({
      name: buyerName,
      email: buyerEmail,
      telegramId,
      telegramUsername,
      source: 'tribute',
      tributeOrderId: orderId,
      clientId,
    });

    const order = {
      id: orderId,
      productId: store.tribute.productId,
      productTitle: store.tribute.productTitle,
      amount: store.tribute.productPrice,
      buyerName: student.name,
      buyerEmail: student.email,
      telegramUsername,
      passwordIssued: student.password,
      studentId: student.id,
      status: 'PAID_STUB',
      createdAt: new Date().toISOString(),
    };
    store.tribute.orders.unshift(order);
    saveStore();
    addBotLog('tribute', `Tribute digital-product demo checkout completed: ${student.name} (${student.email}) → personal password ${student.password} issued`);

    return json(res, 200, {
      ok: true,
      stub: store.tribute.mode === 'stub',
      order,
      password: student.password,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        passwordCode: student.password,
      },
      message: 'Tribute demo checkout completed. No real charge was made. A personal password for one person has been generated.',
    });
  }

  if (pathname === '/api/tribute/webhook') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const rawBody = await readBody(req, 65536);
    if (process.env.TRIBUTE_API_KEY) {
      const signature = String(req.headers['trbt-signature'] || '');
      const expected = crypto.createHmac('sha256', process.env.TRIBUTE_API_KEY).update(rawBody).digest('hex');
      if (!signature || signature !== expected) {
        return json(res, 401, { error: 'Invalid Tribute webhook signature' });
      }
    }
    let event;
    try {
      event = JSON.parse(rawBody || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid webhook payload' });
    }
    const payload = event.payload || event;
    const buyerName = payload.user_name || payload.first_name || payload.buyerName || 'Tribute Buyer';
    const buyerEmail = payload.email || payload.buyerEmail || '';
    const telegramId = payload.telegram_user_id || payload.telegramId || null;
    const telegramUsername = payload.telegram_username || null;
    const orderId = String(payload.order_id || payload.id || `trbt-wh-${Date.now()}`);
    const previousOrder = store.tribute.orders.find(o => o.id === orderId);
    if (previousOrder) return json(res, 200, { ok: true, duplicate: true, password: previousOrder.passwordIssued, studentId: previousOrder.studentId });

    const priorBuyer = store.students.find(s =>
      (buyerEmail && s.email.toLowerCase() === String(buyerEmail).trim().toLowerCase())
      || (telegramId && String(s.telegramId || '') === String(telegramId))
    );
    if (priorBuyer) {
      store.tribute.orders.unshift({
        id: orderId,
        productId: store.tribute.productId,
        productTitle: store.tribute.productTitle,
        buyerName: priorBuyer.name,
        buyerEmail: priorBuyer.email,
        telegramId: priorBuyer.telegramId,
        telegramUsername: priorBuyer.telegramUsername,
        passwordIssued: priorBuyer.password,
        studentId: priorBuyer.id,
        status: 'PAID_WEBHOOK_EXISTING_BUYER',
        createdAt: new Date().toISOString(),
      });
      saveStore();
      addBotLog('tribute', `Tribute webhook (${orderId}): repeat purchase by existing student ${priorBuyer.name}; no second password created.`);
      if (telegramId) await sendTelegramMessage(telegramId, `Your personal access already exists. Use your previously issued password or contact egor.tarasenko@him-mail.ch.`);
      return json(res, 200, { ok: true, duplicateBuyer: true, studentId: priorBuyer.id });
    }

    const student = createStudentPassword({
      name: buyerName,
      email: buyerEmail,
      telegramId,
      telegramUsername,
      source: 'tribute-webhook',
      tributeOrderId: orderId,
    });
    store.tribute.orders.unshift({
      id: orderId,
      productId: store.tribute.productId,
      productTitle: store.tribute.productTitle,
      amount: payload.amount ? `${payload.amount} ${payload.currency || 'EUR'}` : store.tribute.productPrice,
      buyerName: student.name,
      buyerEmail: student.email,
      telegramId,
      telegramUsername,
      passwordIssued: student.password,
      studentId: student.id,
      status: 'PAID_WEBHOOK',
      createdAt: new Date().toISOString(),
    });
    saveStore();
    addBotLog('tribute', `Tribute webhook (${orderId}): password ${student.password} issued for ${student.name}`);

    if (telegramId) {
      await sendTelegramMessage(
        telegramId,
        `🎉 <b>Thank you for purchasing Contemporary Horeca Scene!</b>\n\nYour personal password (valid for one person):\n<code>${student.password}</code>\n\nEnter it on the app’s start screen to open every lesson.`
      );
    }
    return json(res, 200, { ok: true, password: student.password, studentId: student.id });
  }

  /* --- 3. Platform State & Submissions API (/api/state, /api/submissions) --- */
  if (pathname === '/api/state') {
    if (req.method !== 'GET') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    const visibleSubmissions = session.isAdmin
      ? store.submissions
      : store.submissions.filter(s => s.studentId === session.user.id || s.student === session.user.email);
    return json(res, 200, {
      authorEmail: AUTHOR_EMAIL,
      submissions: visibleSubmissions.map(s => ({
        ...s,
        files: (s.files || []).map((f, idx) => ({
          name: typeof f === 'string' ? f : f.name,
          size: f?.size || 0,
          type: f?.type || '',
          url: `/api/submissions/${encodeURIComponent(s.id)}/files/${idx}`,
        })),
      })),
      progress: session.isAdmin ? store.progress : Object.fromEntries(Object.entries(store.progress).filter(([key]) => key.startsWith(`${session.user.email}:`))),
      quizzes: {},
      students: session.isAdmin ? store.students : [],
      tribute: session.isAdmin ? store.tribute : { productTitle: store.tribute.productTitle, productPrice: store.tribute.productPrice },
      adminBot: session.isAdmin ? store.adminBot : {},
    });
  }

  if (pathname === '/api/progress') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 32768) || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    const pKey = String(payload.key || '');
    const lessonId = String(payload.lessonId || '');
    if (pKey && lessonId) {
      const list = store.progress[pKey] || [];
      if (!list.includes(lessonId)) list.push(lessonId);
      store.progress[pKey] = list;
      saveStore();
    }
    return json(res, 200, { ok: true, progress: store.progress[pKey] || [] });
  }

  if (pathname === '/api/submissions') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 25 * 1024 * 1024) || '{}');
    } catch (err) {
      if (err.status === 413) return json(res, 413, { error: 'File too large (maximum 15 MB)' });
      return json(res, 400, { error: 'Invalid JSON body' });
    }

    const subId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const uploadedFiles = [];
    const incomingFiles = Array.isArray(payload.files) ? payload.files : [];
    ensureDirs();

    for (let i = 0; i < incomingFiles.length; i++) {
      const item = incomingFiles[i];
      if (!item || !item.name) continue;
      const safeName = path.basename(String(item.name)).replace(/[^a-zA-Z0-9._-\u0400-\u04FF]/g, '_');
      const storedName = `${subId}_${i}_${safeName}`;
      if (item.dataBase64) {
        const base64Clean = String(item.dataBase64).replace(/^data:[^;]+;base64,/, '');
        const buf = Buffer.from(base64Clean, 'base64');
        fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buf);
        uploadedFiles.push({
          name: item.name,
          type: item.type || 'application/octet-stream',
          size: buf.length,
          storedName,
        });
      } else {
        uploadedFiles.push({
          name: item.name,
          type: item.type || 'application/octet-stream',
          size: item.size || 0,
          storedName: null,
        });
      }
    }

    const submission = {
      id: subId,
      studentId: session.user.id,
      student: session.user.email || 'student@him.edu',
      name: session.user.name || 'Student',
      passwordCode: session.user.passwordCode || null,
      telegramId: session.user.telegramId || null,
      institutionId: 'him-001',
      courseId: 'contemporary-horeca-scene',
      edition: 2026,
      moduleId: payload.moduleId || 'final',
      lessonId: payload.lessonId || 'final-brief',
      assignment: String(payload.assignment || 'Practical Assignment'),
      answer: String(payload.answer || ''),
      link: String(payload.link || ''),
      files: uploadedFiles,
      date: new Date().toISOString(),
      status: 'WAITING FOR REVIEW',
      feedback: null,
    };

    /* Replace previous waiting submission for the same student + lesson if revising */
    store.submissions = store.submissions.filter(
      s => !(s.student === submission.student && s.lessonId === submission.lessonId && s.status !== 'APPROVED')
    );
    store.submissions.push(submission);
    saveStore();

    notifyAdminsOnSubmission(submission);

    return json(res, 200, {
      ok: true,
      submission: {
        ...submission,
        files: uploadedFiles.map((f, idx) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          url: `/api/submissions/${encodeURIComponent(subId)}/files/${idx}`,
        })),
      },
    });
  }

  /* Download/view uploaded submission file */
  const fileMatch = pathname.match(/^\/api\/submissions\/([^/]+)\/files\/(\d+)$/);
  if (fileMatch && req.method === 'GET') {
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    const [, subId, idxStr] = fileMatch;
    const sub = store.submissions.find(s => s.id === subId);
    if (!sub || (!session.isAdmin && sub.student !== session.user.email && sub.studentId !== session.user.id)) return json(res, 403, { error: 'File access denied' });
    const fileMeta = sub?.files?.[Number(idxStr)];
    if (!fileMeta || !fileMeta.storedName) return respond(res, 404, 'File not found on server');
    const diskPath = path.join(UPLOAD_DIR, path.basename(fileMeta.storedName));
    if (!fs.existsSync(diskPath)) return respond(res, 404, 'File missing');
    const stat = fs.statSync(diskPath);
    res.writeHead(200, {
      'Content-Type': fileMeta.type || 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(fileMeta.name)}"`,
      'X-Content-Type-Options': 'nosniff',
    });
    return fs.createReadStream(diskPath).pipe(res);
  }

  /* --- 4. Admin Review, Password Management & Bot Console API --- */
  if (pathname === '/api/admin/review') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session || !session.isAdmin) return json(res, 403, { error: 'Administrator access required' });
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 65536) || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    if (!String(payload.feedback || '').trim()) return json(res, 400, { error: 'Written feedback is required' });
    const result = applyAdminReview({
      submissionId: payload.submissionId,
      decision: payload.decision,
      feedbackText: payload.feedback,
      score: payload.score,
      via: payload.via || 'admin-panel',
    });
    if (result.error) return json(res, 404, result);
    return json(res, 200, result);
  }

  if (pathname === '/api/admin/students') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session || !session.isAdmin) return json(res, 403, { error: 'Administrator access required' });
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 65536) || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    if (payload.action === 'generate') {
      const requestedEmail = String(payload.email || '').trim().toLowerCase();
      if (requestedEmail && store.students.some(s => s.email.toLowerCase() === requestedEmail)) {
        return json(res, 409, { error: 'A personal password already exists for this email.' });
      }
      const student = createStudentPassword({
        name: payload.name || 'Student',
        email: requestedEmail,
        telegramUsername: payload.telegram || '',
        source: 'admin-panel',
      });
      addBotLog('admin', `Personal password ${student.password} generated for ${student.name}`);
      return json(res, 200, { ok: true, student, students: store.students });
    }
    if (payload.action === 'reset-binding') {
      const stu = store.students.find(s => s.id === payload.studentId || s.password === payload.password);
      if (stu) {
        stu.boundClientId = null;
        stu.boundAt = null;
        saveStore();
        addBotLog('admin', `Device assignment reset for password ${stu.password}`);
      }
      return json(res, 200, { ok: true, students: store.students });
    }
    if (payload.action === 'revoke') {
      const stu = store.students.find(s => s.id === payload.studentId || s.password === payload.password);
      if (stu) {
        stu.active = false;
        saveStore();
        addBotLog('admin', `Password revoked: ${stu.password} (${stu.name})`);
      }
      return json(res, 200, { ok: true, students: store.students });
    }
    return json(res, 400, { error: 'Unknown action' });
  }

  if (pathname === '/api/admin/bot-command') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session || !session.isAdmin) return json(res, 403, { error: 'Administrator access required' });
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 32768) || '{}');
    } catch {
      return json(res, 400, { error: 'Invalid JSON' });
    }
    const out = executeBotCommand(payload.command);
    return json(res, 200, { ...out, logs: store.adminBot.logs, students: store.students, submissions: store.submissions });
  }

  /* --- 5. Telegram Mini App Auth --- */
  if (pathname === '/api/telegram-auth') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    if (!process.env.BOT_TOKEN) return json(res, 503, { error: 'Telegram authentication is not configured' });
    try {
      const body = await readBody(req, 32768);
      const profile = verifyTelegramInitData(JSON.parse(body).initData);
      if (!profile) return json(res, 401, { error: 'Invalid or expired Telegram session' });
      return json(res, 200, { user: profile });
    } catch {
      return json(res, 400, { error: 'Invalid request body' });
    }
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
      'Cache-Control': ext === '.html' || pathname === '/course-data.js' ? 'no-cache' : 'public, max-age=300',
      'Content-Length': stat.size,
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Contemporary Horeca Scene listening on http://${HOST}:${PORT}`);
  console.log(`Course access: ${PASSWORDS.length} master password(s) + ${store.students.length} personal Tribute/Admin password(s)`);
});

server.on('error', error => {
  console.error('Unable to start the web app:', error.message);
  process.exitCode = 1;
});
