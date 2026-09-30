/* ============================================================================
   ACCESS GATE — Contemporary Horeca Scene
   Personal password via Tribute Digital Product API (1 password per 1 person)
   or master/admin password. Unlocks course-data.js and automatically signs the
   visitor in so all modules and lessons are immediately accessible.
   ========================================================================== */
(() => {
  'use strict';

  const FLAG = 'chs-access-v1';
  const TOKEN_KEY = 'chs-access-token';
  const CLIENT_KEY = 'chs-client-id';
  const USER_KEY = 'chs-user';
  const USER_BACKUP_KEY = 'chs-user-backup';
  const CONTENT = 'course-data.js';

  /* SHA-256 and a non-crypto fallback digest of the master password for static hosting */
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
    try {
      localStorage.setItem(FLAG, '1');
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (userProfile) {
        sessionStorage.setItem(USER_KEY, JSON.stringify(userProfile));
        localStorage.setItem(USER_BACKUP_KEY, JSON.stringify(userProfile));
      }
    } catch { /* private mode */ }
  };

  const ensureDefaultUser = () => {
    try {
      const existing = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_BACKUP_KEY);
      if (existing) {
        sessionStorage.setItem(USER_KEY, existing);
        return;
      }
      const fallbackUser = {
        id: 'student-local',
        name: 'Student',
        email: 'student@him.edu',
        role: 'STUDENT',
        isMaster: true,
        institutionId: 'him-001',
        passwordCode: 'COHORT',
      };
      sessionStorage.setItem(USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(USER_BACKUP_KEY, JSON.stringify(fallbackUser));
    } catch { /* ignore */ }
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
    const clean = String(value || '').trim();
    const digest = await localDigest(clean);
    return digest === SHA256 || (digest === String(LEGACY) && legacyDigest(clean) === LEGACY);
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
          telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id ? String(window.Telegram.WebApp.initDataUnsafe.user.id) : null,
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
    const token = getSavedToken();
    const script = document.createElement('script');
    script.src = token ? `${src}?token=${encodeURIComponent(token)}` : src;
    script.dataset.content = 'course-data';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.body.appendChild(script);
  });

  /* --- unlock ------------------------------------------------------------- */
  async function unlock(silent) {
    if (booted) return;
    booted = true;
    ensureDefaultUser();
    try {
      await loadScript(CONTENT);
    } catch {
      booted = false;
      try { localStorage.removeItem(FLAG); localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      renderGate('CONTENT LOCKED · ENTER YOUR PERSONAL PASSWORD FROM TRIBUTE');
      return;
    }
    if (!window.COURSE) {
      booted = false;
      renderGate('COURSE CONTENT COULD NOT BE READ');
      return;
    }
    if (!silent) toast('ДОСТУП ОТКРЫТ · ВСЕ МОДУЛИ И УРОКИ ДОСТУПНЫ');
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
        <img src="presentation/assets/horeca-atmosphere-candle.jpg" alt="A candle-lit contemporary bar interior">
        <div class="gate-visual-copy">
          <span class="eyebrow">DIGITAL PRODUCT · 2026 EDITION</span>
          <h1>Contemporary<br><em>Horeca</em> Scene</h1>
          <p>A living digital elective on the venues, 50 Best menu concepts, industry leaders, found-object mockups and budgets shaping the contemporary horeca scene.</p>
          <button class="gate-more" type="button" data-scroll-info>О КУРСЕ ↓</button>
          <button class="gate-more" type="button" data-author-open>ОБ АВТОРЕ ↗</button>
        </div>
      </div>
      <div class="gate-form-wrap">
        <div class="gate-form">
          <form id="gate-form" novalidate>
            <div class="gate-lock"><i aria-hidden="true">✳</i><span>Personal access via Tribute<br>1 password = 1 person</span></div>
            <span class="eyebrow">ENTER THE COURSE</span>
            <h2>Password <em>required.</em></h2>
            <p>Введите ваш персональный пароль (выдаётся автоматически на 1 человека после оплаты цифрового товара через <b>Tribute</b>) — все модули, уроки, разборы 50 Best меню и задания откроются сразу.</p>
            <div class="field">
              <label for="course-password">Personal or Admin password</label>
              <input class="form-control" id="course-password" name="password" type="password" autocomplete="current-password"
                     inputmode="text" spellcheck="false" required placeholder="CHS-XXXX-XXXX или пароль админа" aria-describedby="gate-error">
            </div>
            <p id="gate-error" class="form-help" role="alert">${message}</p>
            <button class="button" type="submit" style="width:100%">OPEN THE COURSE / ВОЙТИ В КУРС <span aria-hidden="true">↗</span></button>
          </form>

          <div class="gate-note" style="margin-top:24px;padding-top:20px;border-top:1px solid var(--line)">
            <span class="eyebrow" style="margin-bottom:10px">TRIBUTE DIGITAL PRODUCT · ЦИФРОВОЙ ТОВАР</span>
            <b>Нет пароля? Получите индивидуальный пароль через Tribute</b>
            <p style="margin:6px 0 14px">Пароль генерируется автоматически после внутренней оплаты цифрового товара через <b>Tribute API</b>. Один пароль привязывается к одному человеку.</p>
            <button class="button light small" type="button" id="toggle-tribute-box" style="width:100%">КУПИТЬ ДОСТУП / ПОЛУЧИТЬ ПАРОЛЬ ЧЕРЕЗ TRIBUTE <span aria-hidden="true">↗</span></button>

            <form id="tribute-checkout-form" style="display:none;margin-top:16px;padding:18px;background:var(--paper-warm);border:1px solid var(--line-strong)" novalidate>
              <span class="meta" style="color:var(--red);display:block;margin-bottom:8px">ЗАГЛУШКА TRIBUTE API · ВНУТРЕННЯЯ ОПЛАТА ЦИФРОВОГО ТОВАРА</span>
              <p style="margin:0 0 12px;font-size:12.5px;color:var(--ink)">Товар: <strong>Contemporary Horeca Scene · 2026 Edition</strong><br>Демонстрационная заглушка: реальное списание не производится. В подключённой Tribute-версии после оплаты генерируется уникальный пароль (1 пароль = 1 человек).</p>
              <div class="field" style="margin-bottom:12px">
                <label for="tribute-name">Ваше имя</label>
                <input class="form-control" id="tribute-name" name="name" type="text" required placeholder="Иван Петров">
              </div>
              <div class="field" style="margin-bottom:12px">
                <label for="tribute-email">Email или Telegram (@username)</label>
                <input class="form-control" id="tribute-email" name="email" type="text" required placeholder="student@example.com или @username">
              </div>
              <button class="button small" type="submit" id="tribute-pay-btn" style="width:100%">ОПЛАТИТЬ ЧЕРЕЗ TRIBUTE И СГЕНЕРИРОВАТЬ ПАРОЛЬ <span aria-hidden="true">↗</span></button>
              <div id="tribute-result" style="display:none;margin-top:14px;padding:14px;background:#fff;border-left:3px solid var(--red)"></div>
            </form>
          </div>
        </div>
      </div>
      </div>

      <section class="gate-info" id="gate-info">
        <div class="gate-info-inner">
          <article class="gate-card">
            <span class="eyebrow">О КУРСЕ · ABOUT THE ELECTIVE</span>
            <h3>Десять модулей о том,<br>из чего <em>состоит</em> сцена.</h3>
            <p><b>Contemporary Horeca Scene</b> — живой цифровой электив Hotel Institute Montreux (2026 edition). Мы читаем индустрию как сцену: рейтинги и <b>World's 50 Best</b>, меню как редакционный артефакт, опыт гостя и нейрогастрономия, бокал и свет, технологии и ИИ, будущее F&amp;B, предпринимательство — и реальная реализация всего этого на небольшой бюджет.</p>
            <p>Финал — не эссе. Своя venue собирается руками: макет <b>1:20 / 1:50</b> из найденных предметов, винтажной посуды, свечей, текстиля и бумажного меню, защищённый вместе со сметой и сетом.</p>
            <div class="gate-facts">
              <div class="gate-fact"><strong>10</strong><span>Modules</span></div>
              <div class="gate-fact"><strong>13</strong><span>Learning units</span></div>
              <div class="gate-fact"><strong>12<i>+</i></strong><span>Weeks · suggested pace</span></div>
              <div class="gate-fact"><strong>01</strong><span>Physical mockup per student</span></div>
            </div>
            <ul class="gate-points">
              <li><b>01</b><span>Разборы заведений и людей, которые двигают сцену: 50 Best, MICHELIN, World Class, локальные проекты.</span></li>
              <li><b>02</b><span>Атмосфера как инструмент: свет, стекло, тактильность, хореография сервиса, «сказка», из которой гостя не будит мелочь.</span></li>
              <li><b>03</b><span>Бюджет и сценография: барахолки, salvage, реставрация, trompe-l'œil, золочение, бэкдроп и один узкий луч.</span></li>
              <li><b>04</b><span>Технологии, ИИ и операции: что автоматизировать, что обязательно оставить человеку.</span></li>
              <li><b>05</b><span>Практические задания и защита концепции; после проверки — сертификат.</span></li>
              <li><b>06</b><span>Пароль открывает весь курс сразу: все модули и уроки доступны без поштучной выдачи.</span></li>
            </ul>
          </article>

          <article class="gate-card gate-card-side">
            <figure class="gate-frame gate-frame-wide">
              <img src="presentation/assets/horeca-concept-pitch.jpg" alt="A concept pitch table with materials, sketches and models" loading="lazy">
              <figcaption>Final exercise · стол, на котором venue собирается до того, как её построили</figcaption>
            </figure>
            <p class="gate-note-line">Курс написал <b>Egor Tarasenko</b>. <button class="gate-author-link" type="button" data-author-open>Об авторе →</button></p>
            <p class="gate-note-line gate-note-mail">Вопросы по курсу, лицензированию и программе: <a href="mailto:egor.tarasenko@him-mail.ch">egor.tarasenko@him-mail.ch</a></p>
          </article>
        </div>
      </section>

      <footer class="gate-foot">
        <span>© 2026 Egor Tarasenko · Course content &amp; author IP</span>
        <span>Contemporary Horeca Scene · 2026 Edition</span>
        <span>Hotel Institute Montreux</span>
        <button class="gate-author-link" type="button" data-author-open>Об авторе</button>
      </footer>
    </main>`;
    root.querySelector('[data-scroll-info]')?.addEventListener('click', () => document.getElementById('gate-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    const field = document.getElementById('course-password');
    field?.focus({ preventScroll: true });
  }

  /* --- events ------------------------------------------------------------- */
  document.addEventListener('click', event => {
    const toggleBtn = event.target.closest('#toggle-tribute-box');
    if (toggleBtn) {
      const form = document.getElementById('tribute-checkout-form');
      if (form) {
        const show = form.style.display === 'none';
        form.style.display = show ? 'block' : 'none';
        if (show) document.getElementById('tribute-name')?.focus();
      }
      return;
    }
    const autoUseBtn = event.target.closest('[data-use-password]');
    if (autoUseBtn) {
      const code = autoUseBtn.dataset.usePassword;
      const input = document.getElementById('course-password');
      const gateForm = document.getElementById('gate-form');
      if (input && gateForm) {
        input.type = 'text';
        input.value = code;
        gateForm.requestSubmit();
      }
    }
  });

  document.addEventListener('submit', async event => {
    if (event.target.id === 'tribute-checkout-form') {
      event.preventDefault();
      const form = event.target;
      const btn = document.getElementById('tribute-pay-btn');
      const resBox = document.getElementById('tribute-result');
      const fd = new FormData(form);
      const name = String(fd.get('name') || '').trim() || 'Student';
      const rawContact = String(fd.get('email') || '').trim();
      const email = rawContact.includes('@') && !rawContact.startsWith('@')
        ? rawContact
        : `${rawContact.replace(/^@/, '') || 'student'}@tribute.user`;
      const telegram = rawContact.startsWith('@') ? rawContact : '';

      if (btn) { btn.disabled = true; btn.textContent = 'ОБРАБОТКА ОПЛАТЫ TRIBUTE…'; }
      try {
        const resp = await fetch('/api/tribute/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name,
            email,
            telegram,
            clientId: getClientId(),
            telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id ? String(window.Telegram.WebApp.initDataUnsafe.user.id) : null,
          }),
        });
        const data = await resp.json();
        if (resp.ok && data.password) {
          if (resBox) {
            resBox.style.display = 'block';
            resBox.innerHTML = `
              <span class="meta" style="color:var(--red)">ОПЛАТА ПРОШЛА · ВАШ ЛИЧНЫЙ ПАРОЛЬ (1 ЧЕЛОВЕК)</span>
              <div style="font:600 20px var(--mono);margin:8px 0;letter-spacing:.08em">${data.password}</div>
              <p style="margin:0 0 10px;font-size:12px;color:var(--muted)">Пароль привязан к вашему профилю (${name}). Сохраните его.</p>
              <button type="button" class="button small" data-use-password="${data.password}" style="width:100%">ВОЙТИ В КУРС С ЭТИМ ПАРОЛЕМ ↗</button>
            `;
          }
          const passInput = document.getElementById('course-password');
          if (passInput) { passInput.type = 'text'; passInput.value = data.password; }
          toast(`ПАРОЛЬ СГЕНЕРИРОВАН: ${data.password}`);
        } else {
          throw new Error(data.error || 'Tribute stub error');
        }
      } catch (error) {
        if (resBox) {
          resBox.style.display = 'block';
          resBox.textContent = error.message || 'Сервис Tribute временно недоступен. Напишите egor.tarasenko@him-mail.ch.';
        }
      } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = 'ОПЛАТИТЬ ЧЕРЕЗ TRIBUTE И СГЕНЕРИРОВАТЬ ПАРОЛЬ <span aria-hidden="true">↗</span>'; }
      }
      return;
    }

    if (event.target.id !== 'gate-form') return;
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type=submit]');
    const error = document.getElementById('gate-error');
    const password = String(new FormData(form).get('password') || '').trim();
    if (!password) {
      error.textContent = 'Введите ваш персональный пароль из Tribute или пароль администратора.';
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      return;
    }
    if (button) { button.disabled = true; button.textContent = 'ПРОВЕРКА ДОСТУПА…'; }
    error.textContent = '';
    const result = await apiUnlock(password);
    if (result.state === 'granted') { await unlock(); return; }
    if (result.state === 'unsupported' && await verifyLocal(password)) {
      ensureDefaultUser();
      await unlock();
      return;
    }
    if (button) { button.disabled = false; button.innerHTML = 'OPEN THE COURSE / ВОЙТИ В КУРС <span aria-hidden="true">↗</span>'; }
    error.textContent = result.error || (result.state === 'denied' || result.state === 'unsupported'
      ? 'Неверный пароль. Проверьте символы или получите личный пароль через Tribute ниже.'
      : 'Не удалось проверить доступ. Попробуйте ещё раз.');
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
    if (status.state === 'unsupported') {
      let remembered = false;
      try { remembered = localStorage.getItem(FLAG) === '1'; } catch { remembered = false; }
      if (remembered) { await unlock(true); return; }
    }
    renderGate();
  })();
})();
