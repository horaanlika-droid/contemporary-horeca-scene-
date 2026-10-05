'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { createAdminConsole } = require('./admin-bot.ru.js');

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
const chatStreams = new Map();
const chatRateLimits = new Map();

/* Tribute sends signed HTTPS webhooks to this service; it does not issue a bot command. */
const TRIBUTE_API_KEY = process.env.TRIBUTE_API_KEY || '';
const TRIBUTE_PRODUCT_ID = String(process.env.TRIBUTE_PRODUCT_ID || '').trim();
const TRIBUTE_SUBSCRIPTION_ID = String(process.env.TRIBUTE_SUBSCRIPTION_ID || '').trim();
const TRIBUTE_PRODUCT_TITLE = process.env.TRIBUTE_PRODUCT_TITLE || 'Contemporary Horeca Scene · 2026 Edition';
const TRIBUTE_PRICE = process.env.TRIBUTE_PRICE || '';
const TRIBUTE_PRODUCT_PRICE = process.env.TRIBUTE_PRODUCT_PRICE || TRIBUTE_PRICE;
const TRIBUTE_SUBSCRIPTION_PRICE = process.env.TRIBUTE_SUBSCRIPTION_PRICE || TRIBUTE_PRICE;
const TRIBUTE_PURCHASE_URL_RAW = String(process.env.TRIBUTE_PRODUCT_URL || process.env.TRIBUTE_PURCHASE_URL || process.env.TRIBUTE_PAYMENT_URL || process.env.TRIBUTE_CHECKOUT_URL || '').trim();
const AUTO_CREDENTIALS = String(process.env.AUTO_CREDENTIALS || process.env.TRIBUTE_AUTO_CREDENTIALS || '').toLowerCase() === 'true';
const BOT_USERNAME = String(process.env.BOT_USERNAME || '').trim().replace(/^@/, '');
const BOT_START_URL = /^[A-Za-z0-9_]{5,32}$/.test(BOT_USERNAME)
  ? `https://t.me/${BOT_USERNAME}?start=course`
  : '';
const COURSE_URL = String(process.env.COURSE_URL || '').trim();
/* The start link a buyer receives in the bot right after a verified Tribute payment.
   Falls back to COURSE_URL when it is not set. */
const COURSE_START_URL_RAW = String(
  process.env.COURSE_START_URL || process.env.COURSE_APP_URL || process.env.START_URL || '',
).trim();
/* Set PAYMENT_START_MESSAGE=false to go back to sending the link only after approval. */
const PAYMENT_START_MESSAGE = !/^(0|false|no|off)$/i.test(String(process.env.PAYMENT_START_MESSAGE || '').trim());
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
function loadCourseData() {
  try {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'course-data.js'), 'utf8'), context);
    return context.window?.COURSE || null;
  } catch (err) {
    console.warn('Could not read course-data.js for editor block resolution:', err.message);
    return null;
  }
}
const COURSE_DATA = loadCourseData();
const COURSE_MODULES = (COURSE_DATA?.modules || []).map(m => ({
  id: String(m.id || ''),
  number: String(m.number || ''),
  title: String(m.title || ''),
  lessons: (m.lessons || []).map(l => ({ id: String(l.id || ''), title: String(l.title || '') })),
}));

/* Editable public site copy (password gate + landing hero + quote band). Defaults live in
   site-copy.js; admin-bot overrides (scope "site") are merged server-side for /api/site. */
function loadSiteDefaults() {
  try {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'site-copy.js'), 'utf8'), context);
    return context.window?.SITE || null;
  } catch (err) {
    console.warn('Could not read site-copy.js for site copy defaults:', err.message);
    return null;
  }
}
const SITE_DEFAULTS = loadSiteDefaults();
function siteCopyWithOverrides() {
  const base = JSON.parse(JSON.stringify(SITE_DEFAULTS || { gate: {}, landing: {} }));
  for (const override of store.editor.overrides) {
    if (override.scope !== 'site' || typeof override.text !== 'string') continue;
    const group = base[override.targetId];
    if (group && typeof group[override.field] === 'string') group[override.field] = override.text;
  }
  return base;
}
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

/* --- media library: photos uploaded in the admin bot replace any image block --- */
const MEDIA_MAX_BYTES = 8 * 1024 * 1024;
const MEDIA_TYPES = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};
const IMAGE_FILE_PATTERN = /^[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i;

function detectImageExtension(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return '';
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.toString('latin1', 1, 4) === 'PNG') return 'png';
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  return '';
}

function mediaPublicUrl(file) {
  const base = configuredHttpsUrl(COURSE_URL);
  return base ? `${base.replace(/\/+$/, '')}/media/${file}` : '';
}

function mediaRecordForFile(file) {
  return store.editor.media.find(item => item.file === file) || null;
}

function saveStoreMedia({ buffer, name, source, sourceId }) {
  const ext = detectImageExtension(buffer);
  if (!ext) return { error: 'The file is not a JPEG, PNG or WebP image.' };
  if (buffer.length > MEDIA_MAX_BYTES) return { error: 'The image is larger than 8 MB.' };
  ensureDirs();
  const id = editorId('img');
  const file = `${id}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buffer);
  const record = {
    id,
    file,
    url: `/media/${file}`,
    name: String(name || file).slice(0, 160),
    type: MEDIA_TYPES[ext],
    size: buffer.length,
    source: source || 'admin-bot',
    sourceId: sourceId || null,
    createdAt: new Date().toISOString(),
  };
  store.editor.media.unshift(record);
  saveStore();
  return { media: record };
}

function removeStoreMedia(id) {
  const index = store.editor.media.findIndex(item => item.id === id);
  if (index === -1) return { error: 'Photo not found.' };
  const [removed] = store.editor.media.splice(index, 1);
  try {
    fs.rmSync(path.join(UPLOAD_DIR, path.basename(removed.file)), { force: true });
  } catch { /* the file may already be gone */ }
  const url = `/media/${removed.file}`;
  const before = store.editor.overrides.length;
  store.editor.overrides = store.editor.overrides.filter(override => override.text !== url);
  saveStore();
  return { media: removed, overridesCleared: before - store.editor.overrides.length };
}

/* Text input in the bot may still point at a shipped archive file, an https link
   or a previously uploaded photo. */
function validImageReference(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const url = validHttpsUrl(raw);
  if (url) return url;
  const mediaMatch = raw.match(/^\/media\/([A-Za-z0-9._-]+)$/);
  if (mediaMatch && mediaRecordForFile(mediaMatch[1])) return raw;
  if (IMAGE_FILE_PATTERN.test(raw)) return raw;
  return '';
}

async function telegramApi(method, payload) {
  if (!process.env.BOT_TOKEN) return null;
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => null);
    return data && data.ok === false ? null : data;
  } catch {
    return null;
  }
}

async function sendTelegramPhoto(chatId, photoUrl, caption, replyMarkup = undefined) {
  if (!process.env.BOT_TOKEN || !chatId || !photoUrl) return false;
  const payload = { chat_id: chatId, photo: photoUrl, caption: String(caption || '').slice(0, 1000), parse_mode: 'HTML' };
  if (replyMarkup) payload.reply_markup = replyMarkup;
  const data = await telegramApi('sendPhoto', payload);
  return Boolean(data?.ok);
}

async function downloadTelegramImage(message) {
  const document = message?.document && /^image\//i.test(String(message.document.mime_type || '')) ? message.document : null;
  const sizes = Array.isArray(message?.photo) ? message.photo : [];
  const largest = sizes.length ? sizes[sizes.length - 1] : null;
  const fileId = document?.file_id || largest?.file_id;
  if (!fileId) return { error: 'Send a photo (or an image file) to replace the block image.' };
  const declaredSize = Number(document?.file_size || largest?.file_size || 0);
  if (declaredSize > MEDIA_MAX_BYTES) return { error: 'The image is larger than 8 MB. Send a smaller one.' };
  const meta = await telegramApi('getFile', { file_id: fileId });
  const filePath = meta?.result?.file_path;
  if (!filePath) return { error: 'Telegram did not return the image file. Send it again.' };
  try {
    const response = await fetch(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`);
    if (!response.ok) return { error: 'Telegram did not return the image file. Send it again.' };
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!buffer.length) return { error: 'The received image is empty. Send it again.' };
    if (buffer.length > MEDIA_MAX_BYTES) return { error: 'The image is larger than 8 MB. Send a smaller one.' };
    return { buffer, name: document?.file_name || `telegram-${Date.now()}.jpg` };
  } catch {
    return { error: 'Could not download the image from Telegram. Send it again.' };
  }
}

async function ingestTelegramPhoto(message) {
  const downloaded = await downloadTelegramImage(message);
  if (downloaded.error) return downloaded;
  return saveStoreMedia({
    buffer: downloaded.buffer,
    name: downloaded.name,
    source: 'telegram',
    sourceId: String(message?.chat?.id || message?.from?.id || ''),
  });
}

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
    chats: [],
    progress: {},
    quizzes: {},
    tribute: { orders: [] },
    editor: { materials: [], posts: [], overrides: [], media: [] },
    adminBot: {
      adminChatIds: [...ADMIN_IDS],
      pending: {},
      logs: [
        {
          id: 'log-boot',
          at: new Date().toISOString(),
          type: 'system',
          text: 'Access Bot ready. Admin commands: /admissions, /admit <student_id>, /reject <student_id>, /pending, /approve <id> <feedback>, /revise <id> <feedback>, /students, /orders, /resend <telegram_id>, /chat; editor: /addmat, /materials, /post, /editmodule, /editlesson, /overrides; inline panel: Photo & backgrounds replaces block images with photos sent in the chat'
        },
      ],
    },
  };
}

