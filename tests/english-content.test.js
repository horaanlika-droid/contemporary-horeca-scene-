'use strict';

const assert = require('node:assert/strict');
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

  // Pacific is present as author's bar stations/equipment project
  const pacific = course.projects.items.find(p => p.id === 'pacific');
  assert.ok(pacific);
  assert.match(pacific.name, /Pacific/);

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
  assert.equal(course.cases.length, 13);
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

async function isolatedServer(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chs-english-'));
  const serverFile = path.join(directory, 'server.js');
  fs.copyFileSync(path.join(ROOT, 'server.js'), serverFile);
  // Report the actual ephemeral port over IPC without changing the production server.
  const bootstrap = `
    const http = require('node:http');
    const createServer = http.createServer;
    http.createServer = (...args) => {
      const server = createServer(...args);
      server.once('listening', () => process.send({ port: server.address().port }));
      return server;
    };
    require(${JSON.stringify(serverFile)});
  `;
  const child = spawn(process.execPath, ['-e', bootstrap], {
    cwd: directory,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    env: {
      ...process.env,
      PORT: '0', COURSE_PASSWORD: 'english-regression-test', COURSE_PASSWORDS: '',
      ACCESS_SECRET: 'isolated-english-regression-secret', BOT_TOKEN: '', ADMIN_IDS: '',
      TRIBUTE_API_KEY: '',
    },
  });
  let logs = '';
  child.stdout.on('data', data => { logs += data; });
  child.stderr.on('data', data => { logs += data; });
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
    child.once('message', message => { clearTimeout(timer); resolve(message); });
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Test server exited (${code}): ${logs}`)); });
  });
  return async (route, payload, token) => {
    const response = await fetch(`http://127.0.0.1:${port}${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const text = await response.text();
    assert.doesNotMatch(text, CYRILLIC, route);
    return { status: response.status, body: JSON.parse(text) };
  };
}

test('access, demo checkout, review and Admin Bot responses remain functional and English-only', async t => {
  const post = await isolatedServer(t);
  const denied = await post('/api/access', { password: 'incorrect' });
  assert.equal(denied.status, 401);
  assert.match(denied.body.error, /^Incorrect password/);

  const admin = await post('/api/access', { password: 'english-regression-test' });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.user.role, 'ADMIN');
  const token = admin.body.token;
  const command = text => post('/api/admin/bot-command', { command: text }, token);

  assert.match((await command('/help')).body.reply, /Available commands/);
  assert.match((await command('/pending')).body.reply, /No submissions are awaiting review/);
  assert.match((await command('/students')).body.reply, /No personal passwords/);
  assert.match((await command('/approve')).body.reply, /Usage: \/approve/);
  assert.match((await command('/unknown')).body.reply, /Unknown command/);

  const generated = await command('/genpass Jordan jordan@example.test');
  assert.equal(generated.body.ok, true);
  assert.match(generated.body.reply, /Personal password generated/);

  const checkout = await post('/api/tribute/checkout', {
    name: 'Alex Morgan', email: 'alex@example.test', clientId: 'english-test-client',
  });
  assert.equal(checkout.status, 200);
  assert.equal(checkout.body.stub, true);
  assert.match(checkout.body.message, /No real charge was made/);
  assert.match(checkout.body.password, /^CHS-/);
  const duplicate = await post('/api/tribute/checkout', { email: 'alex@example.test' });
  assert.equal(duplicate.status, 409);

  const student = await post('/api/access', {
    password: checkout.body.password, clientId: 'english-test-client',
  });
  assert.equal(student.status, 200);
  assert.equal(student.body.user.role, 'STUDENT');
  const otherDevice = await post('/api/access', {
    password: checkout.body.password, clientId: 'another-client',
  });
  assert.equal(otherDevice.status, 403);
  assert.match(otherDevice.body.error, /activated by another person/);

  const submitted = await post('/api/submissions', {
    moduleId: 'budget', lessonId: 'budget-builds',
    assignment: 'Found-object budget', answer: 'A clear concept and cost estimate.',
  }, student.body.token);
  assert.equal(submitted.status, 200);
  assert.match((await command('/pending')).body.reply, /Files: none/);
  const id = submitted.body.submission.id;
  const revised = await command(`/revise ${id} Add a clearer budget.`);
  assert.equal(revised.body.submission.status, 'REVISION REQUESTED');
  assert.match(revised.body.reply, /Feedback sent to the student/);
  const approved = await command(`/approve ${id} The concept and budget are clear.`);
  assert.equal(approved.body.submission.status, 'APPROVED');
  assert.match(approved.body.reply, /Status APPROVED saved/);
  assert.match((await command('/students')).body.reply, /Assigned \(activated\)/);
});
