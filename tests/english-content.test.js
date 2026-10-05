'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const CYRILLIC = /\p{Script=Cyrillic}/u;
const TEXT_EXTENSIONS = new Set(['.js', '.html', '.css', '.md', '.py', '.json', '.txt']);
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function textFiles(directory, recursive = true) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return recursive ? textFiles(file) : [];
    return TEXT_EXTENSIONS.has(path.extname(file)) ? [file] : [];
  });
}

function courseData() {
  const context = { window: {} };
  vm.runInNewContext(read('course-data.js'), context);
  return JSON.parse(JSON.stringify(context.window.COURSE));
}

function authorDialog(unlocked = false) {
  let appended;
  const classList = { add() {}, remove() {} };
  const document = {
    activeElement: null,
    addEventListener() {},
    body: { classList, appendChild(element) { appended = element; } },
    createElement() {
      return { classList, querySelector() { return { focus() {} }; } };
    },
  };
  const window = unlocked ? { COURSE: courseData() } : {};
  vm.runInNewContext(read('author.js'), {
    window, document, requestAnimationFrame(callback) { callback(); },
  });
  window.openAuthorModal();
  return appended.innerHTML;
}

/* The Russian Telegram admin console is an internal admin tool requested by the
   course owner; it is the single authored exception to the English-only rule.
   It must never be referenced by the browser bundle. */
const RUSSIAN_ADMIN_CONSOLE = 'admin-bot.ru.js';

test('all authored UI, server and course source copy is English-only', () => {
  const files = textFiles(ROOT, false).concat(
    ...['course', 'presentation/build', 'presentation/assets', 'tests']
      .map(directory => textFiles(path.join(ROOT, directory)))
  );
  for (const file of files) {
    const relative = path.relative(ROOT, file);
    if (path.basename(file) === RUSSIAN_ADMIN_CONSOLE) continue;
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), CYRILLIC, relative);
  }
  /* The exception is real (the console is Russian) and stays server-side. */
  assert.match(fs.readFileSync(path.join(ROOT, RUSSIAN_ADMIN_CONSOLE), 'utf8'), CYRILLIC, 'admin console must remain Russian');
  assert.doesNotMatch(read('index.html'), /admin-bot\.ru/, 'Russian admin console must never ship to the browser');
  assert.doesNotMatch(read('app.js'), /admin-bot\.ru/, 'Russian admin console must never ship to the browser');
  assert.doesNotMatch(read('access.js'), /admin-bot\.ru/, 'Russian admin console must never ship to the browser');
});

test('only English handouts and a single English deck are published', () => {
  const handouts = fs.readdirSync(path.join(ROOT, 'course')).filter(file => file.endsWith('.md'));
  assert.equal(handouts.length, 4);
  for (const file of handouts) assert.match(file, /-EN\.md$/);
  const decks = fs.readdirSync(path.join(ROOT, 'presentation/dist')).filter(file => file.endsWith('.pdf'));
  assert.deepEqual(decks, ['Contemporary-Horeca-Scene-Course-Pitch-EN.pdf']);
  assert.equal(fs.existsSync(path.join(ROOT, 'presentation/build/content_ru.py')), false);
  assert.doesNotMatch(read('presentation/build/build_deck.py'), /content_ru|-RU\.pdf/);
});

test('public and unlocked author dialogs contain only the author’s career and own projects', () => {
  for (const unlocked of [false, true]) {
    const html = authorDialog(unlocked);
    assert.match(html, /ABOUT THE AUTHOR/);
    assert.match(html, /First steps in HoReCa: waiter at Tiflis/);
    assert.match(html, /Duke nightclub/);
    assert.match(html, /International experience/);
    assert.match(html, /Own projects/);
    assert.match(html, /Close author information/);
    assert.doesNotMatch(html, CYRILLIC);
    assert.doesNotMatch(html, /Ivan Lyashuk|Vladimir Nikolaev|Perfect Bars Team|author-bars|Ultramen|floortender/i);
    for (const [name, year] of [
      ['Passie Cakes Co.', '2022'], ['CooCoo', '2024'], ['Pacific', '2024'],
      ['Joi', '2025'], ['Chicken Connection', '2024'],
    ]) {
      assert.ok(html.includes(`<figcaption>${name} <b>${year}</b></figcaption>`));
    }
    assert.equal(html.includes('OPEN THE FULL PROJECT ARCHIVE'), unlocked);
  }
});