let pendingStoreMigration = false;

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
        const { password: legacyPassword, ...cleanStudent } = student;
        if (Object.hasOwn(student, 'password')) pendingStoreMigration = true;
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
          pendingStoreMigration = true;
          if (Object.hasOwn(cleanStudent, 'legacyPasswordHash')) pendingStoreMigration = true;
          delete cleanStudent.legacyPasswordHash;
          return { ...cleanStudent, active: false, revokedReason: 'Legacy test checkout was removed.' };
        }
        const approvedManualAccess = student.source === 'access-request' && Boolean(student.admissionApprovedAt);
        if (!hasPaidProduct && !hasPaidSubscription && student.active !== false && !approvedManualAccess) {
          pendingStoreMigration = true;
          if (Object.hasOwn(cleanStudent, 'legacyPasswordHash')) pendingStoreMigration = true;
          delete cleanStudent.legacyPasswordHash;
          return { ...cleanStudent, active: false, revokedReason: 'A confirmed Tribute payment or manual admin approval is required for course access.' };
        }
        if (student.active === false) {
          if (Object.hasOwn(cleanStudent, 'legacyPasswordHash')) pendingStoreMigration = true;
          delete cleanStudent.legacyPasswordHash;
        } else if (legacyPassword && !cleanStudent.passwordHash && !cleanStudent.legacyPasswordHash) {
          cleanStudent.legacyPasswordHash = hashStudentPassword(String(legacyPassword).toUpperCase());
        }
        if (student.active !== false && !cleanStudent.admissionApprovedAt
          && (cleanStudent.passwordHash || cleanStudent.legacyPasswordHash)
          && (hasPaidProduct || hasPaidSubscription)) {
          cleanStudent.admissionApprovedAt = student.registeredAt || student.createdAt || new Date().toISOString();
          cleanStudent.registrationStatus = cleanStudent.passwordHash ? 'REGISTERED' : 'LEGACY ACCESS';
          pendingStoreMigration = true;
        }
        if (!cleanStudent.passwordHash && !cleanStudent.legacyPasswordHash
          && (hasPaidProduct || hasPaidSubscription) && !cleanStudent.admissionApprovedAt
          && (student.active !== false || cleanStudent.registrationStatus !== 'PENDING_APPROVAL')) {
          cleanStudent.active = false;
          cleanStudent.registrationStatus = 'PENDING_APPROVAL';
          pendingStoreMigration = true;
        }
        return cleanStudent;
      });
      const pendingAdmissionIds = new Set(students
        .filter(student => student.active === false && student.registrationStatus === 'PENDING_APPROVAL')
        .map(student => student.id));
      const orders = oldOrders.map(order => {
        const legacyInviteFields = [
          'registrationTokenHash', 'registrationTokenIssuedAt', 'registrationTokenExpiresAt',
          'registrationTokenUsedAt', 'registrationTokenInvalidatedAt', 'passwordIssued',
        ];
        const hasLegacyInvite = legacyInviteFields.some(field => Object.hasOwn(order, field));
        if (order.status !== 'PAID_STUB' && !hasLegacyInvite
          && !(order.status === 'PAID' && pendingAdmissionIds.has(order.studentId) && order.deliveryStatus !== 'AWAITING_APPROVAL')) return order;
        pendingStoreMigration = true;
        const {
          passwordIssued,
          registrationTokenHash,
          registrationTokenIssuedAt,
          registrationTokenExpiresAt,
          registrationTokenUsedAt,
          registrationTokenInvalidatedAt,
          ...rest
        } = order;
        if (order.status === 'PAID_STUB') return { ...rest, status: 'TEST_ORDER_REVOKED', deliveryStatus: 'NOT_DELIVERED' };
        if (pendingAdmissionIds.has(order.studentId)) return { ...rest, deliveryStatus: 'AWAITING_APPROVAL' };
        return rest;
      });
      const submissions = (Array.isArray(parsed.submissions) ? parsed.submissions : []).map(submission => {
        if (!submission || typeof submission !== 'object') return submission;
        if (Object.hasOwn(submission, 'passwordCode')) pendingStoreMigration = true;
        const { passwordCode, ...safeSubmission } = submission;
        return safeSubmission;
      });
      const logs = Array.isArray(parsed.adminBot?.logs)
        ? parsed.adminBot.logs.filter(log => {
          const keep = !/demo checkout completed/i.test(log.text || '');
          if (!keep) pendingStoreMigration = true;
          return keep;
        })
        : def.adminBot.logs;
      return {
        ...def,
        ...parsed,
        students,
        submissions,
        chats: Array.isArray(parsed.chats) ? parsed.chats : [],
        tribute: { orders },
        editor: {
          materials: Array.isArray(parsed.editor?.materials) ? parsed.editor.materials : [],
          posts: Array.isArray(parsed.editor?.posts) ? parsed.editor.posts : [],
          overrides: Array.isArray(parsed.editor?.overrides) ? parsed.editor.overrides : [],
          media: Array.isArray(parsed.editor?.media) ? parsed.editor.media : [],
        },
        adminBot: {
          ...def.adminBot,
          ...(parsed.adminBot || {}),
          adminChatIds: [...new Set([...(parsed.adminBot?.adminChatIds || []), ...ADMIN_IDS])],
          pending: (parsed.adminBot?.pending && typeof parsed.adminBot.pending === 'object' && !Array.isArray(parsed.adminBot.pending)) ? parsed.adminBot.pending : {},
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

if (pendingStoreMigration) {
  saveStore();
  pendingStoreMigration = false;
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

function tributePurchaseUrl() {
  return configuredHttpsUrl(TRIBUTE_PURCHASE_URL_RAW);
}

function getTributeStatus(includeOrders = false) {
  const botConfigured = Boolean(process.env.BOT_TOKEN);
  const productConfigured = Boolean(TRIBUTE_PRODUCT_ID);
  const subscriptionConfigured = Boolean(TRIBUTE_SUBSCRIPTION_ID);
  const paymentConfigured = productConfigured || subscriptionConfigured;
  const webhookConfigured = Boolean(TRIBUTE_API_KEY);
  const registrationLinkConfigured = Boolean(configuredHttpsUrl(COURSE_URL));
  const purchaseUrl = tributePurchaseUrl();
  const purchaseUrlConfigured = Boolean(purchaseUrl);
  const deliveryReady = Boolean(paymentConfigured && webhookConfigured && botConfigured && BOT_START_URL && registrationLinkConfigured);
  const status = {
    mode: deliveryReady ? 'ready' : 'not-configured',
    productTitle: TRIBUTE_PRODUCT_TITLE,
    productPrice: TRIBUTE_PRODUCT_PRICE,
    subscriptionPrice: TRIBUTE_SUBSCRIPTION_PRICE,
    productId: TRIBUTE_PRODUCT_ID,
    subscriptionId: TRIBUTE_SUBSCRIPTION_ID,
    productConfigured,
    subscriptionConfigured,
    registrationLinkConfigured,
    purchaseUrl,
    purchaseUrlConfigured,
    botStartUrl: BOT_START_URL || '',
    autoCredentials: AUTO_CREDENTIALS,
    webhookEndpoint: TRIBUTE_WEBHOOK_PATH,
    paymentConfigured,
    webhookConfigured,
    botConfigured,
    botUsernameConfigured: Boolean(BOT_START_URL),
    deliveryReady,
    ordersCount: store.tribute.orders.length,
    paidOrdersCount: store.tribute.orders.filter(order => order.status === 'PAID').length,
    pendingDeliveriesCount: store.tribute.orders.filter(order => order.status === 'PAID' && !['DELIVERED', 'REGISTERED', 'NOT_REQUIRED'].includes(order.deliveryStatus)).length,
    pendingAdmissionsCount: pendingAdmissions().length,
    startUrlConfigured: Boolean(courseStartUrl()),
    paymentStartMessage: PAYMENT_START_MESSAGE,
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
      admissionApproved: Boolean(order.admissionApprovedAt),
    }));
  }
  return status;
}

