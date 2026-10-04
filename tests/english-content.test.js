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

test('all authored UI, server and course source copy is English-only', () => {
  const files = textFiles(ROOT, false).concat(
    ...['course', 'presentation/build', 'presentation/assets', 'tests']
      .map(directory => textFiles(path.join(ROOT, directory)))
  );
  for (const file of files) {
    const relative = path.relative(ROOT, file);
    assert.doesNotMatch(fs.readFileSync(file, 'utf8'), CYRILLIC, relative);
  }
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

async function isolatedServer(t, envOverrides = {}, initialStore = null) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chs-english-'));
  const serverFile = path.join(directory, 'server.js');
  fs.copyFileSync(path.join(ROOT, 'server.js'), serverFile);
  // The editor resolves module blocks from course-data.js next to the server, mirroring deployment.
  fs.copyFileSync(path.join(ROOT, 'course-data.js'), path.join(directory, 'course-data.js'));
  if (initialStore) {
    fs.mkdirSync(path.join(directory, 'data'), { recursive: true });
    fs.writeFileSync(path.join(directory, 'data', 'store.json'), JSON.stringify(initialStore));
  }
  const bootstrap = `
    const http = require('node:http');
    const nativeFetch = global.fetch;
    global.fetch = async (input, init = {}) => {
      const url = String(input);
      if (url.startsWith('https://api.telegram.org/bot')) {
        if (url.includes('/getUpdates')) {
          return { ok: true, status: 200, json: async () => ({ ok: true, result: [] }) };
        }
        if (url.includes('/sendMessage')) {
          const payload = JSON.parse(init.body || '{}');
          if (process.send) process.send({ type: 'telegram-message', payload });
          return { ok: true, status: 200, json: async () => ({ ok: true, result: { message_id: 1 } }) };
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
      TRIBUTE_PRODUCT_URL: '',
      ...envOverrides,
    },
  });
  let logs = '';
  const messages = [];
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
  child.on('message', message => {
    if (message?.type === 'telegram-message') messages.push(message.payload);
  });
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
  return { request, post, get, messages, waitForMessages, child };
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

async function adminToken(server) {
  const admin = await server.post('/api/access', { password: 'english-regression-test' });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.user.role, 'ADMIN');
  return admin.body.token;
}

test('course entry is password-only and the old demo checkout cannot issue access', async t => {
  const access = read('access.js');
  const app = read('app.js');
  assert.match(access, /Individual password/);
  assert.doesNotMatch(access, /tribute-checkout-form|DEMO \/ TESTING FLOW|verifyLocal|SHA256|data-use-password/i);
  assert.doesNotMatch(app, /demo-access|data-role="student"|login-form|student@him\.edu/);
  assert.doesNotMatch(access, /\/api\/tribute\/checkout/);
  assert.match(access, /ONE-TIME PRODUCT · LIFETIME ACCESS/);
  assert.match(access, /RECURRING SUBSCRIPTION · EXPIRY SET BY TRIBUTE/);

  const server = await isolatedServer(t);
  const unconfiguredAdmin = await isolatedServer(t, { COURSE_PASSWORD: '', COURSE_PASSWORDS: '' });
  const removedDefault = await unconfiguredAdmin.post('/api/access', { password: 'Mzgnxtj8' });
  assert.equal(removedDefault.status, 401, 'No built-in administrator password is accepted');

  const checkout = await server.post('/api/tribute/checkout', { name: 'Test Buyer' });
  assert.equal(checkout.status, 410);
  assert.doesNotMatch(JSON.stringify(checkout.body), /CHS-[A-Z0-9]{4}-[A-Z0-9]{4}/);

  const status = await server.get('/api/tribute/status');
  assert.equal(status.status, 200);
  assert.equal(status.body.deliveryReady, false);
  assert.equal(status.body.productUrl, '');
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
    ],
    submissions: [{ id: 'old-submission', passwordCode: 'CHS-AAAA-BBBB', answer: 'Legacy record' }],
    tribute: { orders: [
      { id: 'digital:paid-1', studentId: 'paid-product', kind: 'digital-product', status: 'PAID', purchaseId: 'paid-1' },
      { id: 'digital:fake-1', studentId: 'legacy-demo', kind: 'digital-product', status: 'PAID_STUB', purchaseId: 'fake-1', passwordIssued: true },
    ] },
  };
  const server = await isolatedServer(t, {}, initialStore);
  const manual = await server.post('/api/access', { password: 'CHS-AAAA-BBBB', clientId: 'legacy-client' });
  assert.equal(manual.status, 403);
  const demo = await server.post('/api/access', { password: 'CHS-EEEE-FFFF', clientId: 'demo-client' });
  assert.equal(demo.status, 403);
  const paid = await server.post('/api/access', { password: 'CHS-CCCC-DDDD', clientId: 'paid-client' });
  assert.equal(paid.status, 200);

  const token = await adminToken(server);
  const state = await server.get('/api/state', token);
  assert.equal(state.body.students.length, 3);
  assert.ok(state.body.students.every(student => !Object.hasOwn(student, 'password')));
  assert.equal(state.body.students.find(student => student.id === 'legacy-manual').active, false);
  assert.equal(state.body.students.find(student => student.id === 'legacy-demo').active, false);
  assert.equal(state.body.students.find(student => student.id === 'paid-product').active, true);
  assert.equal(Object.hasOwn(state.body.submissions[0], 'passwordCode'), false);
  assert.ok(state.body.tribute.orders.some(order => order.status === 'TEST_ORDER_REVOKED'));
});

test('password access and admin controls cannot create a learner password without a Tribute payment', async t => {
  const server = await isolatedServer(t);
  const denied = await server.post('/api/access', { password: 'incorrect' });
  assert.equal(denied.status, 401);
  assert.match(denied.body.error, /^Incorrect password/);

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
  // broken files can never show a broken glyph: every img falls back to a repo photograph
  assert.match(app, /onerror="this\.onerror=null;this\.src='\$\{ASSET\}\$\{IMAGE_FALLBACK\}'/);
  // provenance registry + public transparency page
  assert.match(course, /imageCredits:/);
  assert.match(course, /illustrative:/);
  assert.match(app, /r\[0\] === 'credits'/);
  assert.match(app, /Image sources &amp; rights/);
  assert.match(gate, /credited editorial sources/);
  // no unidentified stock photography left in the app-facing content
  assert.ok(!/image: 'horeca-/.test(course), 'module and case images must come from the credited archive');
  assert.ok(!/horeca-[a-z-]+\.jpg/.test(gate), 'gate visual must come from the credited archive');
  // project paragraphs show venues or illustrative archive photos, never a floating portrait
  assert.match(course, /image: 'project-joi-bar\.jpg'/);
  assert.match(course, /image: 'project-detail-nine-lives-bar\.jpg'/);
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

test('Tribute signature, product matching, idempotency and automatic Telegram password delivery', async t => {
  const apiKey = 'tribute-regression-secret';
  const server = await isolatedServer(t, {
    TRIBUTE_API_KEY: apiKey,
    TRIBUTE_PRODUCT_ID: '456',
    TRIBUTE_PRODUCT_URL: 'https://t.me/tribute/app?startapp=p456',
    TRIBUTE_PRICE: '49 EUR',
    BOT_TOKEN: 'fake-bot-token',
    BOT_USERNAME: 'chs_access_bot',
    COURSE_URL: 'https://course.example.test',
  });
  const token = await adminToken(server);
  const status = await server.get('/api/tribute/status');
  assert.equal(status.body.deliveryReady, true);
  assert.equal(status.body.productCheckoutReady, true);
  assert.equal(status.body.subscriptionCheckoutReady, false);
  assert.equal(status.body.botStartUrl, 'https://t.me/chs_access_bot?start=course');
  assert.equal(status.body.productUrl, 'https://t.me/tribute/app?startapp=p456');
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
  assert.equal(paid.body.deliveryStatus, 'DELIVERED');
  await server.waitForMessages(1);
  assert.equal(String(server.messages[0].chat_id), '123456789');
  assert.match(server.messages[0].text, /individual course password/i);
  assert.match(server.messages[0].text, /\/password/);
  const issuedCode = server.messages[0].text.match(/<code>(CHS-[A-Z0-9]{4}-[A-Z0-9]{4})<\/code>/)?.[1];
  assert.ok(issuedCode, 'The bot message contains a generated individual password');

  const duplicate = await signedTributeRequest(server, event, apiKey);
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.duplicate, true);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(server.messages.length, 1, 'A duplicate Tribute webhook does not send a second message');

  const state = await server.get('/api/state', token);
  assert.equal(state.status, 200);
  assert.equal(state.body.students.length, 1);
  assert.equal(Object.hasOwn(state.body.students[0], 'password'), false, 'Admin state summaries never expose the issued code');
  assert.equal(state.body.tribute.orders.length, 1);
  assert.equal(state.body.tribute.orders[0].deliveryStatus, 'DELIVERED');
  assert.equal(JSON.stringify(state.body.tribute).includes(apiKey), false);
  assert.equal(state.body.tribute.pendingDeliveriesCount, 0);

  const studentSession = await server.post('/api/access', { password: issuedCode, clientId: 'web-purchase-client' });
  assert.equal(studentSession.status, 200);
  assert.equal(studentSession.body.user.telegramId, '123456789');
  assert.equal(Object.hasOwn(studentSession.body.user, 'passwordCode'), false);
  const otherDevice = await server.post('/api/access', { password: issuedCode, clientId: 'another-device' });
  assert.equal(otherDevice.status, 403);

  const submitted = await server.post('/api/submissions', {
    moduleId: 'budget', lessonId: 'budget-builds',
    assignment: 'Found-object budget', answer: 'A clear concept and cost estimate.',
  }, studentSession.body.token);
  assert.equal(submitted.status, 200);
  assert.equal(Object.hasOwn(submitted.body.submission, 'passwordCode'), false);
  const command = text => server.post('/api/admin/bot-command', { command: text }, token);
  assert.match((await command('/pending')).body.reply, /Files: none/);
  const review = await command(`/approve ${submitted.body.submission.id} The concept and budget are clear.`);
  assert.equal(review.body.submission.status, 'APPROVED');
  assert.match(review.body.reply, /Feedback sent to the student/);
  await server.waitForMessages(2);

  const listedLearners = await command('/students');
  assert.match(listedLearners.body.reply, /ACTIVE/);
  assert.doesNotMatch(listedLearners.body.reply, /CHS-[A-Z0-9]{4}-[A-Z0-9]{4}/);
  const resend = await command('/resend 123456789');
  assert.equal(resend.status, 200);
  assert.equal(resend.body.ok, true);
  await server.waitForMessages(3);
  const orders = await command('/orders');
  assert.match(orders.body.reply, /digital:78901/);

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
  assert.equal((await server.post('/api/access', { password: issuedCode, clientId: 'web-purchase-client' })).status, 403);
  await server.waitForMessages(4);
});

test('paid subscriptions issue one code, preserve access until expiry and reactivate on renewal', async t => {
  const apiKey = 'tribute-subscription-secret';
  const server = await isolatedServer(t, {
    TRIBUTE_API_KEY: apiKey,
    TRIBUTE_SUBSCRIPTION_ID: '1644',
    TRIBUTE_SUBSCRIPTION_URL: 'https://t.me/tribute/app?startapp=s1644',
    BOT_TOKEN: 'fake-subscription-bot-token',
    BOT_USERNAME: 'chs_access_bot',
  });
  const token = await adminToken(server);
  const status = await server.get('/api/tribute/status');
  assert.equal(status.body.deliveryReady, true);
  assert.equal(status.body.productCheckoutReady, false);
  assert.equal(status.body.subscriptionCheckoutReady, true);
  assert.equal(status.body.productUrl, '');
  assert.equal(status.body.subscriptionUrl, 'https://t.me/tribute/app?startapp=s1644');
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
  assert.equal(purchase.body.deliveryStatus, 'DELIVERED');
  await server.waitForMessages(1);
  const code = server.messages[0].text.match(/<code>(CHS-[A-Z0-9]{4}-[A-Z0-9]{4})<\/code>/)?.[1];
  assert.ok(code);
  const session = await server.post('/api/access', { password: code, clientId: 'subscription-client' });
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
  const duringPaidPeriod = await server.post('/api/access', { password: code, clientId: 'subscription-client' });
  assert.equal(duringPaidPeriod.status, 200, 'Cancellation does not remove access before Tribute expiry');
  assert.equal((await server.get('/api/access', session.body.token)).body.unlocked, true);

  const expiryEvent = structuredClone(cancellation);
  expiryEvent.created_at = '2026-10-04T12:00:00.000Z';
  expiryEvent.payload.period_id = 4002;
  expiryEvent.payload.expires_at = '2000-01-01T00:00:00.000Z';
  const expired = await signedTributeRequest(server, expiryEvent, apiKey);
  assert.equal(expired.status, 200);
  const expiredAccess = await server.post('/api/access', { password: code, clientId: 'subscription-client' });
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
  await server.waitForMessages(4);
  assert.match(server.messages[3].text, /subscription has renewed/i);
  const restored = await server.post('/api/access', { password: code, clientId: 'subscription-client' });
  assert.equal(restored.status, 200);

  const state = await server.get('/api/state', token);
  assert.equal(state.body.students.length, 1);
  assert.equal(Object.hasOwn(state.body.students[0], 'password'), false);
  assert.equal(state.body.students[0].subscriptionStatus, 'ACTIVE');
});
