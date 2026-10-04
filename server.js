'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

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
const PASSWORDS = (process.env.COURSE_PASSWORDS || process.env.COURSE_PASSWORD || '')
  .split(/[\s,;]+/).map(value => value.trim()).filter(Boolean);
const ACCESS_SECRET = process.env.ACCESS_SECRET || crypto.randomBytes(32).toString('hex');
const ACCESS_COOKIE = 'chs_access';
const ACCESS_TTL = 60 * 60 * 24 * 30; // 30 days
const PROTECTED = ['/course-data.js', '/course/', '/presentation/dist/', '/presentation/build/'];

/* Tribute sends signed HTTPS webhooks to this service; it does not issue a bot command. */
const TRIBUTE_API_KEY = process.env.TRIBUTE_API_KEY || '';
const TRIBUTE_PRODUCT_ID = String(process.env.TRIBUTE_PRODUCT_ID || '').trim();
const TRIBUTE_SUBSCRIPTION_ID = String(process.env.TRIBUTE_SUBSCRIPTION_ID || '').trim();
const TRIBUTE_PRODUCT_TITLE = process.env.TRIBUTE_PRODUCT_TITLE || 'Contemporary Horeca Scene · 2026 Edition';
const TRIBUTE_PRICE = process.env.TRIBUTE_PRICE || '';
const TRIBUTE_PRODUCT_PRICE = process.env.TRIBUTE_PRODUCT_PRICE || TRIBUTE_PRICE;
const TRIBUTE_SUBSCRIPTION_PRICE = process.env.TRIBUTE_SUBSCRIPTION_PRICE || TRIBUTE_PRICE;
const legacyTributePaymentUrl = String(
  process.env.TRIBUTE_PRODUCT_URL || process.env.TRIBUTE_INTERNAL_PAYMENT_URL || process.env.TRIBUTE_PAYMENT_URL || ''
).trim();
const TRIBUTE_PRODUCT_URL = String(TRIBUTE_PRODUCT_ID ? legacyTributePaymentUrl : '').trim();
const TRIBUTE_SUBSCRIPTION_URL = String(
  TRIBUTE_SUBSCRIPTION_ID
    ? (process.env.TRIBUTE_SUBSCRIPTION_URL || process.env.TRIBUTE_SUBSCRIPTION_PAYMENT_URL || (!TRIBUTE_PRODUCT_ID ? legacyTributePaymentUrl : ''))
    : ''
).trim();
const BOT_USERNAME = String(process.env.BOT_USERNAME || '').trim().replace(/^@/, '');
const BOT_START_URL = /^[A-Za-z0-9_]{5,32}$/.test(BOT_USERNAME)
  ? `https://t.me/${BOT_USERNAME}?start=course`
  : '';
const COURSE_URL = String(process.env.COURSE_URL || '').trim();
const TRIBUTE_WEBHOOK_PATH = '/api/tribute/webhook';

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

/* The admin bot edits course content by block; resolve blocks from the shipped course data. */
function loadCourseModules() {
  try {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'course-data.js'), 'utf8'), context);
    const modules = context.window?.COURSE?.modules || [];
    return modules.map(m => ({
      id: String(m.id || ''),
      number: String(m.number || ''),
      title: String(m.title || ''),
      lessons: (m.lessons || []).map(l => ({ id: String(l.id || ''), title: String(l.title || '') })),
    }));
  } catch (err) {
    console.warn('Could not read course-data.js for editor block resolution:', err.message);
    return [];
  }
}
const COURSE_MODULES = loadCourseModules();
const EDITOR_MODULE_FIELDS = ['description', 'title'];
const EDITOR_LESSON_FIELDS = ['intro', 'body', 'challenge', 'title'];

function resolveCourseBlock(token) {
  const raw = String(token || '').trim().toLowerCase();
  if (!raw) return null;
  const bare = raw.replace(/^module[-\s]?/, '').replace(/^0+(?=\d)/, '');
  return COURSE_MODULES.find(m => (
    m.id.toLowerCase() === raw
    || m.number.toLowerCase() === raw
    || String(Number(m.number)) === bare
  )) || COURSE_MODULES.find(m => m.lessons.some(l => l.id.toLowerCase() === raw)) || null;
}

function resolveCourseLesson(token) {
  const raw = String(token || '').trim().toLowerCase();
  if (!raw) return null;
  for (const m of COURSE_MODULES) {
    const lesson = m.lessons.find(l => l.id.toLowerCase() === raw);
    if (lesson) return { module: m, lesson };
  }
  return null;
}

const editorId = prefix => `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`;

function validHttpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