function createStudentAccount({
  name, email, telegramId, telegramUsername, tributeUserId,
  source = 'tribute-product', tributeOrderId = null,
}) {
  const cleanTelegramId = telegramId ? String(telegramId) : null;
  const cleanEmail = String(email || '').trim().toLowerCase()
    || (cleanTelegramId ? `telegram-${cleanTelegramId}@tribute.local` : `student-${crypto.randomBytes(8).toString('hex')}@chs.local`);
  const cleanUsername = String(telegramUsername || '').trim().replace(/^@/, '') || null;
  const cleanName = String(name || '').trim() || (cleanUsername ? `@${cleanUsername}` : cleanEmail.split('@')[0]);
  const now = new Date().toISOString();
  const student = {
    id: `stu-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    name: cleanName,
    email: cleanEmail,
    login: null,
    passwordHash: null,
    registeredAt: null,
    credentialsIssuedAt: null,
    role: 'STUDENT',
    institutionId: 'him-001',
    telegramId: cleanTelegramId,
    telegramUsername: cleanUsername,
    tributeUserId: tributeUserId ? String(tributeUserId) : null,
    source,
    tributeOrderId,
    subscriptionId: null,
    subscriptionExpiresAt: null,
    subscriptionStatus: null,
    registrationStatus: 'PENDING_APPROVAL',
    admissionRequestedAt: now,
    admissionApprovedAt: null,
    registrationLinkDeliveryStatus: cleanTelegramId ? 'AWAITING_APPROVAL' : 'NOT_AVAILABLE',
    registrationLinkDeliveredAt: null,
    registrationLinkDeliveryAttempts: 0,
    unlockedLessons: [...ALL_LESSON_IDS],
    completedLessons: [],
    active: false,
    createdAt: now,
  };
  store.students.unshift(student);
  saveStore();
  return student;
}

function hashStudentPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyStudentPassword(password, encoded) {
  const [algorithm, salt, expectedHex] = String(encoded || '').split('$');
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(salt || '') || !/^[a-f0-9]{128}$/i.test(expectedHex || '')) return false;
  try {
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = crypto.scryptSync(password, salt, expected.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function generateRandomPassword() {
  const part = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `CHS-${part()}-${part()}-${part()}`;
}

function generateUniqueLogin(student) {
  const baseRaw = String(student.telegramUsername || student.name || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 12) || 'user';
  const suffix = String(student.telegramId || '').slice(-4) || crypto.randomBytes(2).toString('hex').slice(0, 4);
  let candidate = `${baseRaw}${suffix}`;
  let attempt = 0;
  let login = candidate;
  while (store.students.some(s => s.id !== student.id && String(s.login || '').toLowerCase() === login.toLowerCase())) {
    attempt += 1;
    login = `${candidate}${attempt}`;
    if (attempt > 10) {
      login = `user${crypto.randomBytes(3).toString('hex')}`;
      break;
    }
  }
  return login.toLowerCase();
}

async function issueCredentialsForStudent(student, order = null, via = 'auto') {
  if (!student || !student.telegramId) return { error: 'Telegram account is required to issue credentials. Ask the learner to start the bot and send /start.' };
  const hasPaid = Boolean(order) || store.tribute.orders.some(o => o.studentId === student.id && o.status === 'PAID');
  if (!hasPaid) return { error: 'No confirmed Tribute payment is linked to this account. Verify the payment in Tribute first.' };
  if (student.passwordHash && student.login) {
    return { error: 'Credentials have already been issued for this account. Use /reset to generate a new password.' };
  }
  const login = student.login || generateUniqueLogin(student);
  const plainPassword = generateRandomPassword();
  student.login = login;
  student.passwordHash = hashStudentPassword(plainPassword);
  delete student.legacyPasswordHash;
  student.active = true;
  student.admissionApprovedAt = student.admissionApprovedAt || new Date().toISOString();
  student.registrationStatus = 'CREDENTIALS_ISSUED';
  student.credentialsIssuedAt = new Date().toISOString();
  student.registrationLinkDeliveryStatus = 'CREDENTIALS_SENT';
  student.registrationLinkDeliveredAt = new Date().toISOString();
  for (const o of store.tribute.orders) {
    if (o.studentId === student.id && o.status === 'PAID') {
      o.admissionApprovedAt = student.admissionApprovedAt;
      o.deliveryStatus = 'DELIVERED';
      o.deliveryUpdatedAt = new Date().toISOString();
    }
  }
  saveStore();
  addBotLog('credentials', `[${via}] Credentials issued for ${student.name} (Telegram ${student.telegramId}) login ${login}.`);
  const courseLink = courseStartUrl() || tributePurchaseUrl() || '';
  const lines = [
    'Payment confirmed — your Contemporary Horeca Scene access is ready!',
    '',
    `Login: ${login}`,
    `Password: ${plainPassword}`,
    '',
    courseLink ? `Open the course: ${courseLink}` : 'Open the app via the QR code',
    'Enter your login and password on the sign-in screen.',
    '',
    `Save your password — the bot does not show it again. If lost, contact ${AUTHOR_EMAIL} or ask an admin to reset it.`,
  ];
  const htmlLines = [
    '<b>Payment confirmed — your Contemporary Horeca Scene access is ready!</b>',
    '',
    `Login: <code>${escapeHtml(login)}</code>`,
    `Password: <code>${escapeHtml(plainPassword)}</code>`,
    '',
    courseLink ? `Open the course: <a href="${escapeHtml(courseLink)}">${escapeHtml(courseLink)}</a>` : 'Open the app via the QR code',
    'Enter your login and password on the sign-in screen.',
    '',
    `Save your password — the bot does not show it again. If lost, contact ${AUTHOR_EMAIL} or ask an admin to reset it.`,
  ];
  const text = lines.join('\n');
  const html = htmlLines.join('\n');
  const sent = await sendTelegramMessage(student.telegramId, html, courseKeyboard());
  if (!sent) {
    student.registrationLinkDeliveryStatus = 'CREDENTIALS_PENDING_DELIVERY';
    saveStore();
    return { ok: true, login, password: plainPassword, sent: false, warning: 'Credentials generated but Telegram delivery failed. Ask the learner to start the bot and use /issue or /register, and check BOT_TOKEN / COURSE_URL.' };
  }
  return { ok: true, login, password: plainPassword, sent: true };
}

async function resetCredentialsForStudent(student, via = 'admin') {
  if (!student || !student.telegramId) return { error: 'Telegram account is required to reset credentials.' };
  const hasPaid = store.tribute.orders.some(o => o.studentId === student.id && o.status === 'PAID');
  if (!hasPaid && !student.active) return { error: 'No confirmed payment is linked to this account.' };
  const plainPassword = generateRandomPassword();
  if (!student.login) student.login = generateUniqueLogin(student);
  student.passwordHash = hashStudentPassword(plainPassword);
  delete student.legacyPasswordHash;
  student.active = true;
  student.credentialsIssuedAt = new Date().toISOString();
  student.registrationLinkDeliveryStatus = 'CREDENTIALS_SENT';
  saveStore();
  addBotLog('credentials', `[${via}] Credentials reset for ${student.name} (Telegram ${student.telegramId}) login ${student.login}.`);
  const courseLink = courseStartUrl() || tributePurchaseUrl() || '';
  const html = [
    '<b>Your Contemporary Horeca Scene access has been reset.</b>',
    '',
    `Login: <code>${escapeHtml(student.login)}</code>`,
    `New password: <code>${escapeHtml(plainPassword)}</code>`,
    '',
    courseLink ? `Open the course: <a href="${escapeHtml(courseLink)}">${escapeHtml(courseLink)}</a>` : 'Open the app via the QR code',
    `Save this password — it will not be shown again.`,
  ].join('\n');
  const sent = await sendTelegramMessage(student.telegramId, html);
  if (!sent) return { ok: true, login: student.login, password: plainPassword, sent: false, warning: 'New password generated but Telegram delivery failed.' };
  return { ok: true, login: student.login, password: plainPassword, sent: true };
}

function registrationUrl() {
  const base = configuredHttpsUrl(COURSE_URL);
  if (!base) return '';
  try {
    const url = new URL(base);
    url.searchParams.set('register', '1');
    return url.toString();
  } catch {
    return '';
  }
}

function approvedTelegramStudent(identity) {
  const supplied = String(identity || '').trim().replace(/^@/, '');
  if (!supplied) return null;
  return store.students.find(student => {
    const matches = /^\d{1,20}$/.test(supplied)
      ? String(student.telegramId || '') === supplied
      : String(student.telegramUsername || '').toLowerCase() === supplied.toLowerCase();
    return matches && student.admissionApprovedAt && isStudentAccessActive(student);
  }) || null;
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

function studentProfile(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    login: student.login || null,
    role: 'STUDENT',
    isMaster: false,
    institutionId: student.institutionId || 'him-001',
    telegramId: student.telegramId || null,
    telegramUsername: student.telegramUsername || null,
    unlockedLessons: [...ALL_LESSON_IDS],
    completedLessons: student.completedLessons || [],
  };
}

function adminStudentSummary(student) {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    login: student.login || null,
    active: isStudentAccessActive(student),
    registered: Boolean(student.passwordHash),
    registrationStatus: student.passwordHash ? 'REGISTERED' : (student.legacyPasswordHash ? 'LEGACY ACCESS' : (student.registrationStatus || 'PENDING')),
    admissionApprovedAt: student.admissionApprovedAt || null,
    admissionRequestedAt: student.admissionRequestedAt || null,
    credentialsIssuedAt: student.credentialsIssuedAt || null,
    registrationLinkDeliveryStatus: student.registrationLinkDeliveryStatus || null,
    registrationLinkDeliveredAt: student.registrationLinkDeliveredAt || null,
    telegramId: student.telegramId || null,
    telegramUsername: student.telegramUsername || null,
    source: student.source || 'unknown',
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
    user: studentProfile(student),
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

async function editTelegramMessage(chatId, messageId, text, replyMarkup = undefined) {
  if (!process.env.BOT_TOKEN || !chatId || !messageId) return false;
  try {
    const body = { chat_id: chatId, message_id: messageId, text, parse_mode: 'HTML' };
    if (replyMarkup) body.reply_markup = replyMarkup;
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json().catch(() => null);
    /* "message is not modified" is a benign race when the admin taps twice */
    return Boolean((response.ok && result?.ok === true) ||
      (result?.error_code === 400 && /message is not modified/i.test(result?.description || '')));
  } catch {
    return false;
  }
}

async function answerCallbackQuery(callbackQueryId, text = undefined) {
  if (!process.env.BOT_TOKEN || !callbackQueryId) return false;
  try {
    const body = { callback_query_id: callbackQueryId };
    if (text) body.text = text;
    const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function chatMessagesForStudent(studentId) {
  return store.chats.filter(message => message.studentId === studentId).slice(-200);
}

function writeChatEvent(response, event, data) {
  response.write(['event: ' + event, 'data: ' + JSON.stringify(data), '', ''].join('\n'));
}

function publishChatMessage(message) {
  for (const stream of chatStreams.values()) {
    if (!stream.isAdmin && stream.studentId !== message.studentId) continue;
    if (stream.isAdmin && stream.studentId && stream.studentId !== message.studentId) continue;
    try { writeChatEvent(stream.response, 'message', message); } catch { /* client disconnected */ }
  }
}

function allowChatMessage(userId) {
  const now = Date.now();
  const record = chatRateLimits.get(userId) || { count: 0, resetAt: now + 60_000 };
  if (record.resetAt <= now) {
    record.count = 0;
    record.resetAt = now + 60_000;
  }
  record.count += 1;
  chatRateLimits.set(userId, record);
  if (chatRateLimits.size > 5000) {
    for (const [key, item] of chatRateLimits) if (item.resetAt <= now) chatRateLimits.delete(key);
  }
  return record.count <= 20;
}

/* The start link a buyer receives in the bot right after a verified payment. */
function courseStartUrl() {
  return configuredHttpsUrl(COURSE_START_URL_RAW) || configuredHttpsUrl(COURSE_URL);
}

function courseKeyboard() {
  const url = courseStartUrl();
  return url ? { inline_keyboard: [[{ text: '▶️ Start the course', url }]] } : undefined;
}

function paymentStartKeyboard() {
  const rows = [];
  const startUrl = courseStartUrl();
  const registerUrl = registrationUrl();
  if (startUrl) rows.push([{ text: '▶️ Open the start page', url: startUrl }]);
  if (registerUrl) rows.push([{ text: '📝 Create your password', url: registerUrl }]);
  return rows.length ? { inline_keyboard: rows } : undefined;
}

function paymentStartMessage(student, order) {
  const startUrl = courseStartUrl();
  const orderLine = [
    order?.id ? `Tribute event <code>${escapeHtml(order.id)}</code>` : '',
    order?.amount ? escapeHtml(order.amount) : '',
  ].filter(Boolean).join(' · ');
  return [
    '🎉 <b>Payment received — your start link is ready.</b>',
    orderLine,
    '',
    'Save this chat: the link below is your entry point to <b>Contemporary Horeca Scene</b>, and the same link is re-sent after the course team confirms your payment.',
    '',
    '1️⃣ The course team checks the payment in Tribute — the elective stays private and admission is personal.',
    '2️⃣ You open the start link and set your personal password, using the same Telegram account you used here.',
    '3️⃣ The elective opens: 10 modules, industry cases, project files and the final found-object mockup brief.',
    startUrl ? `\n▶️ Start: <a href="${escapeHtml(startUrl)}">open the course</a>` : '',
    `\nQuestions at any time: send /register or write to ${AUTHOR_EMAIL}.`,
    student?.telegramUsername || student?.telegramId
      ? `\nTelegram account: ${escapeHtml(student.telegramUsername ? `@${student.telegramUsername}` : student.telegramId)}`
      : '',
  ].filter(line => line !== '').join('\n');
}

async function sendPaymentStartNotice(student, order) {
  if (!PAYMENT_START_MESSAGE) return false;
  if (!student?.telegramId || !process.env.BOT_TOKEN) return false;
  /* Registered learners already receive their access notice with the same start button. */
  if (student.passwordHash || student.legacyPasswordHash) return false;
  if (!courseStartUrl() && !registrationUrl()) return false;
  const sent = await sendTelegramMessage(student.telegramId, paymentStartMessage(student, order), paymentStartKeyboard());
  if (sent) {
    student.startLinkSentAt = new Date().toISOString();
    saveStore();
    addBotLog('admission', `Start link delivered right after payment to ${student.name} (Telegram ${student.telegramId}).`);
  }
  return sent;
}

function registrationKeyboard(url) {
  const rows = [];
  if (url) rows.push([{ text: '📝 Open shared registration page', url }]);
  const startUrl = courseStartUrl();
  if (startUrl && startUrl !== url) rows.push([{ text: '▶️ Start the course', url: startUrl }]);
  return rows.length ? { inline_keyboard: rows } : undefined;
}

function admissionKeyboard(student) {
  return {
    inline_keyboard: [[
      { text: '✅ Confirm payment & admit', callback_data: `admit:${student.id}` },
      { text: '⛔ Reject', callback_data: `reject:${student.id}` },
    ]],
  };
}

function pendingAdmissions() {
  const studentsWithUnapprovedPayments = new Set(store.tribute.orders
    .filter(order => order.status === 'PAID' && order.deliveryStatus === 'AWAITING_APPROVAL')
    .map(order => order.studentId).filter(Boolean));
  return store.students.filter(student => (
    (student.registrationStatus === 'PENDING_APPROVAL' && student.active === false)
    || studentsWithUnapprovedPayments.has(student.id)
  ));
}

async function notifyAdmissionAdmins(student, order = null) {
  if (!order && student.admissionNoticeSentAt) return false;
  const now = new Date().toISOString();
  student.admissionNoticeSentAt = now;
  saveStore();
  const paymentLine = order
    ? `Tribute event: <code>${escapeHtml(order.id)}</code> · ${escapeHtml(order.amount || 'amount not reported')} · signed webhook received`
    : 'No signed payment event is attached; verify the purchase in Tribute before approving.';
  const message = `🛂 <b>Admission requires your approval</b>\nStudent: ${escapeHtml(student.name)}\nEmail: ${escapeHtml(student.email)}\nTelegram: ${escapeHtml(student.telegramUsername ? `@${student.telegramUsername}` : 'username not set')} · ID <code>${escapeHtml(student.telegramId || 'unknown')}</code>\n${paymentLine}\n\nCheck the payment, then approve or reject this learner. The registration URL is shared; admission is tied to this Telegram account.`;
  for (const adminId of store.adminBot.adminChatIds) {
    await sendTelegramMessage(adminId, message, admissionKeyboard(student));
  }
  addBotLog('admission', `Admission pending for ${student.name} (Telegram ${student.telegramId || 'unknown'})${order ? ` · ${order.id}` : ' · manual request'}.`);
  return true;
}

function findStudentByTelegramId(telegramId, includeRevoked = false) {
  const id = String(telegramId || '');
  if (!id) return null;
  return store.students.find(student => (
    String(student.telegramId || '') === id
    && (includeRevoked || student.active !== false)
  )) || null;
}

function registrationInviteMessage(student, url) {
  return [
    '✅ <b>Your course admission has been approved.</b>',
    '',
    'This is the shared registration link used by all admitted learners. Open it, enter the Telegram username or ID you used with this bot, then set your email and personal password:',
    `<a href="${escapeHtml(url)}">Open the shared registration page</a>`,
    '',
    'The link is reusable; admission is checked against the Telegram account approved by the course admin. Your password remains valid for future sign-ins.',
    `If you forget your password, contact support by email: <a href="mailto:${AUTHOR_EMAIL}">${AUTHOR_EMAIL}</a>.`,
    student?.name ? `\nTelegram account: ${escapeHtml(student.telegramUsername ? `@${student.telegramUsername}` : student.telegramId || student.name)}` : '',
  ].filter(Boolean).join('\n');
}

async function sendSharedRegistrationLink(student) {
  if (!student?.telegramId || !process.env.BOT_TOKEN || !student.admissionApprovedAt) return false;
  const url = registrationUrl();
  if (!url) return false;
  student.registrationLinkDeliveryAttempts = (Number(student.registrationLinkDeliveryAttempts) || 0) + 1;
  const sent = await sendTelegramMessage(student.telegramId, registrationInviteMessage(student, url), registrationKeyboard(url));
  student.registrationLinkDeliveryStatus = sent ? 'SHARED_LINK_SENT' : 'APPROVED_LINK_PENDING';
  student.registrationLinkDeliveredAt = sent ? new Date().toISOString() : student.registrationLinkDeliveredAt || null;
  saveStore();
  return sent;
}

async function admitStudent(identifier, via = 'admin-bot') {
  const raw = String(identifier || '').trim().replace(/^@/, '');
  const student = store.students.find(item => (
    item.id === raw
    || String(item.telegramId || '') === raw
    || String(item.telegramUsername || '').toLowerCase() === raw.toLowerCase()
  ));
  if (!student) return { error: 'Student admission request not found.' };
  if (student.active && student.admissionApprovedAt) return { ok: true, alreadyApproved: true, student, linkSent: false };

  const hasPaidOrder = store.tribute.orders.some(order => order.studentId === student.id && order.status === 'PAID');
  const hasActiveSubscription = Boolean(student.subscriptionExpiresAt && Date.parse(student.subscriptionExpiresAt) > Date.now());
  if (student.source?.startsWith('tribute-') && !hasPaidOrder && !hasActiveSubscription && !student.passwordHash && !student.legacyPasswordHash) {
    return { error: 'No active confirmed Tribute payment is linked to this student. Check the payment or use a manual access request.' };
  }

  const now = new Date().toISOString();
  student.active = true;
  student.admissionApprovedAt = now;
  student.registrationStatus = student.passwordHash ? 'REGISTERED' : 'APPROVED_PENDING_REGISTRATION';
  for (const order of store.tribute.orders) {
    if (order.studentId !== student.id || order.status !== 'PAID') continue;
    order.admissionApprovedAt = now;
    order.deliveryStatus = 'APPROVED_LINK_PENDING';
  }
  saveStore();
  addBotLog('admission', `[${via}] ${student.name} admitted (Telegram ${student.telegramId || 'unknown'}).`);

  let linkSent = false;
  if (student.passwordHash) {
    if (student.telegramId) linkSent = await sendTelegramMessage(
      student.telegramId,
      `✅ Your Contemporary Horeca Scene admission is active. Sign in with your email and personal password. Password recovery is available only by email: ${AUTHOR_EMAIL}.`,
      courseKeyboard(),
    );
  } else if (student.legacyPasswordHash) {
    if (student.telegramId) linkSent = await sendTelegramMessage(
      student.telegramId,
      `✅ Your course admission is active. Use your existing access code to sign in; contact support if you need to move to a personal password.`,
      courseKeyboard(),
    );
  } else {
    linkSent = await sendSharedRegistrationLink(student);
  }

  for (const order of store.tribute.orders) {
    if (order.studentId === student.id && order.status === 'PAID') {
      order.deliveryStatus = linkSent ? 'DELIVERED' : 'APPROVED_LINK_PENDING';
      order.deliveryUpdatedAt = new Date().toISOString();
    }
  }
  saveStore();
  return { ok: true, student, linkSent };
}

async function rejectStudent(identifier, reason = 'Please contact course support if you believe this is a mistake.') {
  const raw = String(identifier || '').trim().replace(/^@/, '');
  const student = store.students.find(item => (
    item.id === raw
    || String(item.telegramId || '') === raw
    || String(item.telegramUsername || '').toLowerCase() === raw.toLowerCase()
  ));
  if (!student) return { error: 'Student admission request not found.' };
  if (student.passwordHash && student.admissionApprovedAt) return { error: 'This student has already registered and cannot be rejected from the pending-admission queue.' };
  student.active = false;
  student.admissionApprovedAt = null;
  student.registrationStatus = 'REJECTED';
  student.admissionRejectedAt = new Date().toISOString();
  saveStore();
  addBotLog('admission', `Admission rejected for ${student.name} (Telegram ${student.telegramId || 'unknown'}).`);
  if (student.telegramId) await sendTelegramMessage(student.telegramId, `Your course admission has not been approved yet. Please contact course support at ${AUTHOR_EMAIL} if you believe this is an error.`);
  return { ok: true, student };
}

function createAccessRequestFromTelegram(message) {
  const telegramId = String(message?.from?.id || message?.chat?.id || '').trim();
  if (!/^\d{1,20}$/.test(telegramId)) return null;
  const existing = findStudentByTelegramId(telegramId, true);
  if (existing) return existing;
  const telegramUsername = String(message?.from?.username || '').trim().replace(/^@/, '') || null;
  const name = [message?.from?.first_name, message?.from?.last_name].filter(Boolean).join(' ') || (telegramUsername ? `@${telegramUsername}` : `Telegram ${telegramId}`);
  const student = createStudentAccount({
    name,
    email: `telegram-${telegramId}@pending.local`,
    telegramId,
    telegramUsername,
    source: 'access-request',
  });
  student.admissionRequestedAt = new Date().toISOString();
  student.registrationStatus = 'PENDING_APPROVAL';
  saveStore();
  return student;
}

async function deliverTributeOrder(order, student, { force = false } = {}) {
  if (!order || !student) return false;
  if (!force && order.deliveryStatus === 'DELIVERED') return true;
  if (!student.telegramId || !process.env.BOT_TOKEN || !isStudentAccessActive(student)) return false;

  let sent = false;
  if (student.passwordHash || student.legacyPasswordHash) {
    const message = student.passwordHash
      ? '✅ <b>Your Contemporary Horeca Scene access is active.</b> Sign in with your email and personal password. For password recovery, contact support only by email.'
      : '✅ <b>Your course admission is active.</b> Use your legacy access code to sign in. For help moving to an email-and-password account, contact course support.';
    sent = await sendTelegramMessage(student.telegramId, message, courseKeyboard());
    student.registrationLinkDeliveryStatus = 'NOT_REQUIRED';
  } else {
    if (!student.admissionApprovedAt) return false;
    const url = registrationUrl();
    if (url) {
      student.registrationLinkDeliveryAttempts = (Number(student.registrationLinkDeliveryAttempts) || 0) + 1;
      sent = await sendTelegramMessage(student.telegramId, registrationInviteMessage(student, url), registrationKeyboard(url));
      student.registrationLinkDeliveryStatus = sent ? 'SHARED_LINK_SENT' : 'APPROVED_LINK_PENDING';
      student.registrationLinkDeliveredAt = sent ? new Date().toISOString() : student.registrationLinkDeliveredAt || null;
    }
  }

  order.deliveryAttempts = (Number(order.deliveryAttempts) || 0) + 1;
  order.deliveryStatus = sent ? 'DELIVERED' : 'APPROVED_LINK_PENDING';
  order.deliveryUpdatedAt = new Date().toISOString();
  saveStore();
  if (!sent) {
    addBotLog('admission-delivery', `Approved shared registration link delivery is pending for Telegram user ${order.telegramId || 'unknown'}; check COURSE_URL and use /register after the bot is started.`);
    const notice = `⚠️ Admission approved, but the shared course link could not be delivered.\nOrder: <code>${escapeHtml(order.id)}</code>\nBuyer: ${escapeHtml(order.buyerName || 'Telegram buyer')} · ID <code>${escapeHtml(order.telegramId || 'unknown')}</code>\nCheck COURSE_URL and ask the learner to send /register to the Access Bot.`;
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
    admissionApproved: Boolean(order.admissionApprovedAt),
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
  let student = findStudentByTelegramId(senderId, true);
  const activeStudent = student && isStudentAccessActive(student);

  if (command === '/id') {
    const username = message.from?.username ? ` · @${escapeHtml(message.from.username)}` : '';
    await sendTelegramMessage(chatId, `Your Telegram ID is <code>${escapeHtml(senderId)}</code>${username}. Use this ID or your Telegram username on the shared registration page.`);
    return;
  }

  if (command === '/start') {
    // Auto-issue: if a verified Tribute payment exists, generate login+password immediately
    if (student && !student.passwordHash && !student.legacyPasswordHash) {
      const paidOrder = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID');
      if (paidOrder) {
        const cred = await issueCredentialsForStudent(student, paidOrder, 'bot-start');
        if (cred.ok) return;
        if (cred.error && cred.error.includes('already been issued')) {
          await sendTelegramMessage(chatId, `Your course access is active. Use your login <code>${escapeHtml(student.login || student.email)}</code> to sign in. If you lost the password, ask an admin to reset it or contact ${AUTHOR_EMAIL}.`, courseKeyboard());
          return;
        }
      }
    }
    if (activeStudent && student.passwordHash) {
      const loginDisplay = student.login || student.email;
      await sendTelegramMessage(chatId, `Welcome back, ${escapeHtml(student.name)}. Your course access is active. Sign in using login <code>${escapeHtml(loginDisplay)}</code> and your password. Password recovery is available only by email: ${AUTHOR_EMAIL}.`, courseKeyboard());
      return;
    }
    if (activeStudent && student.legacyPasswordHash) {
      await sendTelegramMessage(chatId, `Welcome back, ${escapeHtml(student.name)}. Your course admission is active. Sign in with your existing access code; contact support if you need help moving to a personal password.`, courseKeyboard());
      return;
    }
    if (activeStudent && student.admissionApprovedAt) {
      if (student.login) {
        await sendTelegramMessage(chatId, `Your admission is approved. Your login is <code>${escapeHtml(student.login)}</code>. Use it with your password to sign in. If you lost the password, ask an admin to reset it.`, courseKeyboard());
        return;
      }
      const sent = await sendSharedRegistrationLink(student);
      if (!sent) await sendTelegramMessage(chatId, `Your admission is approved. Send /register to get the shared registration link again, or contact support at ${AUTHOR_EMAIL}.`);
      return;
    }
    if (student?.registrationStatus === 'PENDING_APPROVAL') {
      const hasPaid = student && store.tribute.orders.some(o => o.studentId === student.id && o.status === 'PAID');
      if (hasPaid) {
        const paidOrder = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID');
        const started = await sendPaymentStartNotice(student, paidOrder);
        if (started) return;
        await sendTelegramMessage(chatId, 'Your Tribute payment is verified. The start link appears above as soon as the course link is configured; meanwhile send /register to receive your login and password automatically, or wait for admin approval.');
        return;
      }
      await sendTelegramMessage(chatId, 'Your access request is waiting for the course admin to verify the purchase and approve admission. I will send the access link here after approval.');
      return;
    }
    if (student?.subscriptionExpiresAt && student.active !== false) {
      await sendTelegramMessage(chatId, `Your course subscription expired on ${escapeHtml(new Date(student.subscriptionExpiresAt).toLocaleDateString('en-GB'))}. Manage renewal through Tribute. Purchases remain outside the course app.`);
      return;
    }
    const purchaseHint = tributePurchaseUrl() ? ` Get access here: ${tributePurchaseUrl()}` : '';
    const botHint = BOT_START_URL ? ` After payment, open this bot again — it checks payment automatically.` : '';
    await sendTelegramMessage(chatId, `Welcome to Contemporary Horeca Scene. Purchases happen in Tribute, outside the course app.${purchaseHint} Open this bot before paying.${botHint} After payment, send /register to receive your login and password automatically, or the admin will approve access manually.`);
    return;
  }

  if (command === '/register' || command === '/link') {
    // Try auto-credentials first if a verified Tribute payment exists
    if (student && !student.passwordHash && !student.legacyPasswordHash) {
      const paidOrder = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID');
      if (paidOrder) {
        const cred = await issueCredentialsForStudent(student, paidOrder, 'bot-register');
        if (cred.ok) return;
      }
    }
    if (!student) {
      student = createAccessRequestFromTelegram(message);
      if (student) await notifyAdmissionAdmins(student);
    } else if (student.registrationStatus === 'PENDING_APPROVAL') {
      // If payment already verified, try auto-issue again before notifying admins
      const paidOrder = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID');
      if (paidOrder && !student.passwordHash && !student.legacyPasswordHash) {
        const cred = await issueCredentialsForStudent(student, paidOrder, 'bot-register');
        if (cred.ok) return;
      }
      await notifyAdmissionAdmins(student);
    }
    if (!student) {
      await sendTelegramMessage(chatId, `I could not create an access request. Please contact support at ${AUTHOR_EMAIL}.`);
      return;
    }
    if (student.active && student.admissionApprovedAt && !student.passwordHash && !student.legacyPasswordHash) {
      const sent = await sendSharedRegistrationLink(student);
      if (sent) return;
      await sendTelegramMessage(chatId, `Your admission is approved, but the shared registration link could not be sent. Please try again or contact ${AUTHOR_EMAIL}.`);
      return;
    }
    if (student.active && student.passwordHash) {
      const loginDisplay = student.login || student.email;
      await sendTelegramMessage(chatId, `Your account is already registered. Sign in with login <code>${escapeHtml(loginDisplay)}</code> and your password; password recovery is available only by email: ${AUTHOR_EMAIL}.`, courseKeyboard());
      return;
    }
    if (student.active && student.legacyPasswordHash) {
      await sendTelegramMessage(chatId, 'Your admission is active. Use your existing access code to sign in; contact support if you need help moving to a personal password.', courseKeyboard());
      return;
    }
    if (student.registrationStatus === 'REJECTED') {
      await sendTelegramMessage(chatId, `Your admission request was not approved. Contact support by email if you believe this is an error: ${AUTHOR_EMAIL}.`);
      return;
    }
    // If payment is already verified but access is not opened yet, resend the start link.
    const hasPaid = student && store.tribute.orders.some(o => o.studentId === student.id && o.status === 'PAID');
    if (hasPaid) {
      const paidOrder = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID');
      const started = await sendPaymentStartNotice(student, paidOrder);
      if (started) return;
      await sendTelegramMessage(chatId, 'Your Tribute payment is verified. I am generating your login and password now — please wait a moment and send /register again if you do not receive them.');
      return;
    }
    await sendTelegramMessage(chatId, 'Your request is in the admission queue. The course admin will verify payment in Tribute and approve or reject access here. The shared registration link or auto-generated login will be sent after approval.');
    return;
  }

  if (command === '/password') {
    if (activeStudent && student.passwordHash) {
      await sendTelegramMessage(chatId, `For security, the course bot never sends or reveals your personal password. If you have forgotten it, contact support by email: ${AUTHOR_EMAIL}.`);
      return;
    }
    await sendTelegramMessage(chatId, `Password recovery is available only for a registered, approved learner. Contact support by email: ${AUTHOR_EMAIL}.`);
    return;
  }

  if (command === '/help') {
    await sendTelegramMessage(chatId, `Purchases happen in Tribute. After a verified payment the start link appears in this chat right away; send /register to receive it again, to request admission or to get the shared registration page after approval. Use /id to see the Telegram ID to enter when registering. Project questions are sent from the live Project Q&A page after sign-in. Forgotten passwords can be recovered only through support by email: ${AUTHOR_EMAIL}.`);
    return;
  }

  await sendTelegramMessage(chatId, `Use /start for course access information, /register to request admission or get the shared link after approval, /id to see your Telegram ID, or /password for recovery instructions. Support: ${AUTHOR_EMAIL}.`);
}

/* Set once the Russian inline-button admin console is constructed (bottom of this file). */
let adminConsoleRef = null;

async function notifyAdminsOnSubmission(submission) {
  const fileNames = (submission.files || []).map(f => f.name).join(', ') || 'No files';
  addBotLog('submission', `New submission ${submission.id} from ${submission.name} (${submission.assignment}) · Files: ${fileNames}`);
  if (adminConsoleRef) {
    await adminConsoleRef.notifySubmission(submission);
    return;
  }
  const summary = `📩 <b>New submission: ${submission.assignment}</b>\nStudent: ${submission.name} (${submission.student})\nFiles: ${fileNames}\nID: <code>${submission.id}</code>\n\nAnswer:\n${submission.answer.slice(0, 600)}`;
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
  if (!cmdLine) return { ok: false, reply: 'Enter a command, for example: /admissions, /admit <student_id>, /reject <student_id>, /pending, /orders, /resend <telegram_id>, /approve <id> <feedback>, /revise <id> <feedback>, /students' };
  const [cmdToken, ...args] = cmdLine.split(/\s+/);
  const command = cmdToken.split('@')[0].toLowerCase();

  if (command === '/start' || command === '/help') {
    const reply = [
      '🤖 <b>Contemporary Horeca Scene Admin Bot</b>',
      'Available commands:',
      '• <code>/pending</code> — list submissions awaiting review',
      '• <code>/approve &lt;id&gt; &lt;feedback&gt;</code> — approve an assignment and send feedback to the student',
      '• <code>/revise &lt;id&gt; &lt;feedback&gt;</code> — request a revision with feedback',
      '• <code>/admissions</code> — list learners waiting for manual payment verification',
      '• <code>/admit &lt;student_id&gt;</code> — approve a verified purchase and send the shared registration link',
      '• <code>/reject &lt;student_id&gt;</code> — reject a pending admission request',
      '• <code>/issue &lt;telegram_id&gt;</code> — generate login+password for a Tribute-paid learner (only after confirmed payment) and send via bot',
      '• <code>/reset &lt;telegram_id&gt;</code> — generate a new password for an existing login',
      '• <code>/credentials [telegram_id]</code> — show issued logins or a single login status',
      '• <code>/students</code> — list learners, admission status and delivery',
      '• <code>/orders</code> — inspect recent Tribute payment events and approval status',
      '• <code>/resend &lt;telegram_id&gt;</code> — resend the shared registration page or password-recovery instructions',
      '• <code>/addmat &lt;module&gt; &lt;https url&gt; &lt;description&gt;</code> — add material to the end of a module block',
      '• <code>/materials [module]</code> · <code>/editmat &lt;id&gt; [url] &lt;description&gt;</code> · <code>/delmat &lt;id&gt;</code> — manage the library',
      '• <code>/post &lt;title&gt; | &lt;text&gt;</code> · <code>/posts</code> · <code>/delpost &lt;id&gt;</code> — publish course updates',
      '• <code>/editmodule &lt;module&gt; [field] &lt;text&gt;</code> · <code>/editlesson &lt;lesson&gt; [field] &lt;text&gt;</code> — edit course copy',
      '• <code>/overrides</code> · <code>/revert &lt;id&gt;</code> — review or undo copy edits',
      '• Inline panel: 🖼 <b>Photo &amp; backgrounds</b> — send a photo in the chat to replace any block image or background.',
    ].join('\n');
    addBotLog('command', `${cmdLine} → admin help displayed`);
    return { ok: true, reply };
  }

  if (command === '/chat') {
    const course = configuredHttpsUrl(COURSE_URL);
    if (!course) return { ok: false, reply: 'The course URL is not configured. Set COURSE_URL to open Project Q&A.' };
    const chatUrl = new URL('#/chat', course).toString();
    return { ok: true, reply: `💬 <a href="${escapeHtml(chatUrl)}">Open Project Q&A inbox</a>` };
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

  if (command === '/admissions') {
    const waiting = pendingAdmissions();
    if (!waiting.length) return { ok: true, reply: 'No student admissions are waiting for manual approval.' };
    const reply = waiting.slice(0, 30).map(student => {
      const orders = store.tribute.orders.filter(order => order.studentId === student.id && order.status === 'PAID');
      const payment = orders.length
        ? orders.slice(0, 3).map(order => `${order.id} · ${order.amount || 'amount not reported'}`).join(', ')
        : 'manual access request — verify payment separately';
      return `• <code>${escapeHtml(student.id)}</code> · ${escapeHtml(student.name)} · Telegram ${escapeHtml(student.telegramUsername ? `@${student.telegramUsername}` : student.telegramId || 'unknown')} · ${escapeHtml(payment)}`;
    }).join('\n');
    addBotLog('command', `/admissions → ${waiting.length} requests`);
    return { ok: true, reply: `🛂 <b>Pending admissions (${waiting.length})</b>\n${reply}\n\nAfter verifying the payment in Tribute, use <code>/admit STUDENT_ID</code> or <code>/reject STUDENT_ID</code>.` };
  }

  if (command === '/admit') {
    const identifier = String(args[0] || '').trim();
    if (!identifier) return { ok: false, reply: 'Usage: /admit <student_id>. Check IDs with /admissions.' };
    const result = await admitStudent(identifier, 'admin-bot');
    if (result.error) return { ok: false, reply: `⚠️ ${escapeHtml(result.error)}` };
    addBotLog('command', `/admit → ${result.student.id} (${result.linkSent ? 'shared link sent' : 'link delivery pending'})`);
    return { ok: true, reply: `✅ <b>${escapeHtml(result.student.name)}</b> admitted. ${result.linkSent ? 'The reusable shared registration page was sent by Telegram.' : `The registration page could not be delivered automatically; check COURSE_URL and BOT_TOKEN, then use /resend ${escapeHtml(result.student.telegramId || '')}.`}` };
  }

  if (command === '/reject') {
    const identifier = String(args[0] || '').trim();
    if (!identifier) return { ok: false, reply: 'Usage: /reject <student_id>. Check IDs with /admissions.' };
    const result = await rejectStudent(identifier);
    if (result.error) return { ok: false, reply: `⚠️ ${escapeHtml(result.error)}` };
    addBotLog('command', `/reject → ${result.student.id}`);
    return { ok: true, reply: `⛔ Admission request for ${escapeHtml(result.student.name)} was rejected.` };
  }

  if (command === '/students') {
    const learners = store.students.filter(student => student.source?.startsWith('tribute-'));
    if (!learners.length) return { ok: true, reply: 'No Tribute-paid learners have been recorded yet.' };
    const reply = learners.slice(0, 20).map(student => (
      `• ${escapeHtml(student.name)} (${escapeHtml(student.email)}) · ${isStudentAccessActive(student) ? 'ACTIVE' : 'INACTIVE'} · account ${student.passwordHash ? 'REGISTERED' : student.legacyPasswordHash ? 'LEGACY ACCESS' : 'REGISTRATION PENDING'} · link ${escapeHtml(student.registrationLinkDeliveryStatus || 'UNKNOWN')} · Telegram ${escapeHtml(student.telegramId || 'not linked')}`
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
    const student = findStudentByTelegramId(telegramId, true);
    if (!student || !isStudentAccessActive(student) || !student.admissionApprovedAt) {
      return { ok: false, reply: 'No active, approved learner was found for that Telegram ID. Review pending requests with /admissions.' };
    }
    if (student.passwordHash) {
      const sent = await sendTelegramMessage(
        student.telegramId,
        `The course password cannot be retrieved or resent. The learner must contact support by email if it has been forgotten: ${AUTHOR_EMAIL}.`,
      );
      addBotLog('command', `/resend → password recovery notice ${sent ? 'sent' : 'failed'} for Telegram user ${telegramId}`);
      return { ok: sent, reply: sent ? `Password recovery instructions were sent to Telegram user ${telegramId}.` : `Delivery failed. Ask the learner to contact support at ${AUTHOR_EMAIL}.` };
    }
    const sent = student.legacyPasswordHash
      ? await sendTelegramMessage(student.telegramId, 'Your course admission is active. Use your existing access code to sign in; contact support if you need to move to a personal password.', courseKeyboard())
      : await sendSharedRegistrationLink(student);
    addBotLog('command', `/resend → shared registration page delivery ${sent ? 'succeeded' : 'failed'} for Telegram user ${telegramId}`);
    return { ok: sent, reply: sent ? `✅ The reusable shared registration page was sent to Telegram user ${telegramId}.` : `Delivery failed. Ask the learner to open the Access Bot and send /register, then check COURSE_URL and BOT_TOKEN.` };
  }

  if (command === '/issue' || command === '/give' || command === '/createaccess') {
    const identifier = String(args[0] || '').trim().replace(/^@/, '');
    if (!identifier) return { ok: false, reply: 'Usage: /issue <telegram_id|@username|student_id> — generates a login and password, but only if a confirmed Tribute payment exists.' };
    let student = store.students.find(item => (
      item.id === identifier
      || String(item.telegramId || '') === identifier
      || String(item.telegramUsername || '').toLowerCase() === identifier.toLowerCase()
    ));
    if (!student) {
      const order = store.tribute.orders.find(o => String(o.telegramId || '') === identifier || String(o.telegramUsername || '').toLowerCase() === identifier.toLowerCase());
      if (order) student = store.students.find(s => s.id === order.studentId) || null;
    }
    if (!student) return { ok: false, reply: `No learner found for "${escapeHtml(identifier)}". Check /admissions or /orders for the correct Telegram ID.` };
    const order = store.tribute.orders.find(o => o.studentId === student.id && o.status === 'PAID') || null;
    const result = await issueCredentialsForStudent(student, order, 'admin-issue');
    if (result.error) return { ok: false, reply: `Cannot issue credentials: ${escapeHtml(result.error)}` };
    const note = result.sent ? 'Credentials sent via Telegram.' : `Credentials generated but not delivered: ${escapeHtml(result.warning || 'check BOT_TOKEN')}`;
    return { ok: true, reply: `Credentials issued for <b>${escapeHtml(student.name)}</b> (Telegram ${escapeHtml(student.telegramId || 'unknown')})\nLogin: <code>${escapeHtml(result.login)}</code>\nPassword: <code>${escapeHtml(result.password)}</code>\n${note}\nSave this password — it will not be shown again. The learner can now sign in at ${escapeHtml(configuredHttpsUrl(COURSE_URL) || 'the course app')} with login and password.` };
  }

  if (command === '/reset' || command === '/resetpass' || command === '/resetpassword') {
    const identifier = String(args[0] || '').trim().replace(/^@/, '');
    if (!identifier) return { ok: false, reply: 'Usage: /reset <telegram_id|@username|student_id> — generates a new password for an existing login.' };
    const student = store.students.find(item => (
      item.id === identifier
      || String(item.telegramId || '') === identifier
      || String(item.telegramUsername || '').toLowerCase() === identifier.toLowerCase()
      || String(item.login || '').toLowerCase() === identifier.toLowerCase()
    ));
    if (!student) return { ok: false, reply: `No learner found for "${escapeHtml(identifier)}".` };
    if (!student.login && !student.passwordHash) return { ok: false, reply: 'This learner has no credentials yet. Use /issue to create them first.' };
    const result = await resetCredentialsForStudent(student, 'admin-reset');
    if (result.error) return { ok: false, reply: `Reset failed: ${escapeHtml(result.error)}` };
    return { ok: true, reply: `Password reset for <b>${escapeHtml(student.name)}</b>\nLogin: <code>${escapeHtml(result.login)}</code>\nNew password: <code>${escapeHtml(result.password)}</code>\n${result.sent ? 'Sent via Telegram.' : `Not delivered: ${escapeHtml(result.warning || 'check BOT_TOKEN')}`}` };
  }

  if (command === '/credentials' || command === '/creds' || command === '/login') {
    const identifier = String(args[0] || '').trim().replace(/^@/, '');
    if (!identifier) {
      const learners = store.students.filter(s => s.login).slice(0, 20);
      if (!learners.length) return { ok: true, reply: 'No issued logins yet. Use /issue <telegram_id> after a verified Tribute payment to generate one.' };
      const reply = learners.map(s => `• <code>${escapeHtml(s.login)}</code> · ${escapeHtml(s.name)} · Telegram ${escapeHtml(s.telegramId || '—')} · ${isStudentAccessActive(s) ? 'ACTIVE' : 'INACTIVE'} · ${escapeHtml(s.registrationStatus || '—')}`).join('\n');
      return { ok: true, reply: `Issued logins (${learners.length}):\n${reply}` };
    }
    const student = store.students.find(item => (
      item.id === identifier
      || String(item.telegramId || '') === identifier
      || String(item.telegramUsername || '').toLowerCase() === identifier.toLowerCase()
      || String(item.login || '').toLowerCase() === identifier.toLowerCase()
    ));
    if (!student) return { ok: false, reply: `No learner found for "${escapeHtml(identifier)}".` };
    const hasPaid = store.tribute.orders.some(o => o.studentId === student.id && o.status === 'PAID');
    return { ok: true, reply: `Login info for <b>${escapeHtml(student.name)}</b>:\nLogin: <code>${escapeHtml(student.login || 'not issued')}</code>\nEmail: ${escapeHtml(student.email)}\nTelegram: ${escapeHtml(student.telegramUsername ? `@${student.telegramUsername}` : student.telegramId || 'not linked')}\nStatus: ${isStudentAccessActive(student) ? 'ACTIVE' : 'INACTIVE'} · ${escapeHtml(student.registrationStatus || '—')}\nPaid Tribute order: ${hasPaid ? 'yes' : 'no'}\nPassword: cannot be displayed (stored as hash); use /reset to generate a new one.` };
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

/* Russian inline-button admin console (admin-bot.ru.js): menus, block editor, reviews. */
const adminConsole = createAdminConsole({
  store: () => store,
  saveStore,
  addBotLog,
  escapeHtml,
  editorId,
  validHttpsUrl,
  sendTelegramMessage,
  editTelegramMessage,
  answerCallbackQuery,
  executeBotCommand,
  applyAdminReview,
  isStudentAccessActive,
  getTributeStatus,
  courseData: () => COURSE_DATA,
  courseModules: () => COURSE_MODULES,
  siteDefaults: () => SITE_DEFAULTS,
  validImageReference,
  ingestTelegramPhoto,
  removeMedia: removeStoreMedia,
  mediaPublicUrl,
  sendTelegramPhoto,
});
adminConsoleRef = adminConsole;

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
        if ((message?.text || message?.photo || message?.document) && message?.chat?.id) {
          const chatId = String(message.chat.id);
          const admin = store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId);
          const adminCommand = String(message.text || '').match(/^\/admin(?:@[A-Za-z0-9_]+)?\s+(.+)$/s);
          if (adminCommand) {
            if (matchesMasterPassword(adminCommand[1].trim())) {
              if (!store.adminBot.adminChatIds.includes(chatId)) {
                store.adminBot.adminChatIds.push(chatId);
                saveStore();
              }
              await adminConsole.showAuthorized(chatId);
            }
          } else if (admin) {
            await adminConsole.handleAdminMessage(message);
          } else {
            await handleAccessBotMessage(message);
          }
        }

        const callback = update.callback_query;
        if (callback?.data && callback?.message?.chat?.id) {
          const chatId = String(callback.message.chat.id);
          if (store.adminBot.adminChatIds.includes(chatId) || ADMIN_IDS.has(chatId)) {
            const [action, studentId] = String(callback.data).split(':');
            if ((action === 'admit' || action === 'reject') && studentId) {
              const result = action === 'admit'
                ? await admitStudent(studentId, 'admin-button')
                : await rejectStudent(studentId);
              const ok = !result.error;
              await answerCallbackQuery(callback.id, ok ? (action === 'admit' ? 'Admission approved.' : 'Admission rejected.') : result.error);
              const name = result.student?.name || 'learner';
              const text = result.error
                ? `⚠️ ${escapeHtml(result.error)}`
                : action === 'admit'
                  ? `✅ <b>${escapeHtml(name)}</b> approved by admin. ${result.linkSent ? 'The shared registration page was sent.' : 'Link delivery is pending; use /resend after checking bot configuration.'}`
                  : `⛔ Admission request for <b>${escapeHtml(name)}</b> rejected.`;
              await editTelegramMessage(chatId, callback.message.message_id, text, { inline_keyboard: [] });
            } else {
              await adminConsole.handleCallback(callback);
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
    (telegramId && String(student.telegramId || '') === telegramId)
    || (tributeUserId && String(student.tributeUserId || '') === tributeUserId)
    || (subscriptionId && String(student.subscriptionId || '') === subscriptionId)
    || (email && !student.telegramId && String(student.email || '').toLowerCase() === email)
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
    deliveryStatus: 'AWAITING_APPROVAL',
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
    if (previous.status === 'PAID' && ['PENDING', 'APPROVED_LINK_PENDING'].includes(previous.deliveryStatus)) {
      const student = store.students.find(item => item.id === previous.studentId);
      if (student?.admissionApprovedAt && isStudentAccessActive(student)) {
        await deliverTributeOrder(previous, student, { force: true });
      }
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
        await sendTelegramMessage(student.telegramId, 'A refund was recorded for your course purchase, so course access is no longer active. Please contact the course team if you believe this is a mistake.');
      }
    }
    saveStore();
    addBotLog('tribute', `Tribute refund ${id} recorded${student ? ` for ${student.name}` : ' without a matching purchase'}.`);
    return { status: 200, body: { ok: true, refunded: Boolean(paidOrder) } };
  }

  const telegramId = String(payload.telegram_user_id || payload.telegramId || '').trim();
  if (!/^\d{1,20}$/.test(telegramId)) {
    return { status: 400, body: { ok: false, error: 'A valid Tribute telegram_user_id is required to create the admission request' } };
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
      student = createStudentAccount({
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
    /* A signed payment renews access only for an already admitted learner; first-time access stays pending admin approval. */
    student.active = Boolean(student.admissionApprovedAt || student.passwordHash || student.legacyPasswordHash || student.active === true);
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
      addBotLog('tribute', `Tribute purchase ${id} was already refunded; no registration access was issued.`);
      return { status: 200, body: { ok: true, refunded: true } };
    }
    if (!student) {
      student = createStudentAccount({
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
      student.active = Boolean(student.admissionApprovedAt || student.passwordHash || student.legacyPasswordHash || student.active === true);
    }
  }

  const kind = isSubscriptionEvent ? 'subscription' : 'digital-product';
  const order = tributeOrderBase(eventName, payload, event, id, kind, student);
  store.tribute.orders.unshift(order);
  if (store.tribute.orders.length > 5000) store.tribute.orders.length = 5000;
  saveStore();
  if (AUTO_CREDENTIALS && !student.passwordHash && !student.legacyPasswordHash) {
    const autoCred = await issueCredentialsForStudent(student, order, 'webhook-auto');
    if (autoCred.ok) {
      order.deliveryStatus = 'DELIVERED';
      saveStore();
      return { status: 200, body: { ok: true, issued: true, deliveryStatus: order.deliveryStatus, autoCredentials: true, login: autoCred.login } };
    }
  }
  if (student.admissionApprovedAt && isStudentAccessActive(student)) {
    addBotLog('tribute', `Tribute ${eventName} ${id} confirmed for already-approved learner ${student.name}; course notice delivery started.`);
    await deliverTributeOrder(order, student, { force: true });
  } else {
    order.deliveryStatus = 'AWAITING_APPROVAL';
    student.active = false;
    student.registrationStatus = 'PENDING_APPROVAL';
    student.admissionRequestedAt = student.admissionRequestedAt || new Date().toISOString();
    saveStore();
    await notifyAdmissionAdmins(student, order);
    /* The buyer gets a convenient start link immediately after the verified payment;
       registration itself stays limited to the Telegram account the admin approves. */
    await sendPaymentStartNotice(student, order);
  }
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

  /* --- 0b. Public editable site copy (gate + landing defaults + admin overrides) --- */
  if (pathname === '/api/site') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return respond(res, 405, 'Method not allowed');
    return json(res, 200, siteCopyWithOverrides());
  }

  /* --- 1. Shared-link registration, restricted to manually approved Telegram accounts --- */
  if (pathname === '/api/register') {
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress || 'local';
    const retryAfter = throttle(ip);
    if (retryAfter > 0) {
      return json(res, 429, { error: 'Too many attempts', retryAfter }, { 'Retry-After': String(retryAfter) });
    }

    let payload;
    try {
      payload = JSON.parse(await readBody(req, 32768) || '{}');
    } catch (error) {
      if (error.status === 413) return json(res, 413, { error: 'Request too large' });
      return json(res, 400, { error: 'Invalid request body' });
    }

    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password ?? '');
    const telegramIdentity = String(payload.telegramIdentity || payload.telegram || '').trim().replace(/^@/, '');
    if (!name || name.length > 100) return json(res, 400, { error: 'Enter a name of 1 to 100 characters.' });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: 'Enter a valid email address.' });
    }
    if (!/^\d{1,20}$/.test(telegramIdentity) && !/^[A-Za-z0-9_]{5,32}$/.test(telegramIdentity)) {
      return json(res, 400, { error: 'Enter the Telegram username or numeric ID you used with the course bot.' });
    }
    if (password.length < 10 || password.length > 128) {
      return json(res, 400, { error: 'Your password must be between 10 and 128 characters.' });
    }

    const student = approvedTelegramStudent(telegramIdentity);
    if (!student) {
      const candidate = store.students.find(item => (
        /^\d{1,20}$/.test(telegramIdentity)
          ? String(item.telegramId || '') === telegramIdentity
          : String(item.telegramUsername || '').toLowerCase() === telegramIdentity.toLowerCase()
      ));
      const error = candidate?.registrationStatus === 'REJECTED'
        ? `This Telegram account was not approved. Contact course support at ${AUTHOR_EMAIL}.`
        : candidate?.registrationStatus === 'PENDING_APPROVAL'
          ? 'Your payment is awaiting manual approval in the course bot. The shared registration link will work after approval.'
          : `No approved admission matches this Telegram account. Open the course bot and send /register after paying through Tribute. Support: ${AUTHOR_EMAIL}.`;
      return json(res, 403, { error });
    }
    if (student.passwordHash) {
      return json(res, 409, { error: 'This course account has already been registered. Sign in with your email and password.' });
    }

    const duplicateEmail = store.students.some(item => (
      item.id !== student.id
      && (item.passwordHash || item.legacyPasswordHash)
      && String(item.email || '').trim().toLowerCase() === email
    ));
    if (duplicateEmail) return json(res, 409, { error: 'An account already uses this email. Sign in or contact course support.' });

    const now = new Date().toISOString();
    student.name = name;
    student.email = email;
    student.passwordHash = hashStudentPassword(password);
    delete student.legacyPasswordHash;
    student.registeredAt = now;
    student.registrationStatus = 'REGISTERED';
    student.registrationLinkDeliveryStatus = 'REGISTERED';
    student.registrationCompletedAt = now;
    delete student.password;
    for (const order of store.tribute.orders) {
      if (order.studentId === student.id && order.status === 'PAID') {
        order.deliveryStatus = 'REGISTERED';
        order.registrationCompletedAt = now;
      }
    }
    saveStore();
    attempts.delete(ip);
    const token = issueToken(student.id);
    return json(res, 201, {
      unlocked: true,
      token,
      course: 'Contemporary Horeca Scene',
      user: studentProfile(student),
    }, { 'Set-Cookie': cookieHeader(token, req) });
  }

  /* --- 2. Course Access API (/api/access) --- */
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
    const candidate = String(payload.password ?? '');
    const clientId = String(payload.clientId || '').trim() || ip;

    /* Check master/admin password BEFORE the attempt throttle: on shared-proxy
       deployments (BotHost) student mistypes from the same proxy IP must never
       lock the administrator out of the course. Wrong entries still consume
       attempts below, before personal password lookups. */
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

    /* New accounts use email or generated login + a scrypt-hashed password.
       Legacy paid access codes remain accepted only while an older learner migrates. */
    const retryAfter = throttle(ip);
    if (retryAfter > 0) {
      return json(res, 429, { error: 'Too many attempts', retryAfter }, { 'Retry-After': String(retryAfter) });
    }
    const identifier = String(payload.login || payload.email || '').trim().toLowerCase();
    const email = String(payload.email || '').trim().toLowerCase();
    const effectiveId = identifier || email;
    const personal = store.students.find(student => {
      if (student.legacyPasswordHash) {
        return verifyStudentPassword(candidate.toUpperCase(), student.legacyPasswordHash);
      }
      if (student.passwordHash) {
        const storedLogin = String(student.login || '').toLowerCase();
        const storedEmail = String(student.email || '').toLowerCase();
        const matches = Boolean(effectiveId) && (storedLogin === effectiveId || storedEmail === effectiveId);
        if (!matches) return false;
        return verifyStudentPassword(candidate, student.passwordHash);
      }
      return false;
    });
    if (personal) {
      if (!isStudentAccessActive(personal)) {
        const expired = Boolean(personal.subscriptionExpiresAt && Date.parse(personal.subscriptionExpiresAt) <= Date.now());
        return json(res, 403, {
          unlocked: false,
          error: expired
            ? 'This subscription has expired. Manage renewal through Tribute or contact course support.'
            : 'This course account is no longer active. Please contact course support.',
        });
      }
      if (!personal.passwordHash && personal.boundClientId && personal.boundClientId !== clientId) {
        return json(res, 403, {
          unlocked: false,
          error: 'This legacy access code is already active on another device. Contact course support if you need help moving the account.',
        });
      }
      if (!personal.passwordHash && !personal.boundClientId) {
        personal.boundClientId = clientId;
        personal.boundAt = new Date().toISOString();
      }
      if (payload.name && (!personal.name || personal.name === 'Tribute Buyer')) {
        personal.name = String(payload.name).trim();
      }
      if (payload.email && personal.email.endsWith('@chs.local')) {
        personal.email = email;
      }
      saveStore();
      attempts.delete(ip);
      const token = issueToken(personal.id);
      return json(res, 200, {
        unlocked: true,
        token,
        course: 'Contemporary Horeca Scene',
        user: studentProfile(personal),
      }, { 'Set-Cookie': cookieHeader(token, req) });
    }

    return json(res, 401, {
      unlocked: false,
      error: 'Email or password is incorrect. First-time learners need a Tribute payment: after payment the bot sends a login and password automatically (or the admin approves the Telegram account for the shared registration page). The administrator master password opens the admin panel only.'
    });
  }

  /* --- 3. Tribute payment status and signed webhook ----------------------- */
  if (pathname === '/api/tribute/status') {
    if (req.method !== 'GET' && req.method !== 'HEAD') return respond(res, 405, 'Method not allowed');
    return json(res, 200, getTributeStatus());
  }

  if (pathname === '/api/tribute/checkout') {
    return json(res, 410, { ok: false, error: 'Direct/demo checkout has been removed. Purchases happen in Tribute; a signed payment event and manual admin approval are required before registration.' });
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

  /* --- 4a. Private, authenticated real-time project Q&A -------------------- */
  if (pathname === '/api/chat/threads') {
    if (req.method !== 'GET') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session || !session.isAdmin) return json(res, 403, { error: 'Administrator access required' });
    const threads = store.students
      .filter(student => isStudentAccessActive(student))
      .map(student => {
        const messages = store.chats.filter(message => message.studentId === student.id);
        const lastMessage = messages.at(-1) || null;
        return {
          student: { id: student.id, name: student.name, email: student.email, telegramUsername: student.telegramUsername || null },
          lastMessage: lastMessage?.text || '',
          lastMessageAt: lastMessage?.createdAt || student.createdAt || '',
          unreadCount: messages.filter(message => message.senderRole === 'STUDENT' && !message.readByAdmin).length,
        };
      })
      .sort((a, b) => String(b.lastMessageAt).localeCompare(String(a.lastMessageAt)));
    return json(res, 200, { threads });
  }

  if (pathname === '/api/chat/stream') {
    if (req.method !== 'GET') return respond(res, 405, 'Method not allowed');
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    const requestedStudentId = String(parsedUrl.searchParams.get('studentId') || '').trim();
    const studentId = session.isAdmin ? requestedStudentId : session.user.id;
    if (session.isAdmin && studentId && !store.students.some(student => student.id === studentId)) {
      return json(res, 404, { error: 'Student chat not found' });
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff',
    });
    res.flushHeaders?.();
    const streamId = crypto.randomBytes(12).toString('hex');
    const stream = { response: res, studentId, isAdmin: session.isAdmin };
    chatStreams.set(streamId, stream);
    writeChatEvent(res, 'snapshot', {
      studentId: studentId || null,
      messages: studentId ? chatMessagesForStudent(studentId) : [],
    });
    const heartbeat = setInterval(() => {
      try { res.write([': keep-alive', '', ''].join('\n')); } catch { /* client disconnected */ }
    }, 25_000);
    res.on('close', () => {
      clearInterval(heartbeat);
      chatStreams.delete(streamId);
    });
    return;
  }

  if (pathname === '/api/chat') {
    const session = resolveSession(req);
    if (!session) return json(res, 403, { error: 'Course access required' });
    if (req.method === 'GET') {
      const requestedStudentId = String(parsedUrl.searchParams.get('studentId') || '').trim();
      const studentId = session.isAdmin ? requestedStudentId : session.user.id;
      if (session.isAdmin && !studentId) return json(res, 400, { error: 'Select a student chat.' });
      const student = store.students.find(item => item.id === studentId);
      if (!student) return json(res, 404, { error: 'Student chat not found' });
      const messages = chatMessagesForStudent(studentId);
      let changed = false;
      for (const message of messages) {
        if (session.isAdmin && message.senderRole === 'STUDENT' && !message.readByAdmin) {
          message.readByAdmin = true;
          changed = true;
        } else if (!session.isAdmin && message.senderRole === 'ADMIN' && !message.readByStudent) {
          message.readByStudent = true;
          changed = true;
        }
      }
      if (changed) saveStore();
      return json(res, 200, {
        student: { id: student.id, name: student.name, email: student.email, telegramUsername: student.telegramUsername || null },
        messages,
      });
    }
    if (req.method !== 'POST') return respond(res, 405, 'Method not allowed');
    let payload;
    try {
      payload = JSON.parse(await readBody(req, 16_384) || '{}');
    } catch (error) {
      return json(res, error.status === 413 ? 413 : 400, { error: error.status === 413 ? 'Message is too large' : 'Invalid JSON' });
    }
    const targetId = session.isAdmin ? String(payload.studentId || '').trim() : session.user.id;
    const student = store.students.find(item => item.id === targetId);
    if (!student || !isStudentAccessActive(student)) return json(res, 403, { error: 'An active student account is required for Project Q&A.' });
    const text = String(payload.text || '').trim();
    const project = String(payload.project || '').trim();
    if (!text || text.length > 3000) return json(res, 400, { error: 'Write a message of 1 to 3,000 characters.' });
    if (project.length > 120) return json(res, 400, { error: 'Project name must be 120 characters or fewer.' });
    if (!allowChatMessage(session.user.id)) return json(res, 429, { error: 'Message limit reached. Please wait a minute before sending again.' });
    const message = {
      id: `chat-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      studentId: student.id,
      senderId: session.user.id,
      senderRole: session.isAdmin ? 'ADMIN' : 'STUDENT',
      senderName: session.isAdmin ? (session.user.name || 'Course team') : student.name,
      project,
      text,
      createdAt: new Date().toISOString(),
      readByStudent: !session.isAdmin,
      readByAdmin: Boolean(session.isAdmin),
    };
    store.chats.push(message);
    if (store.chats.length > 10_000) store.chats.splice(0, store.chats.length - 10_000);
    saveStore();
    publishChatMessage(message);
    if (session.isAdmin) {
      if (student.telegramId) void sendTelegramMessage(student.telegramId, 'The course team replied to your project question. Open Contemporary Horeca Scene and visit Project Q&A.');
    } else {
      addBotLog('chat', `New Project Q&A message from ${student.name} (${student.id}).`);
      for (const adminId of store.adminBot.adminChatIds) {
        void sendTelegramMessage(adminId, `💬 <b>New project question</b>\n${escapeHtml(student.name)}${project ? ` · ${escapeHtml(project)}` : ''}\nOpen the Admin Panel → Project Q&A to reply.`);
      }
    }
    return json(res, 201, { ok: true, message });
  }

  /* --- 4. Platform State & Submissions API (/api/state, /api/submissions) --- */
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
        media: session.isAdmin ? store.editor.media : [],
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

  /* --- 5. Admin Review, Account Management & Bot Console API --- */
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

  /* --- public media library: photos uploaded by the administrator in the bot --- */
  const mediaMatch = pathname.match(/^\/media\/([A-Za-z0-9._-]+)$/);
  if (mediaMatch) {
    const record = mediaRecordForFile(mediaMatch[1]);
    const diskPath = path.join(UPLOAD_DIR, path.basename(mediaMatch[1]));
    if (!record || !fs.existsSync(diskPath)) return respond(res, 404, 'Image not found');
    const stat = fs.statSync(diskPath);
    res.writeHead(200, {
      'Content-Type': record.type || MEDIA_TYPES[path.extname(diskPath).slice(1).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') return res.end();
    return fs.createReadStream(diskPath).pipe(res);
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
  console.log(`Course access: ${PASSWORDS.length} master password(s) + ${store.students.length} Tribute-linked student account(s)`);
});

server.on('error', error => {
  console.error('Unable to start the web app:', error.message);
  process.exitCode = 1;
});
