'use strict';

/* Regression guard for dead navigation in the course application.

   A page that throws while it renders used to leave the previous view on screen:
   tapping "START MODULE" changed the address but the lesson never appeared, which
   reads as a broken button. These tests boot the real app.js against a small DOM
   stand-in, walk every route of the shipped course data and assert that each one
   paints its own screen (and never falls into the display-error safety net).

   The renderer is plain string building, so no browser engine is required and the
   suite keeps the repository dependency-free. */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const STUDENT = {
  id: 'learner-regression', name: 'Regression Learner', email: 'learner@example.test', role: 'STUDENT',
  institutionId: 'him-001', unlockedLessons: [],
};

function fakeElement() {
  const classes = new Set();
  return {
    innerHTML: '', textContent: '', dataset: {}, id: '',
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: name => (classes.has(name) ? classes.delete(name) : classes.add(name)),
    },
    appendChild() {}, removeChild() {}, setAttribute() {}, removeAttribute() {},
    querySelector: () => null, querySelectorAll: () => [], closest: () => null,
    addEventListener() {}, removeEventListener() {}, focus() {}, click() {}, scrollIntoView() {},
  };
}

function fakeStorage() {
  const values = new Map();
  return {
    getItem: key => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key),
    clear: () => values.clear(),
  };
}

/* Boots window.bootCourse() from app.js against the same content files the browser
   loads, then lets the tests drive the hash router exactly like a learner would. */
