/* ============================================================================
   ACCESS GATE — Contemporary Horeca Scene
   The whole course (content seed + all views) sits behind a cohort password.
   Verification is server-side first (POST /api/access sets an HttpOnly cookie
   that also unlocks /course-data.js, /course/ and /presentation/); if no API is
   reachable (static hosting) it falls back to a local digest check, so the
   password itself is never shipped in the bundle.
   ========================================================================== */
(() => {
  'use strict';

  const FLAG = 'chs-access-v1';
  const CONTENT = 'course-data.js';
  const COURSE = 'Contemporary Horeca Scene';
  /* SHA-256 and a non-crypto fallback digest of the cohort password. */
  const SHA256 = '2b7a5e29ea101c8eb3839d18ba52cdcc34f5660845662b5721c4f72bf5d52200';
  const LEGACY = 797496869;

  const root = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let toastTimer;
  let booted = false;

  const toast = text => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
  };

  const legacyDigest = value => {
    let h = 5381;
    for (const ch of value) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
    return h;
  };

  const localDigest = async value => {
    try {
      const subtle = globalThis.crypto?.subtle;
      if (!subtle) return String(legacyDigest(value));
      const buffer = await subtle.digest('SHA-256', new TextEncoder().encode(value));
      return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return String(legacyDigest(value));
    }
  };

  const verifyLocal = async value => {
    const digest = await localDigest(value);
    return digest === SHA256 || (digest === String(LEGACY) && legacyDigest(value) === LEGACY);
  };

  /* --- server conversation ------------------------------------------------ */
  const apiStatus = async () => {
    try {
      const response = await fetch('/api/access', { method: 'GET', headers: { Accept: 'application/json' } });
      if (!response.ok) return 'unsupported';
      const payload = await response.json();
      return payload && payload.unlocked ? 'granted' : 'locked';
    } catch {
      return 'unsupported';
    }
  };

  const apiUnlock = async password => {
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (response.status === 404 || response.status === 405 || response.status === 501) return 'unsupported';
      const payload = await response.json().catch(() => ({}));
      return response.ok && payload.unlocked ? 'granted' : 'denied';
    } catch {
      return 'unsupported';
    }
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-content="${src}"]`);
    if (existing) { resolve(); return; }
    const script = document.createElement('script');
    script.src = src;
    script.dataset.content = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });

  /* --- unlock ------------------------------------------------------------- */
  async function unlock(silent) {
    if (booted) return;
    booted = true;
    try {
      localStorage.setItem(FLAG, '1');
    } catch { /* private mode */ }
    try {
      await loadScript(CONTENT);
    } catch {
      booted = false;
      try { localStorage.removeItem(FLAG); } catch { /* ignore */ }
      renderGate('CONTENT LOCKED · ASK THE AUTHOR FOR A CURRENT PASSWORD');
      return;
    }
    if (!window.COURSE) {
      booted = false;
      renderGate('COURSE CONTENT COULD NOT BE READ');
      return;
    }
    if (!silent) toast('ACCESS GRANTED · WELCOME TO THE ELECTIVE');
    if (typeof window.bootCourse === 'function') window.bootCourse();
  }

  /* --- gate view ---------------------------------------------------------- */
  function renderGate(message = '') {
    booted = false;
    document.documentElement.classList.remove('telegram-webapp');
    root.innerHTML = `
    <main class="gate-page">
      <div class="gate-visual">
        <img src="presentation/assets/horeca-atmosphere-candle.jpg" alt="A candle-lit contemporary bar interior">
        <div class="gate-visual-copy">
          <span class="eyebrow">PRIVATE COURSE · 2026 EDITION</span>
          <h1>Contemporary<br><em>Horeca</em> Scene</h1>
          <p>A living digital elective on the venues, ideas, techniques and budgets shaping the contemporary horeca scene.</p>
        </div>
      </div>
      <div class="gate-form-wrap">
        <form class="gate-form" id="gate-form" novalidate>
          <div class="gate-lock"><i aria-hidden="true">✳</i><span>Course access is protected<br>by a cohort password</span></div>
          <span class="eyebrow">ENTER THE COURSE</span>
          <h2>Password <em>required.</em></h2>
          <p>Enter the access password you received for this edition to open the full course: modules, lessons, case files, assignments and the final mockup brief.</p>
          <div class="field">
            <label for="course-password">Course password</label>
            <input class="form-control" id="course-password" name="password" type="password" autocomplete="current-password"
                   inputmode="text" spellcheck="false" required placeholder="••••••••" aria-describedby="gate-error">
          </div>
          <p id="gate-error" class="form-help" role="alert">${message}</p>
          <button class="button" type="submit" style="width:100%">OPEN THE COURSE <span aria-hidden="true">↗</span></button>
          <div class="gate-note">
            <b>Need access?</b>
            The password is issued per cohort by the course author. Access is remembered on this device for 30 days.
          </div>
        </form>
      </div>
    </main>`;
    const field = document.getElementById('course-password');
    field?.focus({ preventScroll: true });
  }

  /* --- events ------------------------------------------------------------- */
  document.addEventListener('submit', async event => {
    if (event.target.id !== 'gate-form') return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type=submit]');
    const error = document.getElementById('gate-error');
    const password = String(new FormData(form).get('password') || '').trim();
    if (!password) {
      error.textContent = 'Enter the course password.';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
    if (button) { button.disabled = true; button.textContent = 'CHECKING…'; }
    error.textContent = '';
    const result = await apiUnlock(password);
    if (result === 'granted') { await unlock(); return; }
    if (result === 'unsupported' && await verifyLocal(password)) { await unlock(); return; }
    if (button) { button.disabled = false; button.innerHTML = 'OPEN THE COURSE <span aria-hidden="true">↗</span>'; }
    error.textContent = result === 'denied' || result === 'unsupported'
      ? 'That password does not open this edition. Check the characters and try again.'
      : 'Access could not be verified. Please try again.';
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
  });

  /* --- boot --------------------------------------------------------------- */
  (async () => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp) {
      try {
        tgApp.ready(); tgApp.expand();
        document.documentElement.classList.add('telegram-webapp');
        tgApp.setHeaderColor?.('#0a0a0a'); tgApp.setBackgroundColor?.('#ffffff');
      } catch { /* SDK not available */ }
    }
    const status = await apiStatus();
    if (status === 'granted') { await unlock(true); return; }
    if (status === 'unsupported') {
      let remembered = false;
      try { remembered = localStorage.getItem(FLAG) === '1'; } catch { remembered = false; }
      if (remembered) { await unlock(true); return; }
    }
    renderGate();
  })();
})();