test('industry figures and cases reflect curatorial updates', () => {
  const course = courseData();
  const figureIds = course.figures.map(f => f.id);
  const caseTitles = course.cases.map(c => c.title);

  // Vladimir Nikolaev and Ivan Lyashuk are removed
  assert.equal(figureIds.includes('ivan-lyashuk'), false);
  assert.equal(figureIds.includes('vladimir-nikolaev'), false);
  assert.equal(caseTitles.some(t => /Lyashuk|Nikolaev|Perfect Bars/i.test(t)), false);
  assert.doesNotMatch(read('course/cases-EN.md'), /Ivan Lyashuk|Vladimir Nikolaev/i);

  // Simone Caporale is added / Erik Lorincz is replaced
  assert.equal(figureIds.includes('erik-lorincz'), false);
  assert.equal(figureIds.includes('simone-caporale'), true);
  const sips = course.cases.find(c => /Sips/i.test(c.title));
  assert.ok(sips);
  assert.match(sips.title, /Simone Caporale/i);
  assert.match(sips.location, /Barcelona/i);

  // Boris Zarkov is added with Krasota
  assert.equal(figureIds.includes('boris-zarkov'), true);
  const krasota = course.cases.find(c => /Krasota/i.test(c.title));
  assert.ok(krasota);
  assert.match(krasota.title, /Boris Zarkov/i);

  // 50 Best Menu Concepts: Bar Leone & Tuju is removed from cases
  assert.equal(caseTitles.some(t => /Bar Leone|50 Best Menu Concepts/i.test(t)), false);

  // Joi case is condensed to passion/desire over budget
  const joi = course.cases.find(c => /Joi/i.test(c.title));
  assert.ok(joi);
  assert.match(joi.takeaway, /budget/i);

  // Pacific is present in both the project archive and case studies
  const pacific = course.projects.items.find(p => p.id === 'pacific');
  assert.ok(pacific);
  assert.match(pacific.name, /Pacific/);
  const pacificCase = course.cases.find(c => /Pacific/i.test(c.title));
  assert.ok(pacificCase);
  assert.match(pacificCase.image, /project-pacific-station\.jpg/);
  assert.match(read('course/cases-EN.md'), /\*\*Pacific — the course author's bar-equipment design and fabrication studio/);

  // Exactly one compositional image per case study
  for (const c of course.cases) {
    assert.equal(typeof c.image, 'string');
    assert.ok(c.image.length > 0);
    assert.equal(Object.hasOwn(c, 'images'), false, `Case ${c.title} should only have 1 image`);
    assert.ok(fs.existsSync(path.join(ROOT, 'presentation/assets', c.image)), `Asset missing: ${c.image}`);
  }
});

test('English-only conversion preserves the complete course and photographic archive', () => {
  const course = courseData();
  assert.equal(course.modules.length, 10);
  assert.equal(course.modules.flatMap(module => module.lessons).length, 13);
  assert.equal(course.figures.length, 13);
  assert.equal(course.cases.length, 14);
  assert.equal(course.projects.items.length, 7);
  assert.equal(course.projects.items.flatMap(project => project.photos).length, 43);
  for (const project of course.projects.items) {
    assert.equal(Object.hasOwn(project, 'ru'), false);
    for (const photo of project.photos) {
      assert.equal(Object.hasOwn(photo, 'captionRu'), false);
      assert.ok(photo.caption.length > 0);
      assert.ok(fs.existsSync(path.join(ROOT, 'presentation/assets', photo.file)));
    }
  }
  assert.doesNotMatch(read('app.js'), /captionRu|pr\.ru\b/);
});

/* A 1×1 JPEG, enough for the server's magic-byte check in the photo pipeline. */
const TEST_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';

async function isolatedServer(t, envOverrides = {}, initialStore = null) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chs-english-'));
  const serverFile = path.join(directory, 'server.js');
  fs.copyFileSync(path.join(ROOT, 'server.js'), serverFile);
  // The editor resolves module blocks from course-data.js next to the server, mirroring deployment.
  fs.copyFileSync(path.join(ROOT, 'course-data.js'), path.join(directory, 'course-data.js'));
  // The server requires the Russian admin console and reads site-copy.js defaults at boot.
  fs.copyFileSync(path.join(ROOT, 'admin-bot.ru.js'), path.join(directory, 'admin-bot.ru.js'));
  fs.copyFileSync(path.join(ROOT, 'site-copy.js'), path.join(directory, 'site-copy.js'));
  if (initialStore) {
    fs.mkdirSync(path.join(directory, 'data'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'data', 'store.json'), JSON.stringify(initialStore));
  }
  const bootstrap = `
    const http = require('node:http');
    const nativeFetch = global.fetch;
    global.__tgUpdates = [];
    process.on('message', message => {
      if (message?.type === 'telegram-update' && message.update) global.__tgUpdates.push(message.update);
    });
    global.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.startsWith('https://api.telegram.org/')) {
        if (url.includes('/getUpdates')) {
          const queued = global.__tgUpdates.splice(0);
          return { ok: true, status: 200, json: async () => ({ ok: true, result: queued }) };
        }
        if (url.includes('/sendMessage')) {
          const payload = JSON.parse(init.body || '{}');
          if (process.send) process.send({ type: 'telegram-message', payload });
          return { ok: true, status: 200, json: async () => ({ ok: true, result: { message_id: 1 } }) };
        }
        if (url.includes('/sendPhoto')) {
          const payload = JSON.parse(init.body || '{}');
          if (process.send) process.send({ type: 'telegram-photo', payload });
          return { ok: true, status: 200, json: async () => ({ ok: true, result: { message_id: 2 } }) };
        }
        if (url.includes('/getFile')) {
          return { ok: true, status: 200, json: async () => ({ ok: true, result: { file_path: 'photos/admin-upload.jpg' } }) };
        }
        if (url.includes('/file/bot')) {
          const bytes = Buffer.from(${JSON.stringify(TEST_JPEG_BASE64)}, 'base64');
          return { ok: true, status: 200, arrayBuffer: async () => bytes };
        }
      }
      return nativeFetch(input, init);
    };
    const createServer = http.createServer;
    http.createServer = (...args) => {
      const server = createServer(...args);
      server.once('listening', () => process.send({ type: 'listening', port: server.address().port }));
      return server;
    };
    require(${JSON.stringify(serverFile)});
  `;
  const child = spawn(process.execPath, ['-e', bootstrap], {
    cwd: directory,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    env: {
      ...process.env,
      PORT: '0',
      COURSE_PASSWORD: 'english-regression-test',
      COURSE_PASSWORDS: '',
      ACCESS_SECRET: 'isolated-english-regression-secret',
      BOT_TOKEN: '',
      BOT_USERNAME: '',
      ADMIN_IDS: '',
      COURSE_URL: '',
      TRIBUTE_API_KEY: '',
      TRIBUTE_PRODUCT_ID: '',
      TRIBUTE_SUBSCRIPTION_ID: '',
      TRIBUTE_PRODUCT_TITLE: 'Contemporary Horeca Scene · 2026 Edition',
      TRIBUTE_PRICE: '',
      ...envOverrides,
    },
  });
  let logs = '';
  const messages = [];
  const photos = [];
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  child.on('message', message => {
    if (message?.type === 'telegram-message') messages.push(message.payload);
    if (message?.type === 'telegram-photo') photos.push(message.payload);
  });
  const pushTelegramUpdate = update => child.send({ type: 'telegram-update', update });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, 'exit');
      child.kill('SIGTERM');
      await exited;
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const { port } = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Test server did not start: ${logs}`)), 5000);
    child.on('message', message => {
      if (message?.type === 'listening') { clearTimeout(timer); resolve(message); }
    });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Test server exited (${code}): ${logs}`)); });
  });

  const request = async (route, options = {}) => {
    const method = options.method || 'GET';
    const headers = {
      Accept: 'application/json',
      ...(options.payload !== undefined || options.rawBody !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    };
    const body = options.rawBody !== undefined
      ? options.rawBody
      : options.payload !== undefined ? JSON.stringify(options.payload) : undefined;
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      method,
      headers,
      ...(body !== undefined ? { body } : {}),
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    assert.doesNotMatch(text, CYRILLIC, route);
    let bodyData = text;
    try { bodyData = JSON.parse(text); } catch { /* plain text response */ }
    return { status: response.status, body: bodyData, headers: response.headers };
  };
  const post = (route, payload, token, headers = {}) => request(route, { method: 'POST', payload, token, headers });
  const get = (route, token, headers = {}) => request(route, { method: 'GET', token, headers });
  const waitForMessages = async (count, timeout = 2000) => {
    const deadline = Date.now() + timeout;
    while (messages.length < count && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.ok(messages.length >= count, `Expected ${count} Telegram messages; got ${messages.length}`);
  };
  const waitForPhotos = async (count, timeout = 2000) => {
    const deadline = Date.now() + timeout;
    while (photos.length < count && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.ok(photos.length >= count, `Expected ${count} Telegram photos; got ${photos.length}`);
  };
  return { request, post, get, messages, photos, waitForMessages, waitForPhotos, pushTelegramUpdate, child, directory, port };
}

function signedTributeRequest(server, event, apiKey = 'tribute-regression-secret') {
  const rawBody = JSON.stringify(event);
  const signature = crypto.createHmac('sha256', apiKey).update(rawBody).digest('hex');
  return server.request('/api/tribute/webhook', {
    method: 'POST',
    rawBody,
    headers: { 'trbt-signature': signature },
  });
}

function registrationUrlFromMessage(message) {
  const url = message.reply_markup?.inline_keyboard?.flat()?.find(button => button.url)?.url;
  assert.ok(url, 'The Telegram message carries the shared registration page URL');
  assert.equal(new URL(url).searchParams.get('register'), '1');
  return url;
}

async function adminToken(server) {
  const admin = await server.post('/api/access', { password: 'english-regression-test' });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.user.role, 'ADMIN');
  return admin.body.token;
}

test('course entry offers shared registration only after manual approval, with no in-app Tribute checkout', async t => {
  const access = read('access.js');
  const app = read('app.js');
  assert.match(access, /id="login-form"/);
  assert.match(access, /GET ACCESS ON TRIBUTE/);
  assert.match(access, /safeHttps\(tribute.purchaseUrl\)/);
  assert.match(access, /The Tribute purchase link is currently unavailable/);
  assert.match(access, /manually approved by the course admin/i);
  assert.doesNotMatch(access, /registrationToken|single-use registration link/i);
  assert.match(app, /\/api\/chat\/stream/);
  assert.match(app, /Project Q&amp;A/);
  assert.match(access, /egor\.tarasenko@him-mail\.ch/);
  assert.doesNotMatch(access, /data-tribute-open|data-tribute-close|tribute-overlay/i);
  assert.doesNotMatch(access, /\/api\/tribute\/checkout/);
  assert.doesNotMatch(access, /DEMO \/ TESTING FLOW|verifyLocal|SHA256|data-use-password/i);

  const server = await isolatedServer(t);
  const unconfiguredAdmin = await isolatedServer(t, { COURSE_PASSWORD: '', COURSE_PASSWORDS: '' });
  const removedDefault = await unconfiguredAdmin.post('/api/access', { password: 'Mzgnxtj8' });
  assert.equal(removedDefault.status, 401, 'No built-in administrator password is accepted');

  const master = await server.post('/api/access', { password: 'english-regression-test' });
  assert.equal(master.status, 200);
  assert.equal(master.body.user?.role, 'ADMIN', 'The master password signs in as administrator only, never as a student');

  const checkout = await server.post('/api/tribute/checkout', { name: 'Test Buyer' });
  assert.equal(checkout.status, 410);
  assert.doesNotMatch(JSON.stringify(checkout.body), /CHS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  const registrationWithoutApproval = await server.post('/api/register', {
    name: 'Test Buyer', email: 'test@example.test', telegramIdentity: '987654321', password: 'safe-test-password',
  });
  assert.equal(registrationWithoutApproval.status, 403, 'Registration requires manual Telegram admission approval');

  const status = await server.get('/api/tribute/status');
  assert.equal(status.status, 200);
  assert.equal(status.body.deliveryReady, false);
  assert.equal(Object.hasOwn(status.body, 'productUrl'), false);
  assert.equal(Object.hasOwn(status.body, 'subscriptionUrl'), false);
  assert.doesNotMatch(JSON.stringify(status.body), /chs2026|apiKey|tribute-regression-secret/);

  const webhookWithoutSecret = await server.request('/api/tribute/webhook', {
    method: 'POST', rawBody: '{}', headers: { 'trbt-signature': '00'.repeat(32) },
  });
  assert.equal(webhookWithoutSecret.status, 503);
  assert.equal((await server.get('/course-data.js')).status, 403);
});

test('migration revokes legacy manual and fake-checkout access but preserves a paid product entitlement', async t => {
  const initialStore = {
    students: [
      { id: 'legacy-manual', password: 'CHS-AAAA-BBBB', name: 'Legacy Manual', email: 'manual@example.test', source: 'admin-panel', active: true },
      { id: 'paid-product', password: 'CHS-CCCC-DDDD', name: 'Paid Learner', email: 'paid@example.test', source: 'tribute-product', active: true },
      { id: 'legacy-demo', password: 'CHS-EEEE-FFFF', name: 'Legacy Demo', email: 'demo@example.test', source: 'demo-checkout', active: true },
      { id: 'paid-pending', name: 'Paid Pending', email: 'pending@example.test', source: 'tribute-product', telegramId: '234567890', active: true },
    ],
    submissions: [{ id: 'old-submission', passwordCode: 'CHS-AAAA-BBBB', answer: 'Legacy record' }],
    tribute: { orders: [
      { id: 'digital:paid-1', studentId: 'paid-product', kind: 'digital-product', status: 'PAID', purchaseId: 'paid-1' },
      { id: 'digital:pending-1', studentId: 'paid-pending', kind: 'digital-product', status: 'PAID', purchaseId: 'pending-1' },
      { id: 'digital:fake-1', studentId: 'legacy-demo', kind: 'digital-product', status: 'PAID_STUB', purchaseId: 'fake-1', passwordIssued: true },
    ] },
  };
  const server = await isolatedServer(t, {}, initialStore);
  const manual = await server.post('/api/access', { password: 'CHS-AAAA-BBBB', clientId: 'legacy-client' });
  assert.equal(manual.status, 401);
  const demo = await server.post('/api/access', { password: 'CHS-EEEE-FFFF', clientId: 'demo-client' });
  assert.equal(demo.status, 401);
  const paid = await server.post('/api/access', { password: 'CHS-CCCC-DDDD', clientId: 'paid-client' });
  assert.equal(paid.status, 200);

  const token = await adminToken(server);
  const state = await server.get('/api/state', token);
  assert.equal(state.body.students.length, 4);
  assert.ok(state.body.students.every(student => !Object.hasOwn(student, 'password')));
  assert.equal(state.body.students.find(student => student.id === 'legacy-manual').active, false);
  assert.equal(state.body.students.find(student => student.id === 'legacy-demo').active, false);
  assert.equal(state.body.students.find(student => student.id === 'paid-product').active, true);
  assert.equal(state.body.students.find(student => student.id === 'paid-pending').active, false);
  assert.equal(state.body.students.find(student => student.id === 'paid-pending').registrationStatus, 'PENDING_APPROVAL');
  assert.equal(state.body.tribute.pendingAdmissionsCount, 1);
  assert.equal(Object.hasOwn(state.body.submissions[0], 'passwordCode'), false);
  assert.ok(state.body.tribute.orders.some(order => order.status === 'TEST_ORDER_REVOKED'));
  const diskStore = JSON.parse(fs.readFileSync(path.join(server.directory, 'data', 'store.json'), 'utf8'));
  assert.ok(diskStore.students.every(student => !Object.hasOwn(student, 'password')), 'Legacy plaintext access codes are removed on migration');
  assert.match(diskStore.students.find(student => student.id === 'paid-product').legacyPasswordHash, /^scrypt\$/);
  assert.equal(Object.hasOwn(diskStore.students.find(student => student.id === 'legacy-manual'), 'legacyPasswordHash'), false);
  assert.equal(Object.hasOwn(diskStore.students.find(student => student.id === 'legacy-demo'), 'legacyPasswordHash'), false);
  assert.doesNotMatch(JSON.stringify(diskStore), /CHS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
});

test('legacy secret cleanup is persisted even when no student password is present', async t => {
  const server = await isolatedServer(t, {}, {
    students: [],
    submissions: [{ id: 'legacy-submission', passwordCode: 'CHS-AAAA-BBBB' }],
    tribute: { orders: [{ id: 'legacy-stub', status: 'PAID_STUB', passwordIssued: true }] },
    adminBot: { logs: [{ id: 'demo-log', text: 'Demo checkout completed' }] },
  });
  const diskStore = JSON.parse(fs.readFileSync(path.join(server.directory, 'data', 'store.json'), 'utf8'));
  assert.equal(Object.hasOwn(diskStore.submissions[0], 'passwordCode'), false);
  assert.equal(diskStore.tribute.orders[0].status, 'TEST_ORDER_REVOKED');
  assert.equal(diskStore.adminBot.logs.some(log => /demo checkout completed/i.test(log.text || '')), false);
});

test('sign-in and admin controls cannot create learner accounts without manual admission approval', async t => {
  const server = await isolatedServer(t);
  const denied = await server.post('/api/access', { password: 'incorrect' });
  assert.equal(denied.status, 401);
  assert.match(denied.body.error, /email or password is incorrect/i);
  const noApproval = await server.post('/api/register', {
    name: 'Jordan', email: 'jordan@example.test', telegramIdentity: 'jordanhoreca', password: 'long-enough-password',
  });
  assert.equal(noApproval.status, 403);

  const token = await adminToken(server);
  const command = text => server.post('/api/admin/bot-command', { command: text }, token);
  assert.match((await command('/help')).body.reply, /Available commands/);
  assert.match((await command('/pending')).body.reply, /No submissions are awaiting review/);
  assert.match((await command('/students')).body.reply, /No Tribute-paid learners/);
  assert.match((await command('/orders')).body.reply, /No Tribute payment events/);
  assert.match((await command('/approve')).body.reply, /Usage: \/approve/);
  assert.match((await command('/unknown')).body.reply, /Unknown command/);
  const forbiddenBotGeneration = await command('/genpass Jordan jordan@example.test');
  assert.equal(forbiddenBotGeneration.body.ok, false);
  assert.match(forbiddenBotGeneration.body.reply, /Unknown command/);
  assert.equal((await server.post('/api/admin/students', { action: 'generate', name: 'Jordan' }, token)).status, 400);

  const removedCheckout = await server.post('/api/tribute/checkout', { email: 'alex@example.test' });
  assert.equal(removedCheckout.status, 410);
  const state = await server.get('/api/state', token);
  assert.deepEqual(state.body.students, []);
});

test('images carry provenance credits, fallbacks and an email submission channel', t => {
  const app = read('app.js');
  const course = read('course-data.js');
  const gate = read('access.js');
  const styles = read('styles.css');
  // broken files can never show a broken glyph: every img falls back to a repo photograph
  assert.match(app, /onerror="this\.onerror=null;this\.src='/);
  assert.match(app, /IMAGE_FALLBACK/);
  assert.match(app, /image-fallback/);
  // provenance registry + public transparency page
  assert.match(course, /imageCredits:/);
  assert.match(course, /illustrative:/);
  assert.match(app, /r\[0\] === 'credits'/);
  assert.match(app, /Image sources &amp; rights/);
  assert.match(gate, /public websites and press materials/);
  assert.match(course, /publicly available websites and press materials/);
  assert.doesNotMatch(app + gate + course, /studio-/);
  assert.match(gate, /project-joi-bar\.jpg/);
  assert.match(app, /project-joi-cups\.jpg/);
  assert.match(styles, /\.film-photo\{filter:grayscale\(1\)/);
  assert.match(course, /black-and-white, film-inspired display treatment/);
  assert.match(course, /not the image files/);
  // no unidentified stock photography left in the app-facing content
  assert.ok(!/image: 'horeca-/.test(course), 'module and case images must come from the credited archive');
  assert.ok(!/horeca-[a-z-]+\.jpg/.test(gate), 'gate visual must come from the credited archive');
  // project paragraphs show venues or illustrative archive photos, never a floating portrait
  assert.match(course, /image: 'project-joi-bar\.jpg'/);
  assert.match(course, /image: 'project-detail-nine-lives-bar-ai\.jpg'/);
  // internet-sourced atmospheric photography must carry its source
  assert.match(course, /insider\.bar\.lab/);
  assert.match(course, /web-insider-station\.jpg/);
  assert.match(course, /web-insider-lab\.webp/);
  // Pacific Mirain specification is part of the shipped content
  assert.match(course, /Mirain station line/);
  assert.match(course, /dedicated pumps/);
  // AI-processed author photographs are disclosed, not hidden
  assert.match(course, /AI-PROCESSED \(EXPOSURE ONLY\)/);
  assert.match(course, /project-joi-bar-ai\.jpg/);
  // photos uploaded in the admin bot resolve to /media/… and keep a safe fallback
  assert.match(app, /const assetSrc = name =>/);
  assert.match(app, /const isUploadedPhoto = name =>/);
  assert.match(app, /PHOTO · UPDATED BY THE COURSE TEAM/);
  assert.match(app, /const OVERRIDE_IMAGE_FIELDS = new Set/);
  assert.match(app, /SL\.heroImage/);
  assert.match(app, /SL\.mockupImage/);
  assert.match(read('access.js'), /const siteAssetSrc = value =>/);
  assert.match(read('access.js'), /g\.heroImage/);
  assert.match(read('site-copy.js'), /heroImage: 'project-joi-bar\.jpg'/);
  assert.match(read('site-copy.js'), /mockupImage: 'project-detail-chess\.jpg'/);
  // homework reaches the instructor in-app or by email
  assert.match(app, /PREFER EMAIL\? BOTH CHANNELS ARE EQUAL/);
  assert.match(app, /mailto:egor\.tarasenko@him-mail\.ch\?subject=/);
});

test('admin bot editor manages block materials, live updates and copy overrides', async t => {
  const server = await isolatedServer(t);
  const token = await adminToken(server);
  const command = text => server.post('/api/admin/bot-command', { command: text }, token);

  const added = await command('/addmat budget https://example.com/menu-perception A short field note on menu perception');
  assert.equal(added.body.ok, true);
  assert.match(added.body.reply, /Added to the end of Module 09/);
  const materialId = added.body.material.id;
  const second = await command('/addmat 09 https://example.com/scenography-haze Haze and one tight beam of light in small rooms');
  assert.equal(second.body.ok, true);
  assert.equal(second.body.material.moduleId, 'budget', 'A module number resolves to the same block');
  const viaLesson = await command('/addmat atmosphere https://example.com/found-objects Flea-market sourcing checklist');
  assert.equal(viaLesson.body.ok, true);
  assert.equal(viaLesson.body.material.moduleId, 'experience', 'A lesson id resolves to its module block');
  assert.equal((await command('/addmat budget notaurl note')).body.ok, false);
  assert.equal((await command('/addmat nowhere https://example.com/x note')).body.ok, false);
  assert.equal((await command(`/addmat budget ${'https://example.com/menu-perception'} duplicate`)).body.ok, false);

  const listed = await command('/materials budget');
  assert.match(listed.body.reply, /field note on menu perception/);
  assert.doesNotMatch(listed.body.reply, /Flea-market sourcing/);
  const edited = await command(`/editmat ${materialId} Rewritten note about perception`);
  assert.equal(edited.body.ok, true);
  const relinked = await command(`/editmat ${materialId} https://example.com/perception-v2 Final note with a fresh link`);
  assert.equal(relinked.body.ok, true);
  assert.equal(relinked.body.material.url, 'https://example.com/perception-v2');

  const posted = await command('/post Launch week | The author opens the edition with a live sourcing Q&A.');
  assert.equal(posted.body.ok, true);
  assert.equal((await command('/post No separator here')).body.ok, false);

  const lessonEdit = await command('/editlesson budget-builds intro A rewritten opening line for the budget unit.');
  assert.equal(lessonEdit.body.ok, true);
  const overrideId = lessonEdit.body.override.id;
  const moduleEdit = await command('/editmodule budget A refreshed module description for the 2026 edition.');
  assert.equal(moduleEdit.body.ok, true);
  assert.equal((await command('/editlesson nowhere intro x')).body.ok, false);
  const overrides = await command('/overrides');
  assert.match(overrides.body.reply, /lesson budget-builds · intro/);

  const state = await server.get('/api/state', token);
  assert.equal(state.body.editor.materials.length, 3);
  assert.equal(state.body.editor.materials.find(item => item.id === materialId).note, 'Final note with a fresh link');
  assert.equal(state.body.editor.posts[0].title, 'Launch week');
  assert.equal(state.body.editor.overrides.length, 2);

  assert.equal((await command(`/revert ${overrideId}`)).body.ok, true);
  const afterRevert = await server.get('/api/state', token);
  assert.equal(afterRevert.body.editor.overrides.length, 1);
  assert.equal(afterRevert.body.editor.overrides[0].id, moduleEdit.body.override.id);

  assert.equal((await command(`/delmat ${materialId}`)).body.ok, true);
  assert.equal((await command(`/delpost ${posted.body.post.id}`)).body.ok, true);
  const emptied = await command('/materials budget');
  assert.match(emptied.body.reply, /Haze and one tight beam of light/);
  assert.equal((await command('/posts')).body.reply.match(/Launch week/), null);

  const app = read('app.js');
  assert.match(app, /ADDITIONAL MATERIALS · MODULE/);
  assert.match(app, /applyContentOverrides/);
  assert.match(app, /startLiveSync/);
  assert.match(app, /visibilitychange/);
  const access = read('access.js');
  assert.match(access, /gate-info-slim/);
  assert.doesNotMatch(access, /gate-points/);
});

test('pending admissions include paid orders awaiting approval for existing learners', async t => {
  const studentId = 'student-renewal-approval';
  const server = await isolatedServer(t, {}, {
    students: [{
      id: studentId,
      name: 'Existing Learner',
      email: 'existing@example.test',
      source: 'tribute-subscription',
      active: true,
      registrationStatus: 'REGISTERED',
      admissionApprovedAt: '2026-09-01T10:00:00.000Z',
      telegramId: '345678901',
      telegramUsername: 'existinglearner',
    }],
    tribute: { orders: [{
      id: 'subscription-renewal-pending',
      studentId,
      kind: 'subscription',
      eventName: 'renewed_subscription',
      status: 'PAID',
      deliveryStatus: 'AWAITING_APPROVAL',
      amount: '49 EUR',
    }] },
  });
  const token = await adminToken(server);
  const state = await server.get('/api/state', token);
  assert.equal(state.body.tribute.pendingAdmissionsCount, 1);
  const admissions = await server.post('/api/admin/bot-command', { command: '/admissions' }, token);
  assert.equal(admissions.status, 200);
  assert.match(admissions.body.reply, /student-renewal-approval/);
  assert.match(admissions.body.reply, /subscription-renewal-pending/);
});

test('Tribute webhooks create pending admissions; one shared page works after Telegram approval', async t => {
  const apiKey = 'tribute-regression-secret';
  const server = await isolatedServer(t, {
    TRIBUTE_API_KEY: apiKey,
    TRIBUTE_PRODUCT_ID: '456',
    TRIBUTE_PRODUCT_URL: 'https://t.me/tribute/app?startapp=p456', // public purchase link
    TRIBUTE_PRICE: '49 EUR',
    BOT_TOKEN: 'fake-bot-token',
    BOT_USERNAME: 'chs_access_bot',
    COURSE_URL: 'https://course.example.test',
  });
  const token = await adminToken(server);
  const status = await server.get('/api/tribute/status');
  assert.equal(status.body.deliveryReady, true);
  assert.equal(status.body.productConfigured, true);
  assert.equal(status.body.subscriptionConfigured, false);
  assert.equal(status.body.botUsernameConfigured, true);
  assert.equal(status.body.purchaseUrl, 'https://t.me/tribute/app?startapp=p456');
  assert.equal(JSON.stringify(status.body).includes(apiKey), false);

  const event = {
    name: 'new_digital_product',
    created_at: '2026-10-04T10:00:00.000Z',
    sent_at: '2026-10-04T10:00:01.000Z',
    payload: {
      product_id: 456,
      product_name: 'Contemporary Horeca Scene · 2026 Edition',
      amount: 4900,
      currency: 'eur',
      trb_user_id: 'T-31326',
      telegram_user_id: 123456789,
      telegram_username: 'alexhoreca',
      purchase_id: 78901,
      transaction_id: 234567,
      purchase_created_at: '2026-10-04T10:00:00.000Z',
    },
  };
  const rawBody = JSON.stringify(event);
  const badSignature = await server.request('/api/tribute/webhook', {
    method: 'POST', rawBody, headers: { 'trbt-signature': '00'.repeat(32) },
  });
  assert.equal(badSignature.status, 401);

  const wrongProduct = structuredClone(event);
  wrongProduct.payload.product_id = 999;
  const ignored = await signedTributeRequest(server, wrongProduct, apiKey);
  assert.equal(ignored.status, 200);
  assert.equal(ignored.body.ignored, true);
  assert.equal(ignored.body.reason, 'different-product');
  assert.equal(server.messages.length, 0);

  const noTelegramId = structuredClone(event);
  noTelegramId.payload.purchase_id = 78902;
  delete noTelegramId.payload.telegram_user_id;
  const missingBuyer = await signedTributeRequest(server, noTelegramId, apiKey);
  assert.equal(missingBuyer.status, 400);

  const paid = await signedTributeRequest(server, event, apiKey);
  assert.equal(paid.status, 200);
  assert.equal(paid.body.issued, true);
  assert.equal(paid.body.deliveryStatus, 'AWAITING_APPROVAL');
  /* The buyer is handed a convenient start link immediately after the verified payment. */
  assert.equal(server.messages.length, 1, 'A verified payment immediately sends the start link to the buyer');
  const startMessage = server.messages[0];
  assert.equal(String(startMessage.chat_id), '123456789');
  assert.match(startMessage.text, /Tribute event/i);
  assert.match(startMessage.text, /start link/i);
  const startButtons = startMessage.reply_markup.inline_keyboard.flat();
  assert.equal(startButtons[0].url, 'https://course.example.test/');
  assert.equal(startButtons[1].text.includes('password'), true, 'the registration button is offered next to the start link');
  assert.ok(new URL(startButtons[1].url).searchParams.get('register'), 'the second button opens the shared registration page');

  const duplicate = await signedTributeRequest(server, event, apiKey);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);
  assert.equal(server.messages.length, 1, 'A duplicate payment event is not sent twice');

  const stateBeforeApproval = await server.get('/api/state', token);
  assert.equal(stateBeforeApproval.body.students.length, 1);
  const pendingStudent = stateBeforeApproval.body.students[0];
  assert.equal(pendingStudent.registered, false);
  assert.equal(pendingStudent.active, false);
  assert.equal(pendingStudent.registrationStatus, 'PENDING_APPROVAL');
  assert.equal(Object.hasOwn(pendingStudent, 'password'), false);
  assert.equal(Object.hasOwn(pendingStudent, 'passwordHash'), false);
  assert.equal(stateBeforeApproval.body.tribute.orders[0].admissionApproved, false);
  assert.equal(stateBeforeApproval.body.tribute.pendingAdmissionsCount, 1);
  assert.equal(stateBeforeApproval.body.tribute.pendingDeliveriesCount, 1);

  const command = text => server.post('/api/admin/bot-command', { command: text }, token);
  assert.match((await command('/admissions')).body.reply, /alexhoreca/);
  const prematureRegistration = await server.post('/api/register', {
    telegramIdentity: 'alexhoreca', name: 'Alex Learner', email: 'alex@example.test', password: 'choose-a-secure-password-123',
  });
  assert.equal(prematureRegistration.status, 403, 'The shared page cannot register an unapproved Telegram account');

  const admitted = await command(`/admit ${pendingStudent.id}`);
  assert.equal(admitted.status, 200);
  assert.equal(admitted.body.ok, true);
  assert.match(admitted.body.reply, /admitted/i);
  await server.waitForMessages(2);
  const approvalMessage = server.messages[1];
  assert.equal(String(approvalMessage.chat_id), '123456789');
  assert.match(approvalMessage.text, /shared registration link/i);
  assert.match(approvalMessage.text, /reusable/i);
  assert.doesNotMatch(approvalMessage.text, /single-use|expires in 30 days|can be used once/i);
  assert.match(approvalMessage.text, /egor\.tarasenko@him-mail\.ch/);
  const sharedUrl = registrationUrlFromMessage(approvalMessage);
  assert.equal(new URL(sharedUrl).origin, 'https://course.example.test');
  assert.doesNotMatch(sharedUrl, /[A-Za-z0-9_-]{40,}/, 'The shared link contains no per-student secret');

  const invalidEmail = await server.post('/api/register', {
    telegramIdentity: 'alexhoreca', name: 'Alex Learner', email: 'not-an-email', password: 'choose-a-secure-password-123',
  });
  assert.equal(invalidEmail.status, 400, 'Invalid registration details are rejected before account creation');
  const chosenPassword = 'choose-a-secure-password-123';
  const registered = await server.post('/api/register', {
    telegramIdentity: '@alexhoreca', name: 'Alex Learner', email: 'Alex@Example.test', password: chosenPassword,
  });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.unlocked, true);
  assert.equal(registered.body.user.email, 'alex@example.test');
  assert.equal(registered.body.user.name, 'Alex Learner');
  assert.equal(registered.body.user.telegramId, '123456789');
  assert.equal(Object.hasOwn(registered.body.user, 'password'), false);
  assert.equal(Object.hasOwn(registered.body.user, 'passwordHash'), false);
  assert.equal((await server.get('/api/access', registered.body.token)).body.unlocked, true);

  const reusedBySameStudent = await server.post('/api/register', {
    telegramIdentity: 'alexhoreca', name: 'Another Learner', email: 'another@example.test', password: chosenPassword,
  });
  assert.equal(reusedBySameStudent.status, 409, 'The same learner cannot create a second account');
  const unapprovedAccount = await server.post('/api/register', {
    telegramIdentity: 'unknownlearner', name: 'Unknown Learner', email: 'unknown@example.test', password: chosenPassword,
  });
  assert.equal(unapprovedAccount.status, 403);
  assert.equal((await server.post('/api/access', { password: chosenPassword })).status, 401, 'New personal passwords require email sign-in');
  assert.equal((await server.post('/api/access', { email: 'wrong@example.test', password: chosenPassword })).status, 401);
  assert.equal((await server.post('/api/access', { email: 'alex@example.test', password: 'incorrect-password' })).status, 401);
  const studentSession = await server.post('/api/access', {
    email: 'ALEX@example.test', password: chosenPassword, clientId: 'web-purchase-client',
  });
  assert.equal(studentSession.status, 200);
  assert.equal(studentSession.body.user.telegramId, '123456789');
  assert.equal(Object.hasOwn(studentSession.body.user, 'passwordCode'), false);

  const stored = JSON.parse(fs.readFileSync(path.join(server.directory, 'data', 'store.json'), 'utf8'));
  const storedStudent = stored.students.find(item => item.id === registered.body.user.id);
  const storedOrder = stored.tribute.orders.find(item => item.id === 'digital:78901');
  assert.match(storedStudent.passwordHash, /^scrypt\$/);
  assert.equal(Object.hasOwn(storedStudent, 'password'), false);
  assert.equal(storedOrder.admissionApprovedAt !== undefined, true);
  assert.equal(Object.hasOwn(storedOrder, 'registrationTokenHash'), false);
  assert.equal(Object.hasOwn(storedOrder, 'registrationTokenUsedAt'), false);
  assert.equal(JSON.stringify(stored).includes(sharedUrl), false, 'The public shared link is not persisted in plaintext');

  const state = await server.get('/api/state', token);
  assert.equal(state.status, 200);
  assert.equal(state.body.students[0].registered, true);
  assert.equal(state.body.students[0].registrationStatus, 'REGISTERED');
  assert.equal(state.body.tribute.orders[0].admissionApproved, true);
  assert.equal(state.body.tribute.pendingAdmissionsCount, 0);
  assert.equal(state.body.tribute.pendingDeliveriesCount, 0);
  assert.equal(JSON.stringify(state.body.tribute).includes(apiKey), false);

  const submitted = await server.post('/api/submissions', {
    moduleId: 'budget', lessonId: 'budget-builds',
    assignment: 'Found-object budget', answer: 'A clear concept and cost estimate.',
  }, studentSession.body.token);
  assert.equal(submitted.status, 200);
  assert.equal(Object.hasOwn(submitted.body.submission, 'passwordCode'), false);
  assert.match((await command('/pending')).body.reply, /Files: none/);
  const review = await command(`/approve ${submitted.body.submission.id} The concept and budget are clear.`);
  assert.equal(review.body.submission.status, 'APPROVED');
  assert.match(review.body.reply, /Feedback sent to the student/);
  await server.waitForMessages(3);

  const listedLearners = await command('/students');
  assert.match(listedLearners.body.reply, /ACTIVE/);
  assert.match(listedLearners.body.reply, /account REGISTERED/);
  assert.doesNotMatch(listedLearners.body.reply, /CHS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  const resend = await command('/resend 123456789');
  assert.equal(resend.status, 200);
  assert.equal(resend.body.ok, true);
  await server.waitForMessages(4);
  assert.match(server.messages[3].text, /cannot be retrieved or resent/i);
  assert.doesNotMatch(server.messages[3].text, /register=|CHS-/);
  assert.equal((await command('/orders')).body.reply.includes('digital:78901'), true);

  const refund = {
    name: 'digital_product_refunded',
    created_at: '2026-10-05T10:00:00.000Z',
    sent_at: '2026-10-05T10:00:01.000Z',
    payload: { ...event.payload, refund_reason: 'telegram_refund', refunded_at: '2026-10-05T10:00:00.000Z' },
  };
  const refunded = await signedTributeRequest(server, refund, apiKey);
  assert.equal(refunded.status, 200);
  assert.equal(refunded.body.refunded, true);
  assert.equal((await server.get('/api/access', studentSession.body.token)).body.unlocked, false);
  assert.equal((await server.post('/api/access', { email: 'alex@example.test', password: chosenPassword })).status, 403);
  await server.waitForMessages(5);
});

test('Tribute subscriptions require manual admission and preserve account access until expiry', async t => {
  const apiKey = 'tribute-subscription-secret';
  const server = await isolatedServer(t, {
    TRIBUTE_API_KEY: apiKey,
    TRIBUTE_SUBSCRIPTION_ID: '1644',
    TRIBUTE_SUBSCRIPTION_URL: 'https://t.me/tribute/app?startapp=s1644', // ignored by the course app
    BOT_TOKEN: 'fake-subscription-bot-token',
    BOT_USERNAME: 'chs_access_bot',
    COURSE_URL: 'https://course.example.test',
  });
  const token = await adminToken(server);
  const status = await server.get('/api/tribute/status');
  assert.equal(status.body.deliveryReady, true);
  assert.equal(status.body.productConfigured, false);
  assert.equal(status.body.subscriptionConfigured, true);
  assert.equal(Object.hasOwn(status.body, 'productUrl'), false);
  assert.equal(Object.hasOwn(status.body, 'subscriptionUrl'), false);

  const firstPayment = {
    name: 'new_subscription',
    created_at: '2026-10-04T10:00:00.000Z',
    sent_at: '2026-10-04T10:00:01.000Z',
    payload: {
      subscription_name: 'Contemporary Horeca Scene',
      subscription_id: 1644,
      period_id: 4001,
      period: 'monthly',
      type: 'regular',
      amount: 4900,
      currency: 'eur',
      trb_user_id: 'T-44444',
      telegram_user_id: 234567890,
      telegram_username: 'barlearner',
      expires_at: '2099-11-04T00:00:00.000Z',
    },
  };
  const purchase = await signedTributeRequest(server, firstPayment, apiKey);
  assert.equal(purchase.status, 200);
  assert.equal(purchase.body.deliveryStatus, 'AWAITING_APPROVAL');
  assert.equal(server.messages.length, 1, 'The subscription buyer gets the start link right after payment');
  assert.match(server.messages[0].text, /start link/i);
  const stateBeforeApproval = await server.get('/api/state', token);
  const student = stateBeforeApproval.body.students[0];
  const command = text => server.post('/api/admin/bot-command', { command: text }, token);
  assert.match((await command('/admissions')).body.reply, /barlearner/);
  assert.equal((await command(`/admit ${student.id}`)).body.ok, true);
  await server.waitForMessages(2);
  const sharedUrl = registrationUrlFromMessage(server.messages[1]);
  const password = 'subscription-personal-password';
  const registered = await server.post('/api/register', {
    telegramIdentity: 'barlearner', name: 'Bar Learner', email: 'bar@example.test', password,
  });
  assert.equal(registered.status, 201);
  const session = await server.post('/api/access', { email: 'bar@example.test', password });
  assert.equal(session.status, 200);

  const cancellation = {
    name: 'cancelled_subscription',
    created_at: '2026-10-04T11:00:00.000Z',
    sent_at: '2026-10-04T11:00:01.000Z',
    payload: {
      subscription_id: 1644,
      period_id: 4001,
      period: 'monthly',
      type: 'regular',
      trb_user_id: 'T-44444',
      telegram_user_id: 234567890,
      telegram_username: 'barlearner',
      expires_at: '2099-11-04T00:00:00.000Z',
    },
  };
  const cancelled = await signedTributeRequest(server, cancellation, apiKey);
  assert.equal(cancelled.status, 200);
  const duringPaidPeriod = await server.post('/api/access', { email: 'bar@example.test', password });
  assert.equal(duringPaidPeriod.status, 200, 'Cancellation does not remove access before Tribute expiry');
  assert.equal((await server.get('/api/access', session.body.token)).body.unlocked, true);

  const expiryEvent = structuredClone(cancellation);
  expiryEvent.created_at = '2026-10-04T12:00:00.000Z';
  expiryEvent.payload.period_id = 4002;
  expiryEvent.payload.expires_at = '2000-01-01T00:00:00.000Z';
  const expired = await signedTributeRequest(server, expiryEvent, apiKey);
  assert.equal(expired.status, 200);
  const expiredAccess = await server.post('/api/access', { email: 'bar@example.test', password });
  assert.equal(expiredAccess.status, 403);
  assert.match(expiredAccess.body.error, /subscription has expired/i);
  assert.equal((await server.get('/api/access', session.body.token)).body.unlocked, false);

  const renewal = structuredClone(firstPayment);
  renewal.name = 'renewed_subscription';
  renewal.created_at = '2026-11-04T10:00:00.000Z';
  renewal.payload.period_id = 4003;
  renewal.payload.expires_at = '2099-12-04T00:00:00.000Z';
  const renewed = await signedTributeRequest(server, renewal, apiKey);
  assert.equal(renewed.status, 200);
  assert.equal(renewed.body.deliveryStatus, 'DELIVERED');
  await server.waitForMessages(5);
  assert.match(server.messages[4].text, /access is active/i);
  assert.doesNotMatch(server.messages[4].text, /register=|one-time|single-use/);
  const restored = await server.post('/api/access', { email: 'bar@example.test', password });
  assert.equal(restored.status, 200);

  const state = await server.get('/api/state', token);
  assert.equal(state.body.students.length, 1);
  assert.equal(Object.hasOwn(state.body.students[0], 'password'), false);
  assert.equal(state.body.students[0].registered, true);
  assert.equal(state.body.students[0].subscriptionStatus, 'ACTIVE');
  assert.equal(new URL(sharedUrl).searchParams.get('register'), '1');
});

test('a verified payment hands the buyer a start link immediately, with an opt-out switch', async t => {
  const apiKey = 'tribute-start-link-secret';
  const server = await isolatedServer(t, {
    TRIBUTE_API_KEY: apiKey,
    TRIBUTE_PRODUCT_ID: '777',
    BOT_TOKEN: 'start-link-bot-token',
    BOT_USERNAME: 'chs_access_bot',
    COURSE_URL: 'https://course.example.test',
    COURSE_START_URL: 'https://start.example.test/contemporary-horeca-scene',
  });
  const status = await server.get('/api/tribute/status');
  assert.equal(status.body.startUrlConfigured, true);
  assert.equal(status.body.paymentStartMessage, true);

  const event = {
    name: 'new_digital_product',
    created_at: '2026-10-04T10:00:00.000Z',
    sent_at: '2026-10-04T10:00:01.000Z',
    payload: {
      product_id: 777,
      product_name: 'Contemporary Horeca Scene · 2026 Edition',
      amount: 4900,
      currency: 'eur',
      trb_user_id: 'T-90909',
      telegram_user_id: 555000111,
      telegram_username: 'startbuyer',
      purchase_id: 55501,
      transaction_id: 55502,
      purchase_created_at: '2026-10-04T10:00:00.000Z',
    },
  };
  const paid = await signedTributeRequest(server, event, apiKey);
  assert.equal(paid.status, 200);
  await server.waitForMessages(1);
  const message = server.messages[0];
  assert.equal(String(message.chat_id), '555000111');
  assert.match(message.text, /start link is ready/i);
  assert.match(message.text, /startbuyer/);
  const buttons = message.reply_markup.inline_keyboard.flat();
  assert.equal(buttons[0].url, 'https://start.example.test/contemporary-horeca-scene', 'the configured start link is not shadowed by COURSE_URL');
  assert.equal(new URL(buttons[1].url).searchParams.get('register'), '1');
  assert.equal(new URL(buttons[1].url).origin, 'https://course.example.test');

  /* The start link is a convenience, never an approval: registration stays locked. */
  const blocked = await server.post('/api/register', {
    telegramIdentity: 'startbuyer', name: 'Start Buyer', email: 'start@example.test', password: 'choose-a-secure-password-123',
  });
  assert.equal(blocked.status, 403, 'the start link does not approve the buyer');

  const diskStore = JSON.parse(fs.readFileSync(path.join(server.directory, 'data', 'store.json'), 'utf8'));
  assert.equal(diskStore.tribute.orders[0].deliveryStatus, 'AWAITING_APPROVAL');
  assert.equal(diskStore.students[0].registrationStatus, 'PENDING_APPROVAL');
  assert.equal(typeof diskStore.students[0].startLinkSentAt, 'string');

  /* Administrators can switch the immediate message off and keep the approval-only flow. */
  const quiet = await isolatedServer(t, {
    TRIBUTE_API_KEY: 'tribute-quiet-secret',
    TRIBUTE_PRODUCT_ID: '888',
    BOT_TOKEN: 'quiet-bot-token',
    COURSE_URL: 'https://course.example.test',
    PAYMENT_START_MESSAGE: 'false',
  });
  assert.equal((await quiet.get('/api/tribute/status')).body.paymentStartMessage, false);
  const quietEvent = structuredClone(event);
  quietEvent.payload.product_id = 888;
  quietEvent.payload.purchase_id = 55503;
  const quietPaid = await signedTributeRequest(quiet, quietEvent, 'tribute-quiet-secret');
  assert.equal(quietPaid.status, 200);
  assert.equal(quietPaid.body.deliveryStatus, 'AWAITING_APPROVAL');
  assert.equal(quiet.messages.length, 0, 'PAYMENT_START_MESSAGE=false keeps the link gated behind approval');
});

test('Project Q&A is private, persistent and streams messages live to the learner and admin', async t => {
  const password = 'chat-student-password-123';
  const salt = '0123456789abcdef0123456789abcdef';
  const passwordHash = `scrypt$${salt}$${crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('hex')}`;
  const initialStore = {
    students: [{
      id: 'stu-chat-alex', name: 'Alex Learner', email: 'alex-chat@example.test', passwordHash,
      role: 'STUDENT', institutionId: 'him-001', telegramId: '123456789', telegramUsername: 'alexhoreca',
      source: 'access-request', active: true, admissionApprovedAt: '2026-10-04T10:00:00.000Z',
      registrationStatus: 'REGISTERED', unlockedLessons: [], completedLessons: [],
    }],
    submissions: [], chats: [], progress: {}, quizzes: {}, tribute: { orders: [] },
  };
  const server = await isolatedServer(t, {}, initialStore);
  const adminTokenValue = await adminToken(server);
  const signedIn = await server.post('/api/access', { email: 'alex-chat@example.test', password });
  assert.equal(signedIn.status, 200);
  const studentToken = signedIn.body.token;

  assert.equal((await server.get('/api/chat')).status, 403, 'The chat requires an authenticated course session');
  assert.equal((await server.get('/api/chat/threads', studentToken)).status, 403, 'Learners cannot browse other students\' threads');

  const question = await server.post('/api/chat', {
    project: 'My neighbourhood café',
    text: 'Could you help me think through the first guest touchpoint?',
  }, studentToken);
  assert.equal(question.status, 201);
  assert.equal(question.body.message.studentId, 'stu-chat-alex');
  assert.equal(question.body.message.senderRole, 'STUDENT');
  assert.equal(question.body.message.project, 'My neighbourhood café');

  const inbox = await server.get('/api/chat/threads', adminTokenValue);
  assert.equal(inbox.status, 200);
  assert.equal(inbox.body.threads[0].unreadCount, 1);
  assert.equal(inbox.body.threads[0].student.email, 'alex-chat@example.test');
  const thread = await server.get('/api/chat?studentId=stu-chat-alex', adminTokenValue);
  assert.equal(thread.status, 200);
  assert.equal(thread.body.messages.length, 1);
  assert.equal(thread.body.messages[0].readByAdmin, true);
  assert.equal((await server.get('/api/chat/threads', adminTokenValue)).body.threads[0].unreadCount, 0);

  const readerResponse = await fetch(`http://127.0.0.1:${server.port}/api/chat/stream?studentId=stu-chat-alex`, {
    headers: { Authorization: `Bearer ${adminTokenValue}` },
  });
  assert.equal(readerResponse.status, 200);
  assert.match(readerResponse.headers.get('content-type') || '', /text\/event-stream/);
  const reader = readerResponse.body.getReader();
  const firstFrame = await reader.read();
  assert.match(new TextDecoder().decode(firstFrame.value), /event: snapshot/);
  const liveFramePromise = reader.read();

  const reply = await server.post('/api/chat', {
    studentId: 'stu-chat-alex', text: 'Start with the moment a guest notices your point of view.',
  }, adminTokenValue);
  assert.equal(reply.status, 201);
  assert.equal(reply.body.message.senderRole, 'ADMIN');
  const liveFrame = await liveFramePromise;
  assert.match(new TextDecoder().decode(liveFrame.value), /event: message/);
  assert.match(new TextDecoder().decode(liveFrame.value), /notices your point of view/);
  await reader.cancel();

  const learnerHistory = await server.get('/api/chat?studentId=another-student', studentToken);
  assert.equal(learnerHistory.status, 200, 'A learner query is always scoped to their own thread');
  assert.equal(learnerHistory.body.messages.length, 2);
  assert.equal(learnerHistory.body.messages[1].readByStudent, true);
  const otherThread = await server.get('/api/chat?studentId=not-a-student', adminTokenValue);
  assert.equal(otherThread.status, 404);
});

test('the administrator password is never locked out by the attempt throttle', async t => {
  const server = await isolatedServer(t);
  for (let i = 0; i < 21; i++) {
    const wrong = await server.post('/api/access', { password: 'wrong-attempt' }, undefined, { 'X-Forwarded-For': '203.0.113.7' });
    assert.ok([401, 429].includes(wrong.status), `attempt ${i + 1} rejected or throttled`);
  }
  const lockedOut = await server.post('/api/access', { password: 'wrong-attempt' }, undefined, { 'X-Forwarded-For': '203.0.113.7' });
  assert.equal(lockedOut.status, 429, 'Repeated wrong entries from one IP stay throttled');
  const admin = await server.post('/api/access', { password: 'english-regression-test' }, undefined, { 'X-Forwarded-For': '203.0.113.7' });
  assert.equal(admin.status, 200, 'The correct master password still works from a throttled IP');
  assert.equal(admin.body.user?.role, 'ADMIN');
});

test('the admin bot replaces block photos and background images with photos sent in Telegram', async t => {
  const server = await isolatedServer(t, {
    BOT_TOKEN: 'test-bot-token',
    ADMIN_IDS: '1',
    COURSE_URL: 'https://course.example.com',
  });
  /* The administrator taps the background-image button for the start page. */
  server.pushTelegramUpdate({
    update_id: 1,
    callback_query: { id: 'cb-photo', data: 'E:site:gate:heroImage', message: { chat: { id: 1 }, message_id: 10 } },
  });
  await server.waitForMessages(1, 10_000);
  assert.match(server.messages.at(-1).text, /project-joi-bar\.jpg/);
  assert.match(server.messages.at(-1).text, /\/cancel/);

  /* Then sends a photo in the chat, which becomes the new block image. */
  server.pushTelegramUpdate({
    update_id: 2,
    message: { message_id: 11, chat: { id: 1 }, from: { id: 1 }, photo: [{ file_id: 'photo-1', file_size: 1024 }] },
  });
  await server.waitForPhotos(1, 10_000);
  const preview = server.photos.at(-1);

  const diskStore = JSON.parse(fs.readFileSync(path.join(server.directory, 'data', 'store.json'), 'utf8'));
  const override = diskStore.editor.overrides.find(o => o.scope === 'site' && o.targetId === 'gate' && o.field === 'heroImage');
  assert.ok(override, 'the photo becomes a saved override for the gate background');
  assert.match(override.text, /^\/media\/img-/);
  const media = diskStore.editor.media.find(item => item.url === override.text);
  assert.ok(media, 'the uploaded photo is registered in the media library');
  assert.equal(media.type, 'image/jpeg');
  assert.ok(preview.caption.includes(media.file), 'the preview names the stored photo');
  assert.ok(fs.existsSync(path.join(server.directory, 'data', 'uploads', media.file)));

  /* The public media route serves the photo, and /api/site exposes it to the gate. */
  const imageResponse = await fetch(`http://127.0.0.1:${server.port}${media.url}`);
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('content-type'), 'image/jpeg');
  const imageBytes = Buffer.from(await imageResponse.arrayBuffer());
  assert.equal(imageBytes.toString('latin1', 0, 3), 'ÿØÿ');
  assert.equal((await fetch(`http://127.0.0.1:${server.port}/media/img-missing.jpg`)).status, 404);
  const site = await server.get('/api/site');
  assert.equal(site.body.gate.heroImage, override.text);

  /* The bot echoes a preview of the saved photo with a rollback button. */
  assert.equal(preview.photo, `https://course.example.com${override.text}`);
  assert.equal(preview.reply_markup.inline_keyboard[0][1].callback_data, `o:${override.id}`);
});

test('public site copy ships English defaults and merges administrator site overrides', async t => {
  const initialStore = {
    editor: {
      materials: [], posts: [], overrides: [
        { id: 'ovr-test-gate', scope: 'site', targetId: 'gate', field: 'lead', text: 'EDITED LEAD LINE FOR THE GATE.', updatedAt: '2026-10-04T00:00:00.000Z' },
        { id: 'ovr-test-bad', scope: 'site', targetId: 'gate', field: 'nope', text: 'X', updatedAt: '2026-10-04T00:00:00.000Z' },
      ],
    },
  };
  const server = await isolatedServer(t, {}, initialStore);
  const site = await server.get('/api/site');
  assert.equal(site.status, 200);
  assert.equal(site.body.gate.lead, 'EDITED LEAD LINE FOR THE GATE.');
  assert.equal(site.body.gate.eyebrow, 'DIGITAL PRODUCT · 2026 EDITION');
  assert.equal(site.body.landing.heroEyebrow, 'A LIVING DIGITAL ELECTIVE · 2026 EDITION');
  assert.equal(Object.hasOwn(site.body.gate, 'nope'), false, 'Unknown fields are never injected');
});

test('the russian admin console builds inline menus and saves block edits', async () => {
  const { createAdminConsole } = require(path.join(ROOT, 'admin-bot.ru.js'));
  const data = {
    students: [], submissions: [], tribute: { orders: [] },
    editor: { materials: [], posts: [], overrides: [] },
    adminBot: { adminChatIds: [], pending: {}, logs: [] },
  };
  const sent = [];
  const deps = {
    store: () => data,
    saveStore() {},
    addBotLog() {},
    escapeHtml: value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    editorId: prefix => `${prefix}-test`,
    validHttpsUrl: value => { try { const u = new URL(String(value || '')); return u.protocol === 'https:' ? u.toString() : ''; } catch { return ''; } },
    sendTelegramMessage: async (chatId, text, keyboard) => { sent.push({ text, keyboard }); return true; },
    editTelegramMessage: async () => true,
    answerCallbackQuery: async () => true,
    executeBotCommand: async command => ({ ok: true, reply: `legacy:${command}` }),
    applyAdminReview: () => ({ ok: true, submission: { name: 'Student', assignment: 'Assignment' } }),
    isStudentAccessActive: () => true,
    getTributeStatus: () => ({ mode: 'not-configured', deliveryReady: false }),
    courseData: () => courseData(),
    courseModules: () => courseData().modules.map(m => ({ id: m.id, number: m.number, title: m.title, lessons: m.lessons.map(l => ({ id: l.id, title: l.title })) })),
    siteDefaults: () => { const context = { window: {} }; vm.runInNewContext(read('site-copy.js'), context); return context.window.SITE; },
    validImageReference: value => {
      const raw = String(value || '').trim();
      if (/^https:\/\/\S+$/.test(raw) || /^\/media\/[A-Za-z0-9._-]+$/.test(raw) || /^[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i.test(raw)) return raw;
      return '';
    },
    ingestTelegramPhoto: async () => ({
      media: { id: 'img-test', file: 'img-test.jpg', url: '/media/img-test.jpg', name: 'upload.jpg', type: 'image/jpeg', size: 2048, source: 'telegram', createdAt: new Date().toISOString() },
    }),
    removeMedia: id => {
      const index = data.editor.media.findIndex(item => item.id === id);
      if (index === -1) return { error: 'Photo not found.' };
      const [removed] = data.editor.media.splice(index, 1);
      const before = data.editor.overrides.length;
      data.editor.overrides = data.editor.overrides.filter(o => o.text !== removed.url);
      return { media: removed, overridesCleared: before - data.editor.overrides.length };
    },
    mediaPublicUrl: file => `https://course.example.com/media/${file}`,
    sendTelegramPhoto: async (chatId, url, caption, keyboard) => { sent.push({ text: caption, keyboard, photo: url }); return true; },
  };
  const adminConsole = createAdminConsole(deps);

  sent.length = 0;
  await adminConsole.handleAdminMessage({ chat: { id: '1' }, text: '/panel' });
  assert.ok(sent.length === 1 && sent[0].keyboard.inline_keyboard.length >= 5, 'main menu shows the inline keyboard');

  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb1', data: 'E:module:future:description', message: { chat: { id: '1' }, message_id: 5 } });
  assert.ok(data.adminBot.pending['1'], 'pressing a field button opens a deferred text input');

  sent.length = 0;
  await adminConsole.handleAdminMessage({ chat: { id: '1' }, text: 'EDITED MODULE DESCRIPTION 123' });
  assert.equal(data.editor.overrides.length, 1);
  assert.equal(data.editor.overrides[0].scope, 'module');
  assert.equal(data.editor.overrides[0].targetId, 'future');
  assert.equal(data.editor.overrides[0].field, 'description');
  assert.equal(data.editor.overrides[0].text, 'EDITED MODULE DESCRIPTION 123');
  assert.ok(!data.adminBot.pending['1'], 'pending input is cleared after saving');

  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb2', data: 'R:module:future', message: { chat: { id: '1' }, message_id: 6 } });
  assert.equal(data.editor.overrides.length, 0, 'reset removes the module overrides');

  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb3', data: 'S:gate', message: { chat: { id: '1' } } });
  const gateButtons = sent[0].keyboard.inline_keyboard.flat().map(b => b.callback_data || '');
  assert.ok(gateButtons.includes('E:site:gate:lead'), 'site block editor exposes gate fields');
  assert.ok(gateButtons.includes('E:site:gate:heroImage'), 'the gate screen exposes the full-screen background photo');

  /* The photo screen lists background images and block photo groups. */
  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb4', data: 'F:0', message: { chat: { id: '1' } } });
  const photoButtons = sent[0].keyboard.inline_keyboard.flat().map(b => b.callback_data || '');
  for (const expected of ['E:site:gate:heroImage', 'E:site:landing:heroImage', 'E:site:landing:budgetImage1', 'PM:0', 'PL:0', 'PJ:0', 'G:0']) {
    assert.ok(photoButtons.includes(expected), `photo screen exposes ${expected}`);
  }
  const projectPhotoButtons = adminConsole.handleCallback({ id: 'cb5', data: 'PJ:0', message: { chat: { id: '1' } } });
  await projectPhotoButtons;
  const projectButtons = sent.at(-1).keyboard.inline_keyboard.flat().map(b => b.callback_data || '');
  assert.ok(projectButtons.some(data => /^E:project:joi:image$/.test(data)), 'project covers are replaceable');
  assert.ok(projectButtons.some(data => /^E:project:joi:leadPhoto$/.test(data)), 'the project lead photo is replaceable');

  /* A photo sent while an image field is pending becomes a /media/ override. */
  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb6', data: 'E:module:future:image', message: { chat: { id: '1' }, message_id: 10 } });
  assert.equal(data.adminBot.pending['1'].kind, 'image', 'image fields wait for an uploaded photo');
  sent.length = 0;
  await adminConsole.handleAdminMessage({ chat: { id: '1' }, photo: [{ file_id: 'photo-1', file_size: 4096 }] });
  const photoOverride = data.editor.overrides.find(o => o.scope === 'module' && o.field === 'image');
  assert.equal(photoOverride.text, '/media/img-test.jpg');
  assert.ok(sent.at(-1).text.includes('img-test.jpg'), 'the confirmation names the stored photo');
  assert.match(sent.at(-1).photo, /course\.example\.com\/media\/img-test\.jpg/);
  assert.ok(!data.adminBot.pending['1'], 'the pending photo request is cleared');

  /* Media library lists the upload and can delete it together with its overrides. */
  data.editor.media = [{ id: 'img-test', file: 'img-test.jpg', url: '/media/img-test.jpg', name: 'upload.jpg', type: 'image/jpeg', size: 2048, createdAt: '2026-10-04T00:00:00.000Z' }];
  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb7', data: 'MC:img-test', message: { chat: { id: '1' } } });
  assert.match(sent[0].text, /img-test\.jpg/);
  sent.length = 0;
  await adminConsole.handleCallback({ id: 'cb8', data: 'MX:img-test', message: { chat: { id: '1' }, message_id: 12 } });
  assert.equal(data.editor.media.length, 0, 'the uploaded photo is removed from the library');
  assert.equal(data.editor.overrides.some(o => o.text === '/media/img-test.jpg'), false, 'blocks using the photo return to their published image');
});