function bootCourse(profile = STUDENT) {
  const listeners = new Map();
  const timers = [];
  const app = fakeElement();
  const toast = fakeElement();
  const on = (target, type, handler) => listeners.set(`${target}:${type}`, [...(listeners.get(`${target}:${type}`) || []), handler]);
  const document = {
    readyState: 'complete', hidden: false, activeElement: null,
    documentElement: { ...fakeElement(), style: { setProperty() {} } },
    body: fakeElement(),
    getElementById: id => (id === 'app' ? app : id === 'toast' ? toast : null),
    querySelector: () => null, querySelectorAll: () => [],
    createElement: () => fakeElement(),
    addEventListener: (type, handler) => on('document', type, handler),
    removeEventListener() {},
  };
  const location = {
    _hash: '',
    get hash() { return this._hash; },
    set hash(value) {
      const next = value.startsWith('#') ? value : `#${value}`;
      if (next === this._hash) return;
      this._hash = next;
      for (const handler of listeners.get('window:hashchange') || []) handler({ type: 'hashchange' });
    },
  };
  const window = {
    COURSE: null, SITE: null, Telegram: undefined,
    localStorage: fakeStorage(), sessionStorage: fakeStorage(), location, document,
    scrollTo() {}, alert() {}, print() {}, confirm: () => true, prompt: () => null,
    addEventListener: (type, handler) => on('window', type, handler),
    removeEventListener() {},
  };
  const sandbox = {
    window, document, location,
    localStorage: window.localStorage, sessionStorage: window.sessionStorage,
    console, fetch: () => Promise.reject(new Error('offline preview in tests')),
    setTimeout: handler => { timers.push(handler); return timers.length; }, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    alert() {}, confirm: () => true, prompt: () => null,
    navigator: { userAgent: 'node' }, FormData: class { get() { return null; } },
    URLSearchParams, URL,
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(read('course-data.js'), sandbox);
  vm.runInContext(read('site-copy.js'), sandbox);
  vm.runInContext(read('app.js'), sandbox);
  sandbox.window.sessionStorage.setItem('chs-user', JSON.stringify(profile));
  sandbox.window.bootCourse();
  return {
    sandbox, app, toast, location, window,
    settle: () => new Promise(resolve => setImmediate(resolve)),
    /* The renderer schedules the route confirmation with setTimeout; the stand-in
       keeps that callback queued until the test asks for it. */
    runTimers: () => { for (const handler of timers.splice(0)) handler(); },
    /* A click on an internal link in a browser that never acts on the link
       itself: the address does not move, so the router has to take over. */
    clickRoute: href => {
      const event = {
        defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false,
        target: { closest: selector => (selector.startsWith('a[href') ? { getAttribute: () => href } : null) },
      };
      for (const handler of listeners.get('document:click') || []) handler(event);
    },
  };
}

function routeList(course) {
  const routes = ['dashboard', 'course', 'cases', 'projects', 'progress', 'quiz', 'certificate', 'updates', 'faq', 'credits', 'profile', 'search?q=bar'];
  for (const module of course.modules) {
    routes.push(`module/${module.id}`);
    for (const lesson of module.lessons) {
      routes.push(`lesson/${module.id}/${lesson.id}`);
      routes.push(`assignment/${module.id}/${lesson.id}`);
    }
  }
  for (const project of course.projects?.items || []) routes.push(`project/${project.id}`);
  return routes;
}

const DISPLAY_ERROR = /DISPLAY ERROR|could not be <em>displayed<\/em>/;

test('every course route paints its own screen instead of leaving the previous view in place', async () => {
  const { sandbox, app, location, settle } = bootCourse();
  await settle();
  assert.ok(app.innerHTML.length > 400, 'the landing screen must render on boot');

  const routes = routeList(sandbox.window.COURSE);
  const failures = [];
  for (const route of routes) {
    app.innerHTML = '';
    location.hash = `#/${route}`;
    await settle();
    if (app.innerHTML.length < 400) failures.push(`${route}: rendered nothing`);
    else if (DISPLAY_ERROR.test(app.innerHTML)) failures.push(`${route}: fell into the display-error screen`);
  }
  assert.deepEqual(failures, [], `screens that did not render:\n${failures.join('\n')}`);
});

test('the module start action opens the lesson it points at, including lessons without their own image', async () => {
  const { sandbox, app, location, settle } = bootCourse();
  await settle();

  const modules = sandbox.window.COURSE.modules;
  const target = modules.find(module => module.lessons.length) || modules[0];
  location.hash = `#/module/${target.id}`;
  await settle();

  const action = app.innerHTML.match(/class="button[^"]*"[^>]*href="#\/(lesson\/[^"]+)"/);
  assert.ok(action, 'the module screen must offer a lesson action');
  assert.match(app.innerHTML, /START MODULE/, 'a fresh module offers START MODULE');

  location.hash = `#/${action[1]}`;
  await settle();
  assert.match(app.innerHTML, /lesson-layout/, 'the lesson screen must replace the module screen');
  assert.match(app.innerHTML, /MODULE \d+ · /, 'the lesson screen names its module');
  assert.match(app.innerHTML, new RegExp(`href="#/module/${target.id}"`), 'the lesson screen belongs to the opened module');
  assert.doesNotMatch(app.innerHTML, DISPLAY_ERROR);

  /* Lessons ship no thumbnail of their own: the renderer must fall back to the
     module image and still print a provenance credit, not crash on a missing name. */
  assert.match(app.innerHTML, /img-credit/, 'the lesson media keeps its credit line');
  assert.doesNotMatch(app.innerHTML, /src="presentation\/assets\/"/, 'media never points at an empty asset path');
});

test('a learning unit opens even when the browser never acts on the link itself', async () => {
  const { sandbox, app, location, settle, clickRoute, runTimers } = bootCourse();
  await settle();

  const unit = sandbox.window.COURSE.modules.find(module => module.id === 'budget');
  location.hash = `#/module/${unit.id}`;
  await settle();
  assert.match(app.innerHTML, /lesson-list/, 'the module screen lists its learning units');

  const target = `#/lesson/${unit.id}/${unit.lessons[0].id}`;
  const before = location.hash;
  clickRoute(target);          // the browser swallows the link: no hashchange event
  runTimers();                 // the router confirms the route itself
  await settle();

  assert.equal(location.hash, target, 'the router moves the address to the learning unit');
  assert.match(app.innerHTML, /lesson-layout/, 'the learning unit screen is painted');
  assert.doesNotMatch(app.innerHTML, DISPLAY_ERROR);
  assert.notEqual(location.hash, before);
});

test('the gate address opens the administrator space instead of an access-restricted screen', async () => {
  const ADMIN = {
    id: 'master-admin', name: 'Egor Tarasenko', email: 'author@example.test', role: 'ADMIN',
    isMaster: true, institutionId: 'him-001', unlockedLessons: [],
  };
  const { app, location, settle } = bootCourse(ADMIN);
  await settle();

  location.hash = '#/dashboard';
  await settle();
  assert.match(app.innerHTML, /COURSE ADMINISTRATION/, 'the administrator lands on the admin panel');
  assert.doesNotMatch(app.innerHTML, /role-restricted/);
  assert.doesNotMatch(app.innerHTML, DISPLAY_ERROR);
});

test('landing shortcuts open the module they name instead of the module list', async () => {
  const { sandbox, app, settle } = bootCourse();
  await settle();
  const budget = sandbox.window.COURSE.modules.find(module => module.id === 'budget');
  assert.ok(budget, 'the budget module ships with this edition');
  assert.match(app.innerHTML, new RegExp(`href="#/module/${budget.id}"[^>]*>OPEN MODULE`), 'the budget section opens the budget module itself');
});

test('a screen that throws still navigates: the learner sees a display error, not a frozen page', async () => {
  const { sandbox, app, location, settle } = bootCourse();
  await settle();

  const course = sandbox.window.COURSE;
  const module = course.modules[0];
  const cleanLessons = module.lessons;
  module.lessons = null; // a broken content payload must not kill navigation
  location.hash = `#/module/${module.id}`;
  await settle();
  module.lessons = cleanLessons;

  assert.match(app.innerHTML, DISPLAY_ERROR, 'the safety net reports the failed screen');
  assert.match(app.innerHTML, /RETURN TO YOUR SPACE/, 'the learner can still move on');

  location.hash = '#/course';
  await settle();
  assert.match(app.innerHTML, /app-module-list/, 'navigation recovers after a failed screen');
});