/* --- persistent store (passwords, submissions, Tribute purchases, Admin Bot) --- */
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
    tribute: { orders: [] },
    editor: { materials: [], posts: [], overrides: [] },
    adminBot: {
      adminChatIds: [...ADMIN_IDS],
      logs: [
        {
          id: 'log-boot',
          at: new Date().toISOString(),
          type: 'system',
          text: 'Access Bot ready. Admin commands: /pending, /approve <id> <feedback>, /revise <id> <feedback>, /students, /orders, /resend <telegram_id>; editor: /addmat, /materials, /post, /editmodule, /editlesson, /overrides'
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
      const oldOrders = Array.isArray(parsed.tribute?.orders) ? parsed.tribute.orders : [];
      const demoStudentIds = new Set(oldOrders
        .filter(order => order.status === 'PAID_STUB')
        .map(order => order.studentId).filter(Boolean));
      const students = (Array.isArray(parsed.students) ? parsed.students : []).map(student => {
        const hasPaidProduct = oldOrders.some(order => (
          order.studentId === student.id
          && order.kind === 'digital-product'
          && order.status === 'PAID'
        ));
        const hasPaidSubscription = oldOrders.some(order => (
          order.studentId === student.id
          && order.kind === 'subscription'
          && order.status === 'PAID'
          && ['new_subscription', 'renewed_subscription'].includes(order.eventName)
        ));
        if (demoStudentIds.has(student.id)) {
          return { ...student, active: false, revokedReason: 'Legacy test checkout was removed.' };
        }
        if (!hasPaidProduct && !hasPaidSubscription && student.active !== false) {
          return { ...student, active: false, revokedReason: 'A confirmed Tribute payment is required for course access.' };
        }
        return student;
      });
      const orders = oldOrders.map(order => {
        if (order.status !== 'PAID_STUB') return order;
        const { passwordIssued, ...rest } = order;
        return { ...rest, status: 'TEST_ORDER_REVOKED', deliveryStatus: 'NOT_DELIVERED' };
      });
      const submissions = (Array.isArray(parsed.submissions) ? parsed.submissions : []).map(submission => {
        if (!submission || typeof submission !== 'object') return submission;
        const { passwordCode, ...safeSubmission } = submission;
        return safeSubmission;
      });
      const logs = Array.isArray(parsed.adminBot?.logs)
        ? parsed.adminBot.logs.filter(log => !/demo checkout completed/i.test(log.text || ''))
        : def.adminBot.logs;
      return {
        ...def,
        ...parsed,
        students,
        submissions,
        tribute: { orders },
        editor: {
          materials: Array.isArray(parsed.editor?.materials) ? parsed.editor.materials : [],
          posts: Array.isArray(parsed.editor?.posts) ? parsed.editor.posts : [],
          overrides: Array.isArray(parsed.editor?.overrides) ? parsed.editor.overrides : [],
        },
        adminBot: {
          ...def.adminBot,
          ...(parsed.adminBot || {}),
          adminChatIds: [...new Set([...(parsed.adminBot?.adminChatIds || []), ...ADMIN_IDS])],
          logs,
        },
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

function configuredHttpsUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function getTributeStatus(includeOrders = false) {
  const productUrl = configuredHttpsUrl(TRIBUTE_PRODUCT_URL);
  const subscriptionUrl = configuredHttpsUrl(TRIBUTE_SUBSCRIPTION_URL);
  const courseUrl = configuredHttpsUrl(COURSE_URL);
  const botConfigured = Boolean(process.env.BOT_TOKEN);
  const productCheckoutReady = Boolean(TRIBUTE_PRODUCT_ID && productUrl);
  const subscriptionCheckoutReady = Boolean(TRIBUTE_SUBSCRIPTION_ID && subscriptionUrl);
  const productConfigured = productCheckoutReady || subscriptionCheckoutReady;
  const webhookConfigured = Boolean(TRIBUTE_API_KEY);
  const paymentConfigured = productCheckoutReady || subscriptionCheckoutReady;
  const deliveryReady = Boolean(paymentConfigured && webhookConfigured && botConfigured && BOT_START_URL);
  const status = {
    mode: deliveryReady ? 'ready' : 'not-configured',
    productTitle: TRIBUTE_PRODUCT_TITLE,
    productPrice: TRIBUTE_PRODUCT_PRICE,
    subscriptionPrice: TRIBUTE_SUBSCRIPTION_PRICE,
    productId: TRIBUTE_PRODUCT_ID,
    subscriptionId: TRIBUTE_SUBSCRIPTION_ID,
    productUrl,
    subscriptionUrl,
    productCheckoutReady,
    subscriptionCheckoutReady,
    botStartUrl: BOT_START_URL,
    courseUrl,
    webhookEndpoint: TRIBUTE_WEBHOOK_PATH,
    paymentConfigured,
    productConfigured,
    webhookConfigured,
    botConfigured,
    botUsernameConfigured: Boolean(BOT_START_URL),
    deliveryReady,
    ordersCount: store.tribute.orders.length,
    paidOrdersCount: store.tribute.orders.filter(order => order.status === 'PAID').length,
    pendingDeliveriesCount: store.tribute.orders.filter(order => order.status === 'PAID' && order.deliveryStatus !== 'DELIVERED').length,
  };
  if (includeOrders) {
    status.orders = store.tribute.orders.slice(0, 20).map(order => ({
      id: order.id,
      kind: order.kind,
      eventName: order.eventName,
      productTitle: order.productTitle,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      telegramId: order.telegramId,
      telegramUsername: order.telegramUsername,
      amount: order.amount,
      status: order.status,
      deliveryStatus: order.deliveryStatus,
      createdAt: order.createdAt,
      studentId: order.studentId,
    }));
  }
  return status;
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

function createStudentPassword({
  name, email, telegramId, telegramUsername, tributeUserId,
  source = 'tribute-product', tributeOrderId = null, clientId = null,
}) {
  const password = generatePersonalPassword();
  const cleanTelegramId = telegramId ? String(telegramId) : null;
  const cleanEmail = String(email || '').trim().toLowerCase()
    || (cleanTelegramId ? `telegram-${cleanTelegramId}@tribute.local` : `student-${password.toLowerCase()}@chs.local`);
  const cleanUsername = String(telegramUsername || '').trim().replace(/^@/, '') || null;
  const cleanName = String(name || '').trim() || (cleanUsername ? `@${cleanUsername}` : cleanEmail.split('@')[0]);
  const student = {
    id: `stu-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    password,
    name: cleanName,
    email: cleanEmail,
    role: 'STUDENT',
    institutionId: 'him-001',
    telegramId: cleanTelegramId,
    telegramUsername: cleanUsername,
    tributeUserId: tributeUserId ? String(tributeUserId) : null,
    boundClientId: clientId || null,
    boundAt: clientId ? new Date().toISOString() : null,
    source,
    tributeOrderId,
    subscriptionId: null,
    subscriptionExpiresAt: null,
    subscriptionStatus: null,
    passwordDeliveryStatus: cleanTelegramId ? 'PENDING' : 'NOT_AVAILABLE',
    passwordDeliveredAt: null,
    passwordDeliveryAttempts: 0,
    unlockedLessons: [...ALL_LESSON_IDS],
    completedLessons: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
  store.students.unshift(student);
  saveStore();
  return student;
}

function studentHasPaidDigitalAccess(student) {
  return store.tribute.orders.some(order => (
    order.studentId === student.id
    && order.kind === 'digital-product'
    && order.status === 'PAID'
  ));
}

function isStudentAccessActive(student) {
  if (!student || student.active === false) return false;
  if (student.subscriptionExpiresAt && !studentHasPaidDigitalAccess(student)) {
    const expiry = Date.parse(student.subscriptionExpiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) return false;
  }
  return true;
}

function adminStudentSummary(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    active: isStudentAccessActive(student),
    telegramId: student.telegramId || null,
    telegramUsername: student.telegramUsername || null,
    source: student.source || 'unknown',
    passwordDeliveryStatus: student.passwordDeliveryStatus || 'UNKNOWN',
    passwordDeliveredAt: student.passwordDeliveredAt || null,
    subscriptionStatus: student.subscriptionStatus || null,
    subscriptionExpiresAt: student.subscriptionExpiresAt || null,
    deviceBound: Boolean(student.boundClientId),
    createdAt: student.createdAt || null,
  };
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
        unlockedLessons: [...ALL_LESSON_IDS],
      },
    };
  }
  const student = store.students.find(s => s.id === parsed.subject);
  if (!isStudentAccessActive(student)) return null;
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

/* --- Telegram Admin / Access Bot ----------------------------------------- */
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

async function sendTelegramMessage(chatId, text, replyMarkup = undefined) {
  if (!process.env.BOT_TOKEN || !chatId) return false;
  try {
    const body = { chat_id: chatId, text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => null);
    return Boolean(response.ok && result?.ok === true);
  } catch {
    return false;
  }
}

function paymentKeyboard() {
  const status = getTributeStatus();
  if (!status.deliveryReady) return undefined;
  const buttons = [];
  if (status.productCheckoutReady) buttons.push({ text: 'Buy lifetime course access · Tribute', url: status.productUrl });
  if (status.subscriptionCheckoutReady) buttons.push({ text: 'Start course subscription · Tribute', url: status.subscriptionUrl });
  return buttons.length ? { inline_keyboard: buttons.map(button => [button]) } : undefined;
}

function courseKeyboard() {
  const url = configuredHttpsUrl(COURSE_URL);
  return url ? { inline_keyboard: [[{ text: 'Open the course', url }]] } : undefined;
}

function findStudentByTelegramId(telegramId, includeRevoked = false) {
  const id = String(telegramId || '');
  if (!id) return null;
  return store.students.find(student => (
    String(student.telegramId || '') === id
    && (includeRevoked || student.active !== false)
  )) || null;
}

function individualPasswordMessage(student) {
  const courseLink = configuredHttpsUrl(COURSE_URL);
  return [
    '🎉 <b>Tribute confirmed your Contemporary Horeca Scene purchase.</b>',
    '',
    'Your individual course password:',
    `<code>${escapeHtml(student.password)}</code>`,
    '',
    'Enter this password on the course access screen. It is for your personal use; keep it private.',
    'Send /password in this chat whenever you need to retrieve it again.',
    courseLink ? `\n<a href="${escapeHtml(courseLink)}">Open the course</a>` : '',
  ].filter(Boolean).join('\n');
}

async function sendStudentPassword(student, { force = false } = {}) {
  if (!student?.telegramId || !process.env.BOT_TOKEN || !isStudentAccessActive(student)) return false;
  if (!force && student.passwordDeliveryStatus === 'DELIVERED') return true;
  const sent = await sendTelegramMessage(student.telegramId, individualPasswordMessage(student), courseKeyboard());
  student.passwordDeliveryAttempts = (Number(student.passwordDeliveryAttempts) || 0) + 1;
  student.passwordDeliveryStatus = sent ? 'DELIVERED' : 'PENDING';
  student.passwordDeliveredAt = sent ? new Date().toISOString() : student.passwordDeliveredAt || null;
  student.passwordDeliveryUpdatedAt = new Date().toISOString();
  if (sent) {
    for (const order of store.tribute.orders) {
      if (order.studentId === student.id && order.status === 'PAID' && order.deliveryStatus !== 'DELIVERED') {
        order.deliveryStatus = 'DELIVERED';
        order.deliveryUpdatedAt = student.passwordDeliveryUpdatedAt;
      }
    }
  }
  saveStore();
  return sent;
}

async function deliverTributeOrder(order, student, { force = false, resendPassword = false } = {}) {
  if (!order || !student) return false;
  if (!force && order.deliveryStatus === 'DELIVERED') return true;

  let sent;
  const isRenewal = order.kind === 'subscription' && order.eventName === 'renewed_subscription';
  if (isRenewal && !resendPassword && student.passwordDeliveryStatus === 'DELIVERED') {
    const expiry = student.subscriptionExpiresAt ? new Date(student.subscriptionExpiresAt).toLocaleDateString('en-GB') : 'the current billing period';
    sent = await sendTelegramMessage(
      student.telegramId,
      `✅ <b>Your Contemporary Horeca Scene subscription has renewed.</b>\nAccess is active until ${escapeHtml(expiry)}. Send /password if you need your individual course password again.`,
      courseKeyboard(),
    );
  } else {
    sent = await sendStudentPassword(student, { force: true });
  }

  order.deliveryAttempts = (Number(order.deliveryAttempts) || 0) + 1;
  order.deliveryStatus = sent ? 'DELIVERED' : 'PENDING';
  order.deliveryUpdatedAt = new Date().toISOString();
  saveStore();
  if (!sent) {
    addBotLog('tribute-delivery', `Payment ${order.id}: password delivery is pending for Telegram user ${order.telegramId || 'unknown'}; the buyer may need to start the Access Bot.`);
    const notice = `⚠️ Tribute payment confirmed, but the password message could not be delivered.\nOrder: <code>${escapeHtml(order.id)}</code>\nBuyer: ${escapeHtml(order.buyerName || 'Telegram buyer')} · ID <code>${escapeHtml(order.telegramId || 'unknown')}</code>\nAsk the buyer to open the Access Bot and send /start; use /resend ${escapeHtml(order.telegramId || '')} if needed.`;
    for (const adminId of store.adminBot.adminChatIds) await sendTelegramMessage(adminId, notice);
  }
  return sent;
}

function tributeOrderForStudent(studentId) {
  return store.tribute.orders.find(order => order.studentId === studentId && order.status === 'PAID') || null;
}

/* Payment transparency: the learner sees their own verified purchase record in the profile. */
function publicPurchase(order) {
  if (!order) return null;
  return {
    purchaseId: order.purchaseId || order.transactionId || order.id,
    productTitle: order.productTitle,
    amount: order.amount,
    paidAt: order.createdAt,
    status: order.status,
    deliveryStatus: order.deliveryStatus,
    provider: 'Tribute · Telegram checkout',
    buyer: order.buyerName || null,
  };
}

async function handleAccessBotMessage(message) {
  const chatId = String(message?.chat?.id || '');
  const senderId = String(message?.from?.id || chatId);
  const text = String(message?.text || '').trim();
  if (!chatId || !text || message.chat?.type !== 'private') return;

  const command = text.split(/\s+/)[0].split('@')[0].toLowerCase();
  const student = findStudentByTelegramId(senderId, true);
  if (command === '/start') {
    if (student && isStudentAccessActive(student)) {
      const pendingOrder = store.tribute.orders.find(order => (
        order.studentId === student.id && order.status === 'PAID' && order.deliveryStatus !== 'DELIVERED'
      ));
      if (pendingOrder) {
        await deliverTributeOrder(pendingOrder, student, { force: true, resendPassword: true });
        return;
      }
      await sendTelegramMessage(
        chatId,
        `Welcome back, ${escapeHtml(student.name)}. Your course access is active. Send /password to receive your individual code again.`,
        courseKeyboard(),
      );
      return;
    }
    if (student?.subscriptionExpiresAt && student.active !== false) {
      const messageText = `Your course subscription expired on ${escapeHtml(new Date(student.subscriptionExpiresAt).toLocaleDateString('en-GB'))}. Renew through Tribute to restore access.`;
      await sendTelegramMessage(chatId, messageText, paymentKeyboard());
      return;
    }
    const keyboard = paymentKeyboard();
    const messageText = keyboard
      ? 'Welcome to Contemporary Horeca Scene. Start here: pay securely inside Telegram with Tribute, and I will send your individual course password to this chat as soon as the payment is confirmed. Keep this chat open.'
      : 'Welcome to Contemporary Horeca Scene. Automatic Tribute checkout is being configured. Please check back soon or contact the course team.';
    await sendTelegramMessage(chatId, messageText, keyboard);
    return;
  }

  if (command === '/password') {
    if (!student || !isStudentAccessActive(student)) {
      if (student?.subscriptionExpiresAt && student.active !== false) {
        await sendTelegramMessage(chatId, `Your subscription expired on ${escapeHtml(new Date(student.subscriptionExpiresAt).toLocaleDateString('en-GB'))}. Renew through Tribute to restore access.`, paymentKeyboard());
      } else {
        await sendTelegramMessage(chatId, 'No active Tribute purchase is linked to this Telegram account yet. If you have just paid, wait for confirmation and send /password again.');
      }
      return;
    }
    const sent = await sendStudentPassword(student, { force: true });
    if (!sent) await sendTelegramMessage(chatId, 'I could not deliver your password just now. Please try again in a moment or contact the course team.');
    return;
  }

  if (command === '/help') {
    await sendTelegramMessage(chatId, 'I send your individual course password after Tribute confirms payment. Use /password to retrieve it again. To purchase, send /start.');
    return;
  }

  await sendTelegramMessage(chatId, 'Use /start to purchase course access or /password to retrieve a password already issued to this Telegram account.');
}

async function notifyAdminsOnSubmission(submission) {
  const fileNames = (submission.files || []).map(f => f.name).join(', ') || 'No files';
  const summary = `📩 <b>New submission: ${submission.assignment}</b>\nStudent: ${submission.name} (${submission.student})\nFiles: ${fileNames}\nID: <code>${submission.id}</code>\n\nAnswer:\n${submission.answer.slice(0, 600)}`;
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
    const stu = store.students.find(s => s.id === sub.studentId || s.email === sub.student);
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

async function executeBotCommand(rawCommand) {
  const cmdLine = String(rawCommand || '').trim();
  if (!cmdLine) return { ok: false, reply: 'Enter a command, for example: /pending, /orders, /resend <telegram_id>, /approve <id> <feedback>, /revise <id> <feedback>, /students' };
  const [cmdToken, ...args] = cmdLine.split(/\s+/);
  const command = cmdToken.split('@')[0].toLowerCase();

  if (command === '/start' || command === '/help') {
    const reply = [
      '🤖 <b>Contemporary Horeca Scene Admin Bot</b>',
      'Available commands:',
      '• <code>/pending</code> — list submissions awaiting review',
      '• <code>/approve &lt;id&gt; &lt;feedback&gt;</code> — approve an assignment and send feedback to the student',
      '• <code>/revise &lt;id&gt; &lt;feedback&gt;</code> — request a revision with feedback',
      '• <code>/students</code> — list paid learners and password-delivery status',
      '• <code>/orders</code> — inspect recent Tribute payments and delivery status',
      '• <code>/resend &lt;telegram_id&gt;</code> — resend the paid learner’s password',
      '• <code>/addmat &lt;module&gt; &lt;https url&gt; &lt;description&gt;</code> — add material to the end of a module block',
      '• <code>/materials [module]</code> · <code>/editmat &lt;id&gt; [url] &lt;description&gt;</code> · <code>/delmat &lt;id&gt;</code> — manage the library',
      '• <code>/post &lt;title&gt; | &lt;text&gt;</code> · <code>/posts</code> · <code>/delpost &lt;id&gt;</code> — publish course updates',
      '• <code>/editmodule &lt;module&gt; [field] &lt;text&gt;</code> · <code>/editlesson &lt;lesson&gt; [field] &lt;text&gt;</code> — edit course copy',
      '• <code>/overrides</code> · <code>/revert &lt;id&gt;</code> — review or undo copy edits',
    ].join('\n');
    addBotLog('command', `${cmdLine} → admin help displayed`);
    return { ok: true, reply };
  }

  if (command === '/pending') {
    const waiting = store.submissions.filter(submission => submission.status === 'WAITING FOR REVIEW');
    if (!waiting.length) {
      addBotLog('command', '/pending → 0 submissions');
      return { ok: true, reply: 'No submissions are awaiting review.' };
    }
    const reply = waiting.map(submission => (
      `• <code>${escapeHtml(submission.id)}</code> | ${escapeHtml(submission.name)} (${escapeHtml(submission.student)}) — ${escapeHtml(submission.assignment)} [Files: ${escapeHtml((submission.files || []).map(file => file.name).join(', ') || 'none')}]`
    )).join('\n');
    addBotLog('command', `/pending → ${waiting.length} submissions found`);
    return { ok: true, reply };
  }

  if (command === '/students') {
    const learners = store.students.filter(student => student.source?.startsWith('tribute-'));
    if (!learners.length) return { ok: true, reply: 'No Tribute-paid learners have been recorded yet.' };
    const reply = learners.slice(0, 20).map(student => (
      `• ${escapeHtml(student.name)} (${escapeHtml(student.email)}) · ${isStudentAccessActive(student) ? 'ACTIVE' : 'INACTIVE'} · delivery ${escapeHtml(student.passwordDeliveryStatus || 'UNKNOWN')} · Telegram ${escapeHtml(student.telegramId || 'not linked')}`
    )).join('\n');
    addBotLog('command', `/students → ${learners.length} paid learner records`);
    return { ok: true, reply };
  }

  if (command === '/orders') {
    if (!store.tribute.orders.length) return { ok: true, reply: 'No Tribute payment events have been received yet.' };
    const reply = store.tribute.orders.slice(0, 15).map(order => (
      `• <code>${escapeHtml(order.id)}</code> · ${escapeHtml(order.buyerName || 'Telegram buyer')} · ${escapeHtml(order.status)} / ${escapeHtml(order.deliveryStatus || '—')}`
    )).join('\n');
    addBotLog('command', `/orders → ${store.tribute.orders.length} payment events`);
    return { ok: true, reply };
  }

  if (command === '/resend') {
    const telegramId = String(args[0] || '').trim();
    if (!/^\d{4,20}$/.test(telegramId)) return { ok: false, reply: 'Usage: /resend <telegram_id>' };
    const student = findStudentByTelegramId(telegramId);
    if (!student || !isStudentAccessActive(student)) return { ok: false, reply: 'No active paid learner was found for that Telegram ID.' };
    const sent = await sendStudentPassword(student, { force: true });
    addBotLog('command', `/resend → password delivery ${sent ? 'succeeded' : 'failed'} for Telegram user ${telegramId}`);
    return { ok: sent, reply: sent ? `✅ The individual password was sent to Telegram user ${telegramId}.` : `Delivery failed. Ask the learner to open the Access Bot and send /start, then try /resend ${telegramId}.` };
  }

  if (command === '/addmat') {
    const [blockToken, urlToken, ...noteParts] = args;
    const note = noteParts.join(' ').trim();
    const block = resolveCourseBlock(blockToken);
    const url = validHttpsUrl(urlToken);
    if (!block || !url || !note) {
      return { ok: false, reply: 'Usage: /addmat <module> <https url> <short description>. Module: id (budget), number (09) or any lesson id inside it.' };
    }
    if (store.editor.materials.some(item => item.moduleId === block.id && item.url === url)) {
      return { ok: false, reply: 'This link already sits in the materials list of that module.' };
    }
    const material = {
      id: editorId('mat'),
      moduleId: block.id,
      moduleNumber: block.number,
      url,
      note,
      addedAt: new Date().toISOString(),
      updatedAt: null,
    };
    store.editor.materials.unshift(material);
    saveStore();
    addBotLog('editor', `/addmat → Module ${block.number}: ${note} (${url})`);
    return {
      ok: true,
      reply: `📚 Added to the end of Module ${block.number} (${escapeHtml(block.title)}):\n${escapeHtml(note)}\n${escapeHtml(url)}\nID: <code>${material.id}</code>`,
      material,
    };
  }

  if (command === '/editmat') {
    const [id, ...rest] = args;
    const material = store.editor.materials.find(item => item.id === id || item.id.startsWith(`${id}-`) || id === item.id.slice(4));
    if (!material) return { ok: false, reply: 'Material not found. Use /materials to list IDs.' };
    let url = material.url;
    let noteParts = rest;
    if (rest.length && validHttpsUrl(rest[0])) {
      url = validHttpsUrl(rest[0]);
      noteParts = rest.slice(1);
    }
    const note = noteParts.join(' ').trim();
    if (!note) return { ok: false, reply: 'Usage: /editmat <id> [new https url] <new description>.' };
    material.url = url;
    material.note = note;
    material.updatedAt = new Date().toISOString();
    saveStore();
    addBotLog('editor', `/editmat → ${material.id}: ${note}`);
    return { ok: true, reply: `✏️ Material <code>${material.id}</code> updated (Module ${material.moduleNumber}):\n${escapeHtml(note)}\n${escapeHtml(url)}`, material };
  }

  if (command === '/delmat') {
    const id = String(args[0] || '').trim();
    const index = store.editor.materials.findIndex(item => item.id === id);
    if (index === -1) return { ok: false, reply: 'Material not found. Use /materials to list IDs.' };
    const [removed] = store.editor.materials.splice(index, 1);
    saveStore();
    addBotLog('editor', `/delmat → removed ${removed.id} from Module ${removed.moduleNumber}`);
    return { ok: true, reply: `🗑 Removed from Module ${removed.moduleNumber}: ${escapeHtml(removed.note)}` };
  }

  if (command === '/materials') {
    const block = args[0] ? resolveCourseBlock(args[0]) : null;
    if (args[0] && !block) return { ok: false, reply: 'Unknown module. Use an id (budget), a number (09) or a lesson id.' };
    const items = block
      ? store.editor.materials.filter(item => item.moduleId === block.id)
      : store.editor.materials;
    if (!items.length) return { ok: true, reply: 'No additional materials yet. Add one: /addmat <module> <https url> <short description>.' };
    const reply = items.slice(0, 25).map(item => (
      `• <code>${item.id}</code> · M${item.moduleNumber} · ${escapeHtml(item.note)} · ${escapeHtml(item.url)}`
    )).join('\n');
    addBotLog('editor', `/materials → ${items.length} entries`);
    return { ok: true, reply };
  }

  if (command === '/post') {
    const rawText = args.join(' ');
    const [title, ...textParts] = rawText.split('|');
    const cleanTitle = String(title || '').trim();
    const text = textParts.join('|').trim();
    if (!cleanTitle || !text) return { ok: false, reply: 'Usage: /post <title> | <text>. The update appears on the course Updates page.' };
    const post = {
      id: editorId('post'),
      tag: 'LIVE COURSE UPDATE',
      title: cleanTitle,
      text,
      date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString(),
    };
    store.editor.posts.unshift(post);
    saveStore();
    addBotLog('editor', `/post → ${cleanTitle}`);
    return { ok: true, reply: `📣 Update published: <b>${escapeHtml(cleanTitle)}</b>\nID: <code>${post.id}</code>`, post };
  }

  if (command === '/posts') {
    if (!store.editor.posts.length) return { ok: true, reply: 'No live updates yet. Publish one: /post <title> | <text>.' };
    const reply = store.editor.posts.slice(0, 15).map(post => (
      `• <code>${post.id}</code> · ${escapeHtml(post.date)} · ${escapeHtml(post.title)}`
    )).join('\n');
    return { ok: true, reply };
  }

  if (command === '/delpost') {
    const id = String(args[0] || '').trim();
    const index = store.editor.posts.findIndex(item => item.id === id);
    if (index === -1) return { ok: false, reply: 'Update not found. Use /posts to list IDs.' };
    const [removed] = store.editor.posts.splice(index, 1);
    saveStore();
    addBotLog('editor', `/delpost → removed ${removed.id}`);
    return { ok: true, reply: `🗑 Update removed: ${escapeHtml(removed.title)}` };
  }

  if (command === '/editmodule' || command === '/editlesson') {
    const isModule = command === '/editmodule';
    const [targetToken, second, ...rest] = args;
    const fields = isModule ? EDITOR_MODULE_FIELDS : EDITOR_LESSON_FIELDS;
    const field = fields.includes(second) ? second : (isModule ? 'description' : 'body');
    const text = (fields.includes(second) ? rest : args.slice(1)).join(' ').trim();
    const target = isModule ? resolveCourseBlock(targetToken) : resolveCourseLesson(targetToken);
    if (!target || !text) {
      return {
        ok: false,
        reply: isModule
          ? 'Usage: /editmodule <module> [title|description] <new text>.'
          : 'Usage: /editlesson <lesson id> [title|intro|body|challenge] <new text>.',
      };
    }
    const scope = isModule ? 'module' : 'lesson';
    const targetId = isModule ? target.id : target.lesson.id;
    const label = isModule ? `Module ${target.number}` : `Lesson ${target.lesson.id}`;
    const previous = store.editor.overrides.find(item => item.scope === scope && item.targetId === targetId && item.field === field);
    if (previous) {
      previous.text = text;
      previous.updatedAt = new Date().toISOString();
      saveStore();
      addBotLog('editor', `${command} → ${label}.${field} updated (${previous.id})`);
      return { ok: true, reply: `✏️ ${label} · <b>${field}</b> updated.\nID: <code>${previous.id}</code> · undo with /revert ${previous.id}`, override: previous };
    }
    const override = {
      id: editorId('ovr'),
      scope,
      targetId,
      field,
      text,
      updatedAt: new Date().toISOString(),
    };
    store.editor.overrides.unshift(override);
    saveStore();
    addBotLog('editor', `${command} → ${label}.${field} edited (${override.id})`);
    return { ok: true, reply: `✏️ ${label} · <b>${field}</b> now reads:\n${escapeHtml(text.slice(0, 400))}\nID: <code>${override.id}</code> · undo with /revert ${override.id}`, override };
  }

  if (command === '/overrides') {
    if (!store.editor.overrides.length) return { ok: true, reply: 'No copy edits are active. The course reads exactly as published in course-data.js.' };
    const reply = store.editor.overrides.slice(0, 20).map(item => (
      `• <code>${item.id}</code> · ${item.scope} ${escapeHtml(item.targetId)} · ${escapeHtml(item.field)} · ${escapeHtml(item.text.slice(0, 80))}`
    )).join('\n');
    return { ok: true, reply };
  }

  if (command === '/revert') {
    const id = String(args[0] || '').trim();
    const index = store.editor.overrides.findIndex(item => item.id === id);
    if (index === -1) return { ok: false, reply: 'Override not found. Use /overrides to list IDs.' };
    const [removed] = store.editor.overrides.splice(index, 1);
    saveStore();
    addBotLog('editor', `/revert → ${removed.scope} ${removed.targetId}.${removed.field} back to published copy`);
    return { ok: true, reply: `↩️ Reverted ${removed.scope} <code>${escapeHtml(removed.targetId)}</code> · ${escapeHtml(removed.field)}. The published course copy is live again.` };
  }

  if (command === '/approve' || command === '/revise') {
    const subId = args[0];
    const feedbackText = args.slice(1).join(' ').trim();
    if (!subId || !feedbackText) return { ok: false, reply: `Usage: ${command} <submission_id> <feedback text>` };
    const decision = command === '/approve' ? 'APPROVED' : 'REVISION REQUESTED';
    const result = applyAdminReview({ submissionId: subId, decision, feedbackText, via: 'admin-bot' });
    if (result.error) return { ok: false, reply: `Error: submission ${escapeHtml(subId)} was not found.` };
    return {
      ok: true,
      reply: `✅ Status ${decision} saved for submission ${escapeHtml(subId)} (${escapeHtml(result.submission.name)}). Feedback sent to the student.`,
      submission: result.submission,
    };
  }

  return { ok: false, reply: `Unknown command: ${escapeHtml(command)}. Enter /help for the command list.` };
}

/* Telegram long polling handles both customer access and the private admin console. */
if (process.env.BOT_TOKEN) {
  let offset = 0;
  const pollTelegram = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates?timeout=15&offset=${offset}`);
      if (!response.ok) throw new Error(`Telegram polling returned ${response.status}`);
      const data = await response.json();
      if (data.ok === false) throw new Error(data.description || 'Telegram polling failed');
      for (const update of data.result || []) {
        if (Number.isSafeInteger(update.update_id)) offset = update.update_id + 1;
        const message = update.message;
        if (message?.text && message?.chat?.id) {
          const chatId = String(message.chat.id);
          const admin = store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId);
          const adminCommand = message.text.match(/^\/admin(?:@[A-Za-z0-9_]+)?\s+(.+)$/s);
          if (adminCommand) {
            if (matchesMasterPassword(adminCommand[1].trim())) {
              if (!store.adminBot.adminChatIds.includes(chatId)) {
                store.adminBot.adminChatIds.push(chatId);
                saveStore();
              }
              await sendTelegramMessage(chatId, '✅ You are authorised as an administrator for Contemporary Horeca Scene. Enter /help for the admin command list.');
            }
          } else if (admin) {
            const result = await executeBotCommand(message.text);
            await sendTelegramMessage(chatId, result.reply);
          } else {
            await handleAccessBotMessage(message);
          }
        }

        const callback = update.callback_query;
        if (callback?.data && callback?.message?.chat?.id) {
          const chatId = String(callback.message.chat.id);
          if (store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId)) {
            const [action, submissionId] = callback.data.split(':');
            if (action === 'approve') {
              const result = applyAdminReview({
                submissionId,
                decision: 'APPROVED',
                feedbackText: 'Great work! Your assignment has been approved through the Admin Bot.',
                via: 'admin-bot',
              });
              if (!result.error) await sendTelegramMessage(chatId, `✅ Submission ${escapeHtml(submissionId)} approved! To add detailed feedback: <code>/approve ${escapeHtml(submissionId)} your feedback</code>`);
            } else if (action === 'revise') {
              await sendTelegramMessage(chatId, `✏️ Send a command with your feedback:\n<code>/revise ${escapeHtml(submissionId)} what needs to change</code>`);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Telegram bot polling error:', error.message);
    }
    setTimeout(pollTelegram, 3000);
  };
  setTimeout(pollTelegram, 1500);
}

function tributeEventKey(eventName, payload, event) {
  if (eventName === 'new_digital_product' || eventName === 'digital_product_refunded') {
    const purchaseId = String(payload.purchase_id || '').trim();
    return purchaseId ? `${eventName === 'new_digital_product' ? 'digital' : 'refund'}:${purchaseId}` : '';
  }
  if (['new_subscription', 'renewed_subscription', 'cancelled_subscription'].includes(eventName)) {
    const subscriptionId = String(payload.subscription_id || '').trim();
    const periodRef = String(payload.period_id || payload.expires_at || event.created_at || event.sent_at || '').trim();
    return subscriptionId && periodRef ? `subscription:${eventName}:${subscriptionId}:${periodRef}` : '';
  }
  return '';
}

function findTributeStudent({ telegramId, tributeUserId, email, subscriptionId }) {
  return store.students.find(student => (
    student.active !== false
    && (
      (telegramId && String(student.telegramId || '') === telegramId)
      || (tributeUserId && String(student.tributeUserId || '') === tributeUserId)
      || (subscriptionId && String(student.subscriptionId || '') === subscriptionId)
      || (email && !student.telegramId && String(student.email || '').toLowerCase() === email)
    )
  )) || null;
}

function tributeOrderBase(eventName, payload, event, id, kind, student = null) {
  const telegramId = String(payload.telegram_user_id || payload.telegramId || '').trim() || null;
  const telegramUsername = String(payload.telegram_username || '').trim().replace(/^@/, '') || null;
  const fallbackPrice = kind.includes('subscription') ? TRIBUTE_SUBSCRIPTION_PRICE : TRIBUTE_PRODUCT_PRICE;
  const amount = payload.amount !== undefined && payload.amount !== null
    ? `${payload.amount} ${String(payload.currency || 'EUR').toUpperCase()}`
    : fallbackPrice;
  return {
    id,
    kind,
    eventName,
    productId: payload.product_id !== undefined ? String(payload.product_id) : null,
    subscriptionId: payload.subscription_id !== undefined ? String(payload.subscription_id) : null,
    periodId: payload.period_id !== undefined ? String(payload.period_id) : null,
    purchaseId: payload.purchase_id !== undefined ? String(payload.purchase_id) : null,
    transactionId: payload.transaction_id !== undefined ? String(payload.transaction_id) : null,
    productTitle: payload.product_name || payload.subscription_name || TRIBUTE_PRODUCT_TITLE,
    amount,
    buyerName: String(payload.user_name || payload.first_name || (telegramUsername ? `@${telegramUsername}` : 'Telegram learner')),
    buyerEmail: String(payload.email || student?.email || '').trim().toLowerCase(),
    telegramId,
    telegramUsername,
    tributeUserId: payload.trb_user_id !== undefined ? String(payload.trb_user_id) : null,
    studentId: student?.id || null,
    status: 'PAID',
    deliveryStatus: 'PENDING',
    deliveryAttempts: 0,
    createdAt: event.created_at || new Date().toISOString(),
  };
}

async function processTributeEvent(event) {
  const eventName = String(event.name || '').trim();
  const payload = event.payload && typeof event.payload === 'object' ? event.payload : null;
  if (!eventName || !payload) return { status: 400, body: { ok: false, error: 'Invalid Tribute webhook payload' } };

  const isDigitalEvent = ['new_digital_product', 'digital_product_refunded'].includes(eventName);
  const isSubscriptionEvent = ['new_subscription', 'renewed_subscription', 'cancelled_subscription'].includes(eventName);
  if (!isDigitalEvent && !isSubscriptionEvent) return { status: 200, body: { ok: true, ignored: true } };

  if (isSubscriptionEvent && eventName !== 'cancelled_subscription' && String(payload.type || '').toLowerCase() === 'trial') {
    return { status: 200, body: { ok: true, ignored: true, reason: 'trial-event' } };
  }

  const configuredId = isDigitalEvent ? TRIBUTE_PRODUCT_ID : TRIBUTE_SUBSCRIPTION_ID;
  const eventResourceId = String(isDigitalEvent ? payload.product_id || '' : payload.subscription_id || '').trim();
  if (!configuredId) return { status: 200, body: { ok: true, ignored: true, reason: 'product-id-not-configured' } };
  if (!eventResourceId) return { status: 400, body: { ok: false, error: 'Tribute product or subscription ID is missing' } };
  if (eventResourceId !== configuredId) return { status: 200, body: { ok: true, ignored: true, reason: 'different-product' } };

  const id = tributeEventKey(eventName, payload, event);
  if (!id) return { status: 400, body: { ok: false, error: 'A stable Tribute purchase, period or event ID is required' } };
  const previous = store.tribute.orders.find(order => order.id === id);
  if (previous) {
    if (previous.status === 'PAID' && previous.deliveryStatus !== 'DELIVERED') {
      const student = store.students.find(item => item.id === previous.studentId);
      if (student) await deliverTributeOrder(previous, student, { force: true, resendPassword: true });
    }
    return { status: 200, body: { ok: true, duplicate: true, deliveryStatus: previous.deliveryStatus || null } };
  }

  if (eventName === 'cancelled_subscription') {
    const telegramId = String(payload.telegram_user_id || payload.telegramId || '').trim();
    const tributeUserId = String(payload.trb_user_id || '').trim();
    const subscriptionId = String(payload.subscription_id || '').trim();
    const student = store.students.find(item => (
      item.active !== false
      && ((telegramId && String(item.telegramId || '') === telegramId)
        || (tributeUserId && String(item.tributeUserId || '') === tributeUserId)
        || (subscriptionId && String(item.subscriptionId || '') === subscriptionId))
    )) || null;
    const expiry = Date.parse(String(payload.expires_at || ''));
    if (student) {
      student.subscriptionId = subscriptionId || student.subscriptionId;
      if (Number.isFinite(expiry)) student.subscriptionExpiresAt = new Date(expiry).toISOString();
      student.subscriptionStatus = 'CANCELLED';
    }
    const order = {
      ...tributeOrderBase(eventName, payload, event, id, 'subscription-cancellation', student),
      status: 'CANCELLED',
      deliveryStatus: 'NOT_REQUIRED',
    };
    store.tribute.orders.unshift(order);
    saveStore();
    addBotLog('tribute', `Tribute subscription cancellation ${id} recorded${student ? ` for ${student.name}` : ' without a matching learner'}.`);
    if (student?.telegramId) {
      const accessUntil = student.subscriptionExpiresAt
        ? new Date(student.subscriptionExpiresAt).toLocaleDateString('en-GB')
        : 'the end of the current billing period';
      await sendTelegramMessage(student.telegramId, `Your subscription has been cancelled. Course access remains available until ${escapeHtml(accessUntil)}.`);
    }
    return { status: 200, body: { ok: true, cancelled: Boolean(student) } };
  }

  if (eventName === 'digital_product_refunded') {
    const purchaseId = String(payload.purchase_id || '').trim();
    const paidOrder = store.tribute.orders.find(order => order.kind === 'digital-product' && order.purchaseId === purchaseId);
    if (paidOrder) {
      paidOrder.status = 'REFUNDED';
      paidOrder.refundedAt = payload.refunded_at || event.created_at || new Date().toISOString();
    }
    const refundOrder = {
      id,
      kind: 'digital-product-refund',
      eventName,
      productId: String(payload.product_id),
      purchaseId,
      status: paidOrder ? 'REFUNDED' : 'REFUND_UNMATCHED',
      deliveryStatus: 'NOT_REQUIRED',
      studentId: paidOrder?.studentId || null,
      createdAt: event.created_at || new Date().toISOString(),
    };
    store.tribute.orders.unshift(refundOrder);
    const student = paidOrder ? store.students.find(item => item.id === paidOrder.studentId) : null;
    if (student) {
      const hasActiveSubscription = student.subscriptionExpiresAt && Date.parse(student.subscriptionExpiresAt) > Date.now();
      if (student.source.startsWith('tribute-') && !studentHasPaidDigitalAccess(student) && !hasActiveSubscription) {
        student.active = false;
        student.revokedReason = 'Tribute purchase refunded.';
      }
      if (!isStudentAccessActive(student) && student.telegramId) {
        await sendTelegramMessage(student.telegramId, 'A refund was recorded for your course purchase, so this password is no longer active. Please contact the course team if you believe this is a mistake.');
      }
    }
    saveStore();
    addBotLog('tribute', `Tribute refund ${id} recorded${student ? ` for ${student.name}` : ' without a matching purchase'}.`);
    return { status: 200, body: { ok: true, refunded: Boolean(paidOrder) } };
  }

  const telegramId = String(payload.telegram_user_id || payload.telegramId || '').trim();
  if (!/^\d{1,20}$/.test(telegramId)) {
    return { status: 400, body: { ok: false, error: 'A valid Tribute telegram_user_id is required for password delivery' } };
  }
  const telegramUsername = String(payload.telegram_username || '').trim().replace(/^@/, '') || null;
  const tributeUserId = String(payload.trb_user_id || '').trim() || null;
  const email = String(payload.email || '').trim().toLowerCase();
  const subscriptionId = isSubscriptionEvent ? String(payload.subscription_id) : null;
  let student = findTributeStudent({ telegramId, tributeUserId, email, subscriptionId });
  const buyerName = String(payload.user_name || payload.first_name || (telegramUsername ? `@${telegramUsername}` : 'Telegram learner'));

  if (isSubscriptionEvent) {
    const expiresAt = String(payload.expires_at || '').trim();
    const expiryTime = Date.parse(expiresAt);
    if (!Number.isFinite(expiryTime)) return { status: 400, body: { ok: false, error: 'A valid Tribute subscription expires_at value is required' } };
    if (!student) {
      student = createStudentPassword({
        name: buyerName,
        email,
        telegramId,
        telegramUsername,
        tributeUserId,
        source: 'tribute-subscription',
      });
    } else {
      student.telegramId = telegramId;
      if (telegramUsername) student.telegramUsername = telegramUsername;
      if (tributeUserId) student.tributeUserId = tributeUserId;
      if (email) student.email = email;
    }
    student.subscriptionId = subscriptionId;
    student.subscriptionExpiresAt = new Date(expiryTime).toISOString();
    student.subscriptionStatus = 'ACTIVE';
    student.active = true;
  } else {
    const purchaseId = String(payload.purchase_id || '').trim();
    const alreadyRefunded = store.tribute.orders.some(order => (
      order.kind === 'digital-product-refund' && order.purchaseId === purchaseId
    ));
    if (alreadyRefunded) {
      store.tribute.orders.unshift({
        ...tributeOrderBase(eventName, payload, event, id, 'digital-product'),
        status: 'REFUNDED',
        deliveryStatus: 'NOT_REQUIRED',
      });
      saveStore();
      addBotLog('tribute', `Tribute purchase ${id} was already refunded; no access password was issued.`);
      return { status: 200, body: { ok: true, refunded: true } };
    }
    if (!student) {
      student = createStudentPassword({
        name: buyerName,
        email,
        telegramId,
        telegramUsername,
        tributeUserId,
        source: 'tribute-product',
        tributeOrderId: id,
      });
    } else {
      student.telegramId = telegramId;
      if (telegramUsername) student.telegramUsername = telegramUsername;
      if (tributeUserId) student.tributeUserId = tributeUserId;
      if (email) student.email = email;
      student.active = true;
    }
  }

  const kind = isSubscriptionEvent ? 'subscription' : 'digital-product';
  const order = tributeOrderBase(eventName, payload, event, id, kind, student);
  store.tribute.orders.unshift(order);
  if (store.tribute.orders.length > 5000) store.tribute.orders.length = 5000;
  saveStore();
  addBotLog('tribute', `Tribute ${eventName} ${id} confirmed for ${student.name}; automatic password delivery started.`);
  await deliverTributeOrder(order, student, { force: true });
  return { status: 200, body: { ok: true, issued: true, deliveryStatus: order.deliveryStatus } };
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
        tribute: getTributeStatus(),
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
          unlockedLessons: [...ALL_LESSON_IDS],
        },
      }, { 'Set-Cookie': cookieHeader(token, req) });
    }

    /* Personal access is granted only by an issued password. */
    const personal = store.students.find(
      student => String(student.password || '').toUpperCase() === candidate.toUpperCase()
    );
    if (personal) {
      if (!isStudentAccessActive(personal)) {
        const expired = Boolean(personal.subscriptionExpiresAt && Date.parse(personal.subscriptionExpiresAt) <= Date.now());
        return json(res, 403, {
          unlocked: false,
          error: expired
            ? 'This subscription has expired. Renew your access through Tribute or contact the course team.'
            : 'This personal password is no longer active. Please contact the course team.',
        });
      }
      if (personal.boundClientId && personal.boundClientId !== clientId) {
        return json(res, 403, {
          unlocked: false,
          error: 'This personal password has already been activated on another device. Please contact the course team if you need to move it.',
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
          telegramId: personal.telegramId || null,
          telegramUsername: personal.telegramUsername || null,
          unlockedLessons: [...ALL_LESSON_IDS],
          completedLessons: personal.completedLessons || [],
        },
      }, { 'Set-Cookie': cookieHeader(token, req) });
    }

    return json(res, 401, {
      unlocked: false,
      error: 'Incorrect password. Students: enter the individual password issued after your Tribute payment. The administrator master password opens the admin panel only.',
    });
  }

  /* --- 2. Tribute payment status and signed webhook ----------------------- */
  if (pathname === '/api/tribute/status') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return respond(res, 405, 'Method not allowed');
    return json(res, 200, getTributeStatus());
  }

  if (pathname === '/api/tribute/checkout') {
    return json(res, 410, { ok: false, error: 'Direct/demo checkout has been removed. Only confirmed Tribute webhooks can issue passwords.' });
  }

  if (pathname === TRIBUTE_WEBHOOK_PATH) {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    if (!TRIBUTE_API_KEY) return json(res, 503, { ok: false, error: 'Tribute webhook signature verification is not configured' });

    let rawBody;
    try {
      rawBody = await readBody(req, 65536);
    } catch (error) {
      return json(res, error.status === 413 ? 413 : 400, { ok: false, error: error.status === 413 ? 'Webhook payload is too large' : 'Unable to read webhook payload' });
    }
    const signature = String(req.headers['trbt-signature'] || '').trim().replace(/^sha256=/i, '');
    const expected = crypto.createHmac('sha256', TRIBUTE_API_KEY).update(rawBody).digest();
    let received;
    try { received = Buffer.from(signature, 'hex'); } catch { received = Buffer.alloc(0); }
    if (!/^[a-f0-9]{64}$/i.test(signature) || received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return json(res, 401, { ok: false, error: 'Invalid Tribute webhook signature' });
    }

    let event;
    try {
      event = JSON.parse(rawBody || '{}');
    } catch {
      return json(res, 400, { ok: false, error: 'Invalid Tribute webhook JSON' });
    }
    const result = await processTributeEvent(event);
    return json(res, result.status, result.body);
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
      students: session.isAdmin ? store.students.map(adminStudentSummary) : [],
      tribute: getTributeStatus(session.isAdmin),
      myPurchase: session.isAdmin ? null : publicPurchase(tributeOrderForStudent(session.user.id)),
      editor: {
        materials: store.editor.materials,
        posts: store.editor.posts,
        overrides: store.editor.overrides,
      },
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
      student: session.user.email || 'student@unknown.local',
      name: session.user.name || 'Student',
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
    if (payload.action === 'reset-binding') {
      const stu = store.students.find(s => s.id === payload.studentId);
      if (stu) {
        stu.boundClientId = null;
        stu.boundAt = null;
        saveStore();
        addBotLog('admin', `Device assignment reset for student ${stu.id}`);
      }
      return json(res, 200, { ok: true, students: store.students.map(adminStudentSummary) });
    }
    if (payload.action === 'revoke') {
      const stu = store.students.find(s => s.id === payload.studentId);
      if (stu) {
        stu.active = false;
        saveStore();
        addBotLog('admin', `Course access revoked for student ${stu.id} (${stu.name})`);
      }
      return json(res, 200, { ok: true, students: store.students.map(adminStudentSummary) });
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
    const out = await executeBotCommand(payload.command);
    return json(res, 200, { ...out, logs: store.adminBot.logs, submissions: store.submissions });
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
