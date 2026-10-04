/* ============================================================================
   ACCESS GATE — Contemporary Horeca Scene
   Individual password from a verified Tribute webhook (one per purchaser),
   or master/admin password. Unlocks course-data.js and automatically signs the
   visitor in so all modules and lessons are immediately accessible.
   ========================================================================== */
(() => {
  'use strict';

  const TOKEN_KEY = 'chs-access-token';
  const CLIENT_KEY = 'chs-client-id';
  const USER_KEY = 'chs-user';
  const USER_BACKUP_KEY = 'chs-user-backup';
  const CONTENT = 'course-data.js';

  const root = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  let toastTimer;
  let booted = false;
  let currentUser = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

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

  const apiUnlock = async password => {
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          password,
          clientId: getClientId(),
        }),
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
      renderGate('YOUR ACCESS SESSION COULD NOT BE RESTORED. PLEASE ENTER YOUR PASSWORD AGAIN.');
      return;
    }
    booted = true;
    try {
      await loadScript(CONTENT);
    } catch {
      booted = false;
      try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      renderGate('COURSE CONTENT IS LOCKED. PLEASE VERIFY YOUR PERSONAL PASSWORD.');
      return;
    }
    if (!window.COURSE) {
      booted = false;
      renderGate('COURSE CONTENT COULD NOT BE READ');
      return;
    }
    if (!silent) toast('ACCESS GRANTED · ALL MODULES AND LESSONS ARE AVAILABLE');
    if (!location.hash || location.hash === '#/' || location.hash === '#') location.hash = '/dashboard';
    if (typeof window.bootCourse === 'function') window.bootCourse();
  }

  /* --- gate view ---------------------------------------------------------- */
  function renderGate(message = '') {
    booted = false;
    document.documentElement.classList.remove('telegram-webapp');
    root.innerHTML = `
    <main class="gate-page">
      <div class="gate-stage">
      <div class="gate-visual">
        <img src="presentation/assets/project-coocoo-room.jpg" alt="The author’s own café room: cloud ceiling, pastel counter and a signature serve on a tray">
        <div class="gate-visual-copy">
          <span class="eyebrow">DIGITAL PRODUCT · 2026 EDITION</span>
          <h1>Contemporary<br><em>Horeca</em> Scene</h1>
          <p>A living digital elective on the venues, 50 Best menu concepts, industry leaders, found-object mockups and budgets shaping the contemporary horeca scene.</p>
          <button class="gate-more" type="button" data-scroll-info>ABOUT THE COURSE ↓</button>
          <button class="gate-more" type="button" data-author-open>ABOUT THE AUTHOR ↗</button>
        </div>
      </div>
      <div class="gate-form-wrap">
        <div class="gate-form">
          <form id="gate-form" novalidate>
            <div class="gate-lock"><i aria-hidden="true">✳</i><span>Individual course password<br>Delivered after Tribute payment</span></div>
            <span class="eyebrow">ENTER THE COURSE</span>
            <h2>Password <em>required.</em></h2>
            <p>Enter the individual password sent by the course bot after your payment is confirmed by <b>Tribute</b>. One password opens every module, lesson and assignment.</p>
            <div class="field">
              <label for="course-password">Individual password</label>
              <input class="form-control" id="course-password" name="password" type="password" autocomplete="current-password"
                     inputmode="text" spellcheck="false" required placeholder="Enter your personal course password" aria-describedby="gate-error">
            </div>
            <p id="gate-error" class="form-help" role="alert">${message}</p>
            <button class="button" type="submit" style="width:100%">OPEN THE COURSE <span aria-hidden="true">↗</span></button>
          </form>

          <div class="gate-note" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)">
            <span class="eyebrow" style="margin-bottom:10px">PAID ACCESS · DELIVERED IN TELEGRAM</span>
            <b>Get your individual password through Tribute</b>
            <p style="margin:6px 0 14px">Open the course bot and tap Start, then pay inside Telegram with Tribute. Your personal password is sent to that chat as soon as the payment is confirmed.</p>
            <button class="button light small" type="button" data-tribute-open style="width:100%">GET ACCESS VIA TRIBUTE <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </div>
      </div>

      <section class="gate-info" id="gate-info">
        <div class="gate-info-inner gate-info-slim">
          <article class="gate-card">
            <span class="eyebrow">ABOUT THE ELECTIVE</span>
            <h3>Ten modules on what<br><em>shapes</em> the scene.</h3>
            <p><b>Contemporary Horeca Scene</b> reads the industry as a living scene — and ends with a hospitality concept and a physical mockup you build and defend yourself.</p>
            <div class="gate-facts">
              <div class="gate-fact"><strong>10</strong><span>Modules</span></div>
              <div class="gate-fact"><strong>13</strong><span>Learning units</span></div>
              <div class="gate-fact"><strong>01</strong><span>Password opens everything</span></div>
            </div>
            <p class="gate-note-line">Course created by <b>Egor Tarasenko</b>. <button class="gate-author-link" type="button" data-author-open>About the author →</button></p>
            <p class="gate-note-line gate-note-mail">Course, licensing and programme enquiries: <a href="mailto:egor.tarasenko@him-mail.ch">egor.tarasenko@him-mail.ch</a></p>
            <p class="gate-note-line">Photography: the author’s archive and credited editorial sources — the full list with rights is published inside the course.</p>
          </article>
        </div>
      </section>

      <footer class="gate-foot">
        <span>© 2026 Egor Tarasenko · Course content &amp; author IP</span>
        <span>Contemporary Horeca Scene · 2026 Edition</span>
        <span>Hotel Institute Montreux</span>
        <button class="gate-author-link" type="button" data-author-open>About the author</button>
      </footer>
    </main>`;
    root.querySelector('[data-scroll-info]')?.addEventListener('click', () => document.getElementById('gate-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    const field = document.getElementById('course-password');
    field?.focus({ preventScroll: true });
  }

  let tributeOverlay = null;
  let tributeLastFocus = null;

  const closeTributeModal = () => {
    if (!tributeOverlay) return;
    tributeOverlay.classList.remove('show');
    document.body.classList.remove('tribute-open');
    const el = tributeOverlay;
    tributeOverlay = null;
    setTimeout(() => el.remove(), 220);
    tributeLastFocus?.focus?.({ preventScroll: true });
  };

  const openTributeModal = async () => {
    if (tributeOverlay) return;
    tributeLastFocus = document.activeElement;
    let settings = {};
    try {
      const response = await fetch('/api/tribute/status', { headers: { Accept: 'application/json' } });
      if (response.ok) settings = await response.json();
    } catch { /* show a closed checkout state if the service is unavailable */ }

    const productUrl = settings.productUrl || '';
    const subscriptionUrl = settings.subscriptionUrl || '';
    const botUrl = settings.botStartUrl || '';
    const productTitle = settings.productTitle || 'Contemporary Horeca Scene · 2026 Edition';
    const productOffer = Boolean(settings.deliveryReady && settings.productCheckoutReady && productUrl && botUrl);
    const subscriptionOffer = Boolean(settings.deliveryReady && settings.subscriptionCheckoutReady && subscriptionUrl && botUrl);
    const price = productOffer && subscriptionOffer
      ? `Product: ${settings.productPrice || 'price in Tribute'} · Subscription: ${settings.subscriptionPrice || 'price in Tribute'}`
      : subscriptionOffer ? (settings.subscriptionPrice || 'Price shown in Tribute')
        : (settings.productPrice || 'Price shown in Tribute');
    const canPay = productOffer || subscriptionOffer;
    const offerLabel = productOffer && subscriptionOffer
      ? 'LIFETIME PRODUCT OR RECURRING SUBSCRIPTION'
      : subscriptionOffer ? 'RECURRING SUBSCRIPTION · EXPIRY SET BY TRIBUTE'
        : productOffer ? 'ONE-TIME PRODUCT · LIFETIME ACCESS'
          : 'TRIBUTE PAYMENT SETUP REQUIRED';
    const entitlementNote = productOffer && subscriptionOffer
      ? 'A one-time product purchase grants lasting access. Subscription renewals extend access to the expiry reported by Tribute; cancellation stops renewal, while access follows that verified expiry.'
      : subscriptionOffer
        ? 'Subscription renewals extend access to the expiry reported by Tribute. Cancellation stops renewal; course access ends on the verified expiry date.'
        : 'A confirmed one-time product purchase grants lasting access. No renewal is required.';
    const botStep = botUrl
      ? `<a class="button light tribute-bot-start" href="${escapeHtml(botUrl)}" target="_blank" rel="noopener noreferrer">1 · OPEN THE COURSE BOT <span aria-hidden="true">↗</span></a>`
      : '<div class="tribute-setup-note">The course bot link is not configured yet. Please contact the course team before paying.</div>';
    const paymentSteps = [];
    if (productOffer) paymentSteps.push(`<a class="button tribute-direct-pay" href="${escapeHtml(productUrl)}" target="_blank" rel="noopener noreferrer">2 · BUY LIFETIME PRODUCT ACCESS <span aria-hidden="true">↗</span></a>`);
    if (subscriptionOffer) paymentSteps.push(`<a class="button tribute-direct-pay" href="${escapeHtml(subscriptionUrl)}" target="_blank" rel="noopener noreferrer">2 · START COURSE SUBSCRIPTION <span aria-hidden="true">↗</span></a>`);
    const payStep = paymentSteps.length
      ? paymentSteps.join('')
      : '<button class="button tribute-direct-pay" type="button" disabled>TRIBUTE CHECKOUT IS NOT OPEN YET</button><p class="tribute-unavailable">Automatic password delivery is still being configured. Please try again later.</p>';

    tributeOverlay = document.createElement('div');
    tributeOverlay.className = 'tribute-overlay';
    tributeOverlay.innerHTML = `
      <div class="tribute-dialog" role="dialog" aria-modal="true" aria-labelledby="tribute-title" tabindex="-1">
        <button class="tribute-close" type="button" data-tribute-close aria-label="Close Tribute payment dialog">✕</button>
        <header class="tribute-head">
          <span class="eyebrow">TRIBUTE · PERSONAL COURSE ACCESS</span>
          <h2 id="tribute-title">Your own <em>key</em>.</h2>
          <p class="tribute-price-badge">${escapeHtml(offerLabel)} · ONE INDIVIDUAL PASSWORD · ${escapeHtml(price)}</p>
        </header>
        <div class="tribute-body">
          <p class="tribute-desc"><strong>${escapeHtml(productTitle)}</strong> opens the complete course: every module, lesson and assignment. Your individual password is delivered by our Telegram bot after Tribute confirms your payment.</p>
          <div class="tribute-flow">
            <div><span>01</span><p><strong>Start the course bot.</strong> Telegram only lets a bot message people who have opened it first.</p></div>
            <div><span>02</span><p><strong>${subscriptionOffer && !productOffer ? 'Start your subscription inside Tribute.' : 'Pay inside Tribute.'}</strong> The transaction stays in Telegram.</p></div>
            <div><span>03</span><p><strong>Receive your password.</strong> The bot sends it automatically after confirmation; use <code>/password</code> to retrieve it again. ${escapeHtml(entitlementNote)}</p></div>
          </div>
          <div class="tribute-direct-box">
            <span class="eyebrow tight" style="color:var(--red)">SECURE, AUTOMATIC DELIVERY</span>
            <div class="tribute-actions">${botStep}${payStep}</div>
            <p class="tribute-help">Already paid? Open the course bot and send <code>/password</code>. If payment is still processing, the bot will deliver your code as soon as Tribute confirms it.</p>
            <div class="tribute-transparency">
              <span class="eyebrow tight">WHAT YOUR PAYMENT COVERS · FULL TRANSPARENCY</span>
              <ul>
                <li>The complete elective: all ${C.modules.length} modules, every lesson, human assignment review and the certificate — one individual password, no extra fees.</li>
                <li>Price and currency are shown in the Tribute checkout; the course app never sees or stores card data.</li>
                <li>One purchase = one personal password, delivered automatically by the course bot; retrieving it later with <code>/password</code> is free.</li>
                <li>Receipts and refunds follow the Tribute (Telegram) policy; the course team answers any payment question at egor.tarasenko@him-mail.ch.</li>
                <li>The administrator master password opens the admin panel only — it is never issued to students, who always receive individual Tribute passwords.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`;

    document.body.appendChild(tributeOverlay);
    document.body.classList.add('tribute-open');
    requestAnimationFrame(() => {
      tributeOverlay?.classList.add('show');
      tributeOverlay?.querySelector('.tribute-dialog')?.focus({ preventScroll: true });
    });
  };

  window.openTributeModal = openTributeModal;

  /* --- events ------------------------------------------------------------- */
  document.addEventListener('click', event => {
    if (event.target.closest('[data-tribute-open]')) {
      event.preventDefault();
      openTributeModal();
      return;
    }
    if (event.target.closest('[data-tribute-close]') || (tributeOverlay && event.target === tributeOverlay)) {
      event.preventDefault();
      closeTributeModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (!tributeOverlay) return;
    if (event.key === 'Escape') {
      event.stopImmediatePropagation();
      closeTributeModal();
      return;
    }
    if (event.key === 'Tab') {
      const items = [...tributeOverlay.querySelectorAll('button:not([disabled]), a[href]')];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === tributeOverlay.querySelector('.tribute-dialog'))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  }, true);

  document.addEventListener('submit', async event => {
    if (event.target.id !== 'gate-form') return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type=submit]');
    const error = document.getElementById('gate-error');
    const password = String(new FormData(form).get('password') || '').trim();
    if (!password) {
      error.textContent = 'Enter the individual course password sent by the Telegram bot.';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
    if (button) { button.disabled = true; button.textContent = 'CHECKING ACCESS…'; }
    error.textContent = '';
    const result = await apiUnlock(password);
    if (result.state === 'granted') { await unlock(); return; }
    if (button) { button.disabled = false; button.innerHTML = 'OPEN THE COURSE <span aria-hidden="true">↗</span>'; }
    error.textContent = result.state === 'unsupported'
      ? 'The secure password service is temporarily unavailable. Please try again shortly.'
      : (result.error || 'Incorrect password. Check the code sent by the course bot.');
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
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
    const status = await apiStatus();
    if (status.state === 'granted') { await unlock(true); return; }
    renderGate(status.state === 'unsupported'
      ? 'THE SECURE PASSWORD SERVICE IS UNAVAILABLE. PLEASE TRY AGAIN SHORTLY.'
      : '');
  })();
})();
