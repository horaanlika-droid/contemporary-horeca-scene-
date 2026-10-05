/* ============================================================================
   ACCESS GATE — Contemporary Horeca Scene
   One shared registration page is available to all learners; registration is
   limited server-side to Telegram accounts manually approved by the course admin.
   ========================================================================== */
(() => {
  'use strict';

  const TOKEN_KEY = 'chs-access-token';
  const CLIENT_KEY = 'chs-client-id';
  const USER_KEY = 'chs-user';
  const USER_BACKUP_KEY = 'chs-user-backup';
  const CONTENT = 'course-data.js';
  const SUPPORT_EMAIL = 'egor.tarasenko@him-mail.ch';

  const root = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let toastTimer;
  let booted = false;
  let currentUser = null;
  let siteCopy = null;
  window.__chsTributeInfo = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  /* Site imagery comes from the merged site copy: a presentation/assets file name,
     an https link, or a photo uploaded by the administrator in the bot (/media/…). */
  const siteAssetSrc = value => {
    const raw = String(value || '').trim();
    if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
    return `presentation/assets/${raw}`;
  };

  const toast = text => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
  };

  const getClientId = () => {
    try {
      let id = localStorage.getItem(CLIENT_KEY);
      if (!id) {
        id = 'cli-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem(CLIENT_KEY, id);
      }
      return id;
    } catch {
      return 'cli-session';
    }
  };

  const getSavedToken = () => {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
  };

  const saveSession = (token, userProfile) => {
    if (userProfile) currentUser = userProfile;
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (userProfile) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(userProfile));
        localStorage.setItem(USER_BACKUP_KEY, JSON.stringify(userProfile));
      }
    } catch { /* private mode */ }
  };

  const restoreSessionUser = () => {
    if (currentUser) return currentUser;
    try {
      const existing = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_BACKUP_KEY);
      if (!existing) return null;
      currentUser = JSON.parse(existing);
      sessionStorage.setItem(USER_KEY, existing);
      return currentUser;
    } catch {
      return null;
    }
  };

  /* --- server conversation ------------------------------------------------ */
  const apiStatus = async () => {
    try {
      const token = getSavedToken();
      const headers = { Accept: 'application/json' };
      if (token) headers['X-Access-Token'] = token;
      const response = await fetch('/api/access', { method: 'GET', headers });
      if (!response.ok) return { state: 'unsupported' };
      const payload = await response.json();
      if (payload && payload.unlocked) {
        saveSession(payload.token || token, payload.user);
        return { state: 'granted', payload };
      }
      return { state: 'locked', payload };
    } catch {
      return { state: 'unsupported' };
    }
  };

  const apiUnlock = async (identifier, password) => {
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ login: identifier, email: identifier, password, clientId: getClientId() }),
      });
      if (response.status === 404 || response.status === 405 || response.status === 501) {
        return { state: 'unsupported' };
      }
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.unlocked) {
        saveSession(payload.token, payload.user);
        return { state: 'granted', payload };
      }
      return { state: 'denied', error: payload.error || '' };
    } catch {
      return { state: 'unsupported' };
    }
  };

  const loadScript = src => new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-content="course-data"]');
    if (existing && window.COURSE) { resolve(); return; }
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.src = src;
    script.dataset.content = 'course-data';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });

  /* --- unlock ------------------------------------------------------------- */
  async function unlock(silent) {
    if (booted) return;
    if (!restoreSessionUser()) {
      renderGate('YOUR ACCESS SESSION COULD NOT BE RESTORED. PLEASE SIGN IN AGAIN.', 'login');
      return;
    }
    booted = true;
    try {
      await loadScript(CONTENT);
    } catch {
      booted = false;
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      renderGate('COURSE CONTENT IS LOCKED. PLEASE SIGN IN AGAIN.', 'login');
      return;
    }
    if (!window.COURSE) {
      booted = false;
      renderGate('COURSE CONTENT COULD NOT BE READ.', 'login');
      return;
    }
    if (!silent) toast('ACCESS GRANTED · ALL MODULES AND LESSONS ARE AVAILABLE');
    if (!location.hash || location.hash === '#/' || location.hash === '#') location.hash = '/dashboard';
    if (typeof window.bootCourse === 'function') window.bootCourse();
  }

  const fetchTributeInfo = async () => {
    try {
      const response = await fetch('/api/tribute/status', { headers: { Accept: 'application/json' } });
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  };

  /* --- public page copy --------------------------------------------------- */
  const fetchSiteCopy = async () => {
    try {
      const response = await fetch('/api/site', { headers: { Accept: 'application/json' } });
      if (!response.ok) return window.SITE || null;
      return await response.json();
    } catch {
      return window.SITE || null;
    }
  };

  function renderGate(message = '', mode = 'login') {
    booted = false;
    document.documentElement.classList.remove('telegram-webapp');
    const escG = escapeHtml;
    const g = { ...(window.SITE?.gate || {}), ...((siteCopy && siteCopy.gate) || {}) };
    const tribute = window.__chsTributeInfo || {};
    const safeHttps = value => {
      try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
      catch { return ''; }
    };
    const purchaseUrl = safeHttps(tribute.purchaseUrl);
    const botUrl = safeHttps(tribute.botStartUrl);
    const faqItems = (siteCopy?.faq || window.SITE?.faq || []).map(item => `<details class="gate-faq-item"><summary>${escG(item.question)}</summary><p>${escG(item.answer)}</p></details>`).join('');

    root.innerHTML = `
    <main class="gate-page">
      <div class="gate-stage">
        <div class="gate-visual">
          <img class="film-photo" src="${escG(siteAssetSrc(g.heroImage || 'project-joi-bar.jpg'))}" alt="Black-and-white close-up of paper cups and the espresso bar at Joi, softly focused and drawn from the author's own project archive">
          <div class="gate-visual-copy">
            <span class="eyebrow">${escG(g.eyebrow)}</span>
            <h1>${escG(g.titleTop)}<br><em>${escG(g.titleAccent)}</em> ${escG(g.titleBottom)}</h1>
            <p>${escG(g.lead)}</p>
            <button class="gate-more" type="button" data-scroll-info>${escG(g.aboutCourse)}</button>
            <button class="gate-more" type="button" data-author-open>${escG(g.aboutAuthor)}</button>
          </div>
        </div>
        <div class="gate-form-wrap">
          <div class="gate-form">
              <div class="gate-lock"><i aria-hidden="true">✳</i><span>PERSONAL COURSE ACCESS<br>Admission approved manually in Telegram</span></div>
            <section class="gate-auth-panel">
              <form id="login-form" novalidate>
                <span class="eyebrow">RETURNING LEARNER</span>
                <h2>Welcome <em>back.</em></h2>
                <p>Sign in with your personal login or email and password.</p>
                <div class="field"><label for="login-email">Login or email</label><input class="form-control" id="login-email" name="email" type="text" autocomplete="username" placeholder="login or you@example.com"></div>
                <div class="field"><label for="login-password">Password</label><input class="form-control" id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Your personal password"></div>
                <p class="sign-in-hint">Administrator access and legacy codes can be entered in the password field without a login.</p>
                <p id="gate-error" class="form-help" role="alert">${escG(message)}</p>
                <button class="button" type="submit" style="width:100%">SIGN IN <span aria-hidden="true">↗</span></button>
                <p class="password-support">Forgot your password? It cannot be retrieved automatically. Contact support only by email: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
              </form>
            </section>
            <section class="gate-purchase" aria-labelledby="gate-purchase-title">
              <span class="eyebrow">NEW HERE?</span>
              <h3 id="gate-purchase-title">No access or password yet?</h3>
              <p>Get course access through Tribute. Open the course bot and tap Start before paying so it can send you access instructions.</p>
              ${botUrl ? `<a class="gate-bot-link" href="${escG(botUrl)}" target="_blank" rel="noopener noreferrer">1. Open the course bot <span aria-hidden="true">↗</span></a>` : ''}
              ${purchaseUrl ? `<a class="button gate-purchase-button" href="${escG(purchaseUrl)}" target="_blank" rel="noopener noreferrer">GET ACCESS ON TRIBUTE <span aria-hidden="true">↗</span></a>` : `<p class="gate-purchase-unavailable">The Tribute purchase link is currently unavailable. <a href="mailto:${SUPPORT_EMAIL}">Contact support to get access</a>.</p>`}
              <p class="gate-purchase-note">${tribute.autoCredentials
                ? 'After confirmed payment, the bot sends your login and password. Return here to sign in.'
                : 'After payment, the administrator verifies your admission. The bot then sends your credentials or registration instructions to set your personal password. Return here to sign in.'}</p>
            </section>
          </div>
        </div>
      </div>

      <section class="gate-info" id="gate-info">
        <div class="gate-info-inner gate-info-slim">
          <article class="gate-card">
            <span class="eyebrow">${escG(g.infoEyebrow)}</span>
            <h3>${escG(g.infoTitleTop)}<br><em>${escG(g.infoTitleAccent)}</em> ${escG(g.infoTitleBottom)}</h3>
            <p><b>Contemporary Horeca Scene</b> ${escG(g.infoLead)}</p>
            <div class="gate-facts">
              <div class="gate-fact"><strong>10</strong><span>Modules</span></div>
              <div class="gate-fact"><strong>13</strong><span>Learning units</span></div>
              <div class="gate-fact"><strong>01</strong><span>Personal account</span></div>
            </div>
            <p class="gate-note-line">Course created by <b>Egor Tarasenko</b>. <button class="gate-author-link" type="button" data-author-open>About the author →</button></p>
            <p class="gate-note-line gate-note-mail">Course, licensing and programme enquiries: <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
            <p class="gate-note-line">Author photographs from Joi and Pacific are shown in a black-and-white, close-detail film-inspired treatment. Other editorial photographs are sourced from public websites and press materials. Each image is credited; full source links and rights notes are published inside the course.</p>
          </article>
        </div>
      </section>

      ${faqItems ? `<section class="gate-info gate-faq" aria-labelledby="gate-faq-title"><div class="gate-info-inner gate-info-slim"><article class="gate-card"><span class="eyebrow">HELP · STUDENT FAQ</span><h3 id="gate-faq-title">Registration, questions<br>and <em>support</em>.</h3>${faqItems}</article></div></section>` : ''}

      <footer class="gate-foot">
        <span>© 2026 Egor Tarasenko · Course content &amp; author IP</span>
        <span>Contemporary Horeca Scene · 2026 Edition</span>
        <span>Hotel Institute Montreux</span>
        <button class="gate-author-link" type="button" data-author-open>About the author</button>
      </footer>
    </main>`;

    root.querySelector('[data-scroll-info]')?.addEventListener('click', () => document.getElementById('gate-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    document.querySelector('.gate-auth-panel input')?.focus({ preventScroll: true });
  }

  /* --- forms --------------------------------------------------------------- */
  document.addEventListener('submit', async event => {
    const form = event.target;
    if (form.id === 'login-form') {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      const error = document.getElementById('gate-error');
      const identifier = String(new FormData(form).get('email') || '').trim();
      const password = String(new FormData(form).get('password') ?? '');
      if (!password) {
        error.textContent = 'Enter your login (or email) and password.';
        return;
      }
      if (button) { button.disabled = true; button.textContent = 'CHECKING ACCESS…'; }
      error.textContent = '';
      const result = await apiUnlock(identifier, password);
      if (result.state === 'granted') { await unlock(); return; }
      if (button) { button.disabled = false; button.innerHTML = 'SIGN IN <span aria-hidden="true">↗</span>'; }
      error.textContent = result.state === 'unsupported'
        ? 'The secure sign-in service is temporarily unavailable. Please try again shortly.'
        : (result.error || 'Email or password is incorrect.');
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
  });

  /* --- boot --------------------------------------------------------------- */
  (async () => {
    const tgApp = window.Telegram?.WebApp;
    if (tgApp && tgApp.initData) {
      try {
        tgApp.ready(); tgApp.expand();
        document.documentElement.classList.add('telegram-webapp');
        tgApp.setHeaderColor?.('#0a0a0a'); tgApp.setBackgroundColor?.('#ffffff');
      } catch { /* SDK not available */ }
    }
    const [status, site, tribute] = await Promise.all([apiStatus(), fetchSiteCopy(), fetchTributeInfo()]);
    siteCopy = site;
    window.__chsTributeInfo = tribute;
    if (status.state === 'granted') { await unlock(true); return; }
    renderGate(status.state === 'unsupported'
      ? 'THE SECURE ACCESS SERVICE IS UNAVAILABLE. PLEASE TRY AGAIN SHORTLY.'
      : '', 'login');
  })();
})();
