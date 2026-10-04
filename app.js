/* ============================================================================
   CONTEMPORARY HORECA SCENE — views & interaction layer
   Booted by access.js after course access; all lessons are immediately available.
   Content lives in course-data.js; this file only renders it.
   ========================================================================== */
window.bootCourse = () => {
  const C = window.COURSE;
  const tg = window.Telegram?.WebApp;
  const ASSET = 'presentation/assets/';
  const app = document.getElementById('app');
  const stateKey = 'chs-platform-v1';

  const seedState = () => ({
    institutions: [{ id: 'him-001', name: 'Hotel Institute Montreux' }],
    editions: [{ id: 'contemporary-horeca-scene-2026', courseId: C.id, year: C.edition, status: 'ACTIVE' }],
    licenses: [{ id: 'license-him-2026', institutionId: 'him-001', editionId: 'contemporary-horeca-scene-2026', startDate: '2026-09-01', endDate: '2027-08-31', studentLimit: 100, status: 'ACTIVE' }],
    enrollments: [], progress: {}, submissions: [], quizzes: {}, licenseActive: true,
  });
  const getState = () => { try { return { ...seedState(), ...(JSON.parse(localStorage.getItem(stateKey)) || {}) }; } catch { return seedState(); } };
  const tokenHeaders = () => { const t = localStorage.getItem('chs-access-token'); return t ? { 'X-Access-Token': t } : {}; };
  const adoptServerData = data => { state = getState(); state.submissions = data.submissions || []; state.progress = { ...state.progress, ...(data.progress || {}) }; state.serverStudents = data.students || []; state.tribute = data.tribute || {}; state.editor = data.editor || { materials: [], posts: [], overrides: [] }; state.adminBot = data.adminBot || {}; state.myPurchase = data.myPurchase || null; applyContentOverrides(state.editor.overrides); saveState(state); };
  const liveSignatureOf = data => JSON.stringify([data.editor || null, data.tribute || null, data.students || null]);
  let liveSignature = '';
  const syncServerState = async () => { try { const response = await fetch('/api/state', { headers: tokenHeaders() }); if (!response.ok) return; const data = await response.json(); adoptServerData(data); liveSignature = liveSignatureOf(data); } catch { /* local/offline preview */ } };
  const saveState = s => localStorage.setItem(stateKey, JSON.stringify(s));
  const ensureEnrollment = profile => { if (profile.role !== 'STUDENT') return; const s = getState(); if (!s.enrollments.some(x => x.studentEmail === profile.email && x.courseId === C.id && x.edition === C.edition)) { s.enrollments.push({ id: `enrol-${Date.now()}`, studentEmail: profile.email, institutionId: profile.institutionId || 'him-001', courseId: C.id, edition: C.edition, status: 'ACTIVE', startedAt: new Date().toISOString() }); saveState(s); } };

  let state = getState();
  let toastTimer;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const user = () => { try { return JSON.parse(sessionStorage.getItem('chs-user')); } catch { return null; } };
  const key = () => `${user()?.email || 'guest'}:${C.id}:${C.edition}`;
  const progressFor = () => state.progress[key()] || [];
  const buildAllLessons = () => C.modules.flatMap(m => m.lessons.map(l => ({ ...l, module: m, thumbnail: l.thumbnail || m.image, videoUrl: l.videoUrl || null })));
  let allLessons = buildAllLessons();

  /* The admin bot edits course copy server-side; overrides are applied on top of course-data.js. */
  const overrideOriginals = new Map();
  function applyContentOverrides(overrides = []) {
    for (const record of overrideOriginals.values()) record.target[record.field] = record.original;
    overrideOriginals.clear();
    for (const override of overrides || []) {
      const module = override.scope === 'module'
        ? C.modules.find(m => m.id === override.targetId)
        : C.modules.find(m => m.lessons.some(l => l.id === override.targetId));
      const target = override.scope === 'module'
        ? module
        : module?.lessons.find(l => l.id === override.targetId);
      if (!target || typeof override.text !== 'string' || !(override.field in target)) continue;
      const key = `${override.scope}:${override.targetId}:${override.field}`;
      if (!overrideOriginals.has(key)) overrideOriginals.set(key, { target, field: override.field, original: target[override.field] });
      target[override.field] = override.text;
    }
    allLessons = buildAllLessons();
  }
  const editorState = () => state.editor || { materials: [], posts: [], overrides: [] };
  const materialsFor = moduleId => editorState().materials.filter(item => item.moduleId === moduleId);
  const linkHost = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; } };
  applyContentOverrides(editorState().overrides);
  const completeCount = () => progressFor().length;
  const pct = () => Math.round(completeCount() / allLessons.length * 100);
  const certificateReady = () => pct() === 100 && state.submissions.some(s => s.student === user()?.email && s.courseId === C.id && s.edition === C.edition && s.status === 'APPROVED');
  const initials = name => (name || 'CHS').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
  const route = () => { const raw = location.hash.replace(/^#\/?/, ''); return raw ? raw.split('?')[0].split('/') : ['']; };
  const go = path => { location.hash = '/' + path.replace(/^\//, ''); };
  const word = count => `${count} LEARNING UNIT${count === 1 ? '' : 'S'}`;

  function syncTelegramNavigation() { if (!tg?.BackButton) return; const [page] = route(); if (page && page !== 'dashboard') tg.BackButton.show(); else tg.BackButton.hide(); }

  if (tg) {
    tg.ready(); tg.expand();
    document.documentElement.classList.add('telegram-webapp');
    tg.setHeaderColor?.('#ffffff'); tg.setBackgroundColor?.('#ffffff');
    const syncViewport = () => document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportHeight || window.innerHeight}px`);
    syncViewport(); tg.onEvent?.('viewportChanged', syncViewport);
    tg.BackButton?.onClick(() => {
      const [page, sub] = route();
      if (page === 'lesson') go(`module/${sub}`);
      else if (page === 'review') go('instructor');
      else if (page === 'login') go('');
      else if (page === 'module') go('course');
      else if (page === 'dashboard' || !page) tg.close?.();
      else if (page === 'project') go('projects');
      else if (['course', 'cases', 'projects', 'progress', 'profile', 'updates', 'assignment', 'quiz', 'certificate', 'search'].includes(page)) go(user()?.role === 'INSTRUCTOR' ? 'instructor' : user()?.role === 'ADMIN' ? 'admin' : 'dashboard');
      else tg.close?.();
    });
  }

  const IMAGE_FALLBACK = 'project-detail-backbar.jpg';
  const image = (name, alt = '', cls = '') => `<img class="${cls}" src="${ASSET}${esc(name)}" alt="${esc(alt)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ASSET}${IMAGE_FALLBACK}';this.classList.add('image-fallback')">`;
  const creditGroup = name => (C.imageCredits?.files || []).find(x => x.file === name) || (C.imageCredits?.groups || []).find(g => (g.prefix || []).some(p => (p.endsWith('-') ? name.startsWith(p) : name === p)));
  const isIllustrative = name => (C.imageCredits?.illustrative || []).some(x => x.file === name);
  const creditFor = name => `<span class="img-credit">${esc(isIllustrative(name) ? 'ILLUSTRATIVE PHOTO · AUTHOR’S ARCHIVE · NOT THE VENUE' : creditGroup(name)?.short || 'PHOTO · SOURCE LISTED IN IMAGE SOURCES')}</span>`;
  const button = (label, path, cls = '') => `<a class="button ${cls}" href="#/${path}">${label}<span aria-hidden="true">↗</span></a>`;
  const projectList = () => C.projects?.items || [];
  const projectById = id => projectList().find(x => x.id === id);
  const projectPhotos = p => p?.photos || [];
  const captionFor = file => {
    const photo = projectList().flatMap(p => projectPhotos(p)).find(ph => ph.file === file);
    return photo?.caption || '';
  };
  const zoomable = (file, alt, caption = '') => `<figure class="gallery-item" data-action="lightbox" data-src="${ASSET}${esc(file)}" data-caption="${esc(caption)}" tabindex="0" role="button" aria-label="Enlarge: ${esc(alt)}">
        <img src="${ASSET}${esc(file)}" alt="${esc(alt)}" loading="lazy">
        ${caption ? `<figcaption><span>${esc(caption)}</span></figcaption>` : ''}
      </figure>`;
  const moduleProgress = m => Math.round(m.lessons.filter(l => progressFor().includes(l.id)).length / m.lessons.length * 100);
  const nextLesson = () => allLessons.find(x => !progressFor().includes(x.id)) || allLessons[0];

  const brandBlock = href => `<a class="brand" href="${href}"><span class="brand-mark" aria-hidden="true">CHS</span><span class="brand-text"><strong>Contemporary Horeca Scene</strong><small>${C.edition} Edition · Digital elective</small></span></a>`;

  const header = (publicPage = false) => {
    const u = user();
    if (publicPage) {
      const home = u?.role === 'INSTRUCTOR' ? 'instructor' : u?.role === 'ADMIN' ? 'admin' : 'dashboard';
      return `<header class="site-header">${brandBlock('#/')}<nav class="nav" aria-label="Main navigation">
        <a class="nav-link" href="#/" data-scroll="explore">THE ELECTIVE</a>
        <a class="nav-link" href="#/" data-scroll="cases">CASES</a>
        <a class="nav-link" href="#/" data-scroll="budget">BUDGET &amp; SCENOGRAPHY</a>
        <button class="nav-link" type="button" data-author-open>ABOUT THE AUTHOR</button>
        <a class="button small" href="#/${home}">YOUR LEARNING SPACE <span aria-hidden="true">↗</span></a>
      </nav></header>`;
    }
    const role = u?.role;
    const home = role === 'INSTRUCTOR' ? 'instructor' : role === 'ADMIN' ? 'admin' : 'dashboard';
    const links = role === 'INSTRUCTOR' ? [['Overview', 'instructor'], ['Submissions', 'instructor'], ['Cases & figures', 'cases']]
      : role === 'ADMIN' ? [['Admin Panel', 'admin'], ['Course', 'course'], ['Cases & figures', 'cases']]
        : [['Home', 'dashboard'], ['Course', 'course'], ['Cases & figures', 'cases'], ['Progress', 'progress']];
    return `<header class="app-header">${brandBlock(`#/${home}`)}<nav class="app-nav" aria-label="Application navigation">${links.map(([t, p]) => `<a href="#/${p}">${t}</a>`).join('')}<button data-action="search">SEARCH ⌕</button></nav><div class="user-chip"><span>${esc(u?.name || 'Guest')}</span><span class="avatar">${initials(u?.name)}</span><button class="nav-link author-nav-link" type="button" data-author-open aria-label="About the author" title="About the author">ABOUT THE AUTHOR</button><button class="nav-link" data-action="profile">PROFILE</button>${role !== 'STUDENT' ? '<button class="nav-link" data-action="logout">SIGN OUT</button>' : ''}</div></header>`;
  };

  const bottomNav = () => {
    const role = user()?.role;
    const links = role === 'INSTRUCTOR' ? [['Overview', 'instructor', '⌂'], ['Submissions', 'instructor', '▤'], ['Cases', 'cases', '▧'], ['Search', 'search', '⌕'], ['Profile', 'profile', '◯']]
      : role === 'ADMIN' ? [['Admin', 'admin', '⌂'], ['Course', 'course', '▤'], ['Cases', 'cases', '▧'], ['Search', 'search', '⌕'], ['Profile', 'profile', '◯']]
        : [['Home', 'dashboard', '⌂'], ['Course', 'course', '▤'], ['Cases', 'cases', '▧'], ['Progress', 'progress', '◌'], ['Search', 'search', '⌕']];
    return `<nav class="mobile-bottom" aria-label="Mobile navigation">${links.map(([t, p, i]) => p === 'search' ? `<button data-action="search"><span>${i}</span>${t}</button>` : `<a href="#/${p}"${route()[0] === p ? ' class="active"' : ''}><span>${i}</span>${t}</a>`).join('')}</nav>`;
  };

  const layout = (content, publicPage = false) => `${publicPage ? header(true) : header()}${content}${publicPage
    ? `<footer class="footer"><span>© ${new Date().getFullYear()} Egor Tarasenko · Course content &amp; author IP</span><span>Contemporary Horeca Scene · ${C.edition} Edition</span><span>${esc(C.institution)}</span><a class="footer-link" href="#/credits">Image sources &amp; rights</a><button class="footer-link" type="button" data-author-open>About the author</button></footer>`
    : bottomNav()}`;

  /* ---------------------------------------------------------------- landing */
  function landing() {
    const tickerItems = ['Bar Leone · Hong Kong', 'Joi Espresso Bar · opened 2025', 'Passie Cakes Co. · props as branding', 'CooCoo · coffee, croffles, cookies', 'Chicken Connection · Moscow', 'Pacific · bar solutions', 'Sips · Barcelona', 'Himkok · Oslo', 'Krasota · gastro-theatre', '50 Best · Lima 2026', 'MICHELIN · Tokyo 2026', 'World Class · Toronto', 'Neurogastronomy lab', 'Found-object mockups · 1:20'];
    return layout(`<main>
      <section class="hero">
        <span class="hero-index">${C.edition} EDITION · 01 / ${String(C.modules.length).padStart(2, '0')}</span>
        <div class="hero-copy">
          <span class="eyebrow">A LIVING DIGITAL ELECTIVE · ${C.edition} EDITION</span>
          <h1><span>CONTEMPORARY</span><span><em>Horeca</em> SCENE</span></h1>
          <p>${C.modules.length} modules on the venues, ideas, techniques and budgets shaping the contemporary horeca scene — and a final challenge that ends with your own concept built by hand, as a mockup, like stage scenery.</p>
          <div class="hero-actions">
            <a class="button" href="#/course">EXPLORE THE COURSE <span aria-hidden="true">↗</span></a>
            <a class="button text" href="#/dashboard">YOUR LEARNING SPACE <span aria-hidden="true">→</span></a>
          </div>
          <p class="hero-credit"><span class="meta">CREATED BY</span> ${esc(C.author)} · ${esc(C.institution)} <span class="meta">FORMAT</span> ${C.modules.length} modules · ${allLessons.length} learning units · ${C.cases.length} case files</p>
        </div>
        <figure class="hero-media">
          <img src="${ASSET}web-insider-hall.jpg" alt="A contemporary bar hall: rammed-earth walls, a sculpted ceiling and a central laboratory bar station">
          <figcaption><span class="meta">ON THE SCENE</span><span>Light, glass and the room around it — the subject of the elective, photographed at the scale a guest actually sees it.</span></figcaption>
        </figure>
      </section>

      <div class="key-figures">
        <div class="key-figure"><strong>${String(C.modules.length).padStart(2, '0')}</strong><span>Modules</span></div>
        <div class="key-figure"><strong>${allLessons.length}</strong><span>Learning units</span></div>
        <div class="key-figure"><strong>12<i>+</i></strong><span>Weeks · suggested pace</span></div>
        <div class="key-figure"><strong>01</strong><span>Physical mockup per student</span></div>
      </div>

      <div class="intro-strip">
        <span class="eyebrow tight">ON THE SCENE</span>
        <strong>The industry moves faster than any <em>syllabus</em>.</strong>
        <div class="ticker" aria-hidden="true"><div class="ticker-track">${[...tickerItems, ...tickerItems].map(x => `<span>${x}</span>`).join('')}</div></div>
      </div>

      <section class="section" id="why">
        <div class="section-head">
          <div><span class="eyebrow">01 — WHY THIS ELECTIVE</span><h2>Hospitality is<br>always <em>becoming</em>.</h2></div>
          <p>Traditional education cannot update itself at the pace of the industry. This elective brings current thinking, live cases, emerging tools and real budgets into one evolving learning experience.</p>
        </div>
        <div class="why-grid">
          <div class="why-big">The next generation of hospitality will be shaped by the way we connect <em>people, place and possibility</em> — and by what we can afford to build.</div>
          <div class="why-note">
            <p>Explore the intersection of hospitality, design, neuroscience, food &amp; beverage, technology, AI and entrepreneurship — then price it, source it and build it.</p>
            <span class="meta">Learn from the industry · Think beyond the obvious</span>
          </div>
        </div>
      </section>

      <section class="section" id="explore">
        <div class="section-head">
          <div><span class="eyebrow">02 — WHAT YOU WILL EXPLORE</span><h2>Ideas with an<br>industry <em>edge</em>.</h2></div>
          <p>${C.modules.length} connected modules. A point of view on the forces reshaping hospitality — and the space to develop your own.</p>
        </div>
        <div class="discipline-grid">${C.modules.slice(0, 9).map((m, i) => `<a class="discipline" href="#/module/${m.id}"><span class="number">${String(i + 1).padStart(2, '0')}</span><h3>${esc(m.title)}</h3></a>`).join('')}</div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">03 — HOW IT WORKS</span><h2>From insight<br>to <em>intention</em>.</h2></div>
          <p>A considered learning journey: absorb an idea, test it against the industry, apply it to a concept of your own — then build that concept with your hands.</p>
        </div>
        <div class="steps">${[['01', 'Learn', 'Ideas, principles and new perspectives.'], ['02', 'Explore', 'Real industry cases and references.'], ['03', 'Apply', 'Connect thinking to your own concept.'], ['04', 'Source', 'Find it second-hand, reuse it, build it yourself.'], ['05', 'Build', 'Stage a live found-object mockup with tableware, candles, glassware and a menu artefact.'], ['06', 'Pitch', 'Defend the concept, the budget and the set.']].map(a => `<div class="step"><span class="number">${a[0]}</span><h3>${a[1]}</h3><p>${a[2]}</p></div>`).join('')}</div>
      </section>

      <section class="section" id="cases">
        <div class="section-head">
          <div><span class="eyebrow">04 — REAL INDUSTRY CASES</span><h2>Look closer.<br>Learn from <em>practice</em>.</h2></div>
          <p>Editorial case files turn current hospitality practice into material for discussion, analysis and action.</p>
        </div>
        <div class="case-feature">${image(C.cases[0].image, 'A considered bar interior with a warm, tactile atmosphere')}<div class="case-feature-copy"><span class="eyebrow">CASE FILE · ${esc(C.cases[0].location)}</span><h3>${esc(C.cases[0].title)}</h3><p>${esc(C.cases[0].why)}</p><a href="#/cases" class="button text">EXPLORE THE CASES <span aria-hidden="true">→</span></a>${creditFor(C.cases[0].image)}</div></div>
        <div class="case-list">${C.cases.slice(1).map(x => `<article class="case-item"><div class="shot">${image(x.image, x.title)}</div>${creditFor(x.image)}<span class="meta">${esc(x.location)} · ${esc(x.industry)}</span><h3>${esc(x.title)}</h3><p>${esc(x.takeaway)}</p></article>`).join('')}</div>
      </section>

      <div class="quote-band">
        <div class="quote-band-inner">
          <div><span class="eyebrow">THE PRINCIPLE</span><p>A bar or a restaurant is a sweet fairy tale. For two hours the guest agrees to believe in a world you built — and any small detail can instantly wake them from that dream.</p></div>
          <blockquote>One harsh light, one plastic tray, one visible printer — and the <b>fairy tale</b> ends.<br>Design is the discipline of keeping the guest inside the story.</blockquote>
        </div>
      </div>

      <section class="section" id="budget">
        <div class="section-head">
          <div><span class="eyebrow">05 — BUDGET REALISATION &amp; SCENOGRAPHY</span><h2>You do not need<br>a fortune to open<br>something with <em>soul</em>.</h2></div>
          <p>Module ${C.modules.find(m => m.id === 'budget')?.number || '09'} of the edition: found objects, theatrical decorative techniques borrowed from the stage — and a live physical mockup assembled from real objects.</p>
        </div>
        <div class="budget-split">
          <div class="budget-copy">
            <h3>Soul before <em>budget</em></h3>
            <p>Some of the most convincing rooms in the world were assembled rather than constructed. Joi Espresso Bar — the author's own project — was built almost entirely from the street and flea markets: furniture, fixtures, equipment and objects other people had already discarded, adjusted by hand until the room held together as one story.</p>
            <p>The constraint became the character. Money buys speed and finish; intention buys soul.</p>
            <ul class="budget-list">
              <li><b>01</b><span>Write the feeling first, then hunt for it: flea markets, auctions, demolition yards, liquidations, the street.</span></li>
              <li><b>02</b><span>Borrow from the theatre: painted flats, forced perspective, backdrops, scrim, haze and one tight beam of light.</span></li>
              <li><b>03</b><span>Trompe-l'œil, glazing, patina, stencil, gold leaf and re-upholstery imitate expensive materials for almost nothing.</span></li>
              <li><b>04</b><span>A theatrical trick must support the story and never announce itself — otherwise the fairy tale ends.</span></li>
            </ul>
            <div class="budget-frames">
              <figure class="budget-frame">
                <img src="${ASSET}project-joi-machine.jpg" alt="A reconditioned brass lever espresso machine on a small counter" loading="lazy">
                <figcaption><span class="meta">Joi · 2025</span>The one object worth paying for: a reconditioned brass lever machine, bought second-hand.</figcaption>
              </figure>
              <figure class="budget-frame">
                <img src="${ASSET}project-detail-street-press.jpg" alt="A lemon press left on the pavement among street finds" loading="lazy">
                <figcaption><span class="meta">Street find</span>A lemon press picked up on the pavement — cheap detail, real patina.</figcaption>
              </figure>
            </div>
            <a class="button text" href="#/course" style="margin-top:24px">OPEN MODULE ${C.modules.find(m => m.id === 'budget')?.number || '09'} <span aria-hidden="true">→</span></a>
          </div>
          <div class="mockup-card">
            <span class="stamp">Final exercise</span>
            <span class="eyebrow">THE LIVE FOUND-OBJECT MOCKUP</span>
            <div class="shot">${image('project-detail-chess.jpg', 'A found-object study table with textures and props')}${creditFor('project-detail-chess.jpg')}</div>
            <h4>Build your venue as a set, not a plan.</h4>
            <p>Assemble it directly from what you find: antique tableware, candles, vintage glassware, fabric, wood, bottles, found textures and props, plus a physical menu concept. Work at 1:20 or 1:50; arrange the objects to show the entrance, first sightline, light and three details that carry the atmosphere. Photograph it at guest height.</p>
            <span class="meta">EVERY STUDENT · MODULE ${C.modules.find(m => m.id === 'budget')?.number || '09'} → FINAL CHALLENGE</span>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">06 — COURSE STRUCTURE</span><h2>${C.modules.length} modules.<br>One connected <em>journey</em>.</h2></div>
          <p>Move from the signals shaping the industry to a final concept grounded in your own point of view — and a mockup you can hold.</p>
        </div>
        <div class="module-preview">${C.modules.map(m => `<a class="module-row" href="#/module/${m.id}"><span class="module-num">${m.number}</span><div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p></div><span class="meta module-meta">${word(m.lessons.length)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div>
      </section>

      <section class="section flush">
        <div class="final-banner">
          <div><span class="eyebrow">THE FINAL PROJECT</span><h2 class="page-title">Design the hospitality concept of <em>tomorrow</em> — then stage it with found objects.</h2></div>
          <div>
            <p>Imagine you are opening a venue for 2030. Define its audience, experience, space, food &amp; beverage, technology, sourcing plan, business model and visual direction — then present a live found-object mockup using antique tableware, candles, vintage glassware, found textures and a physical menu concept.</p>
            <a class="button" href="#/course">VIEW THE ELECTIVE <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <section class="cta-band">
        <h2>Stay curious about what comes next.</h2>
        <a class="button" href="#/dashboard">GO TO YOUR LEARNING SPACE <span aria-hidden="true">↗</span></a>
      </section>
    </main>`, true);
  }

  /* -------------------------------------------------------------- dashboard */
  function dashboard() {
    const u = user();
    const next = nextLesson();
    const submission = state.submissions.filter(s => s.student === u.email && s.courseId === C.id && s.edition === C.edition).at(-1);
    const fb = submission?.feedback;
    return layout(`<main class="app-main">
      <div class="welcome">
        <div><span class="eyebrow">YOUR LEARNING SPACE · ${C.edition} EDITION</span><h1>Welcome back,<br><em>${esc((u.name.split(' ')[0] || 'Student'))}</em>.</h1><p>A considered journey through the contemporary horeca scene — and the venue you will build at the end of it.</p></div>
        <span class="edition-tag meta">${esc(C.institution)} · ${C.edition}</span>
      </div>
      <div class="dashboard-grid">
        <section class="resume-panel">
          <div class="resume-copy">
            <span class="eyebrow">CONTINUE YOUR ELECTIVE</span>
            <h2>${esc(next.module.title)}</h2>
            <p>${esc(next.title)} · ${next.duration}</p>
            <div class="progress-ring" aria-label="${pct()} percent course progress"><span>${pct()}%<small>COMPLETE</small></span></div>
            ${button(progressFor().includes(next.id) ? 'REVISIT LESSON' : 'CONTINUE LEARNING', `lesson/${next.module.id}/${next.id}`, 'small')}
          </div>
          ${image(next.module.image, next.module.title, 'resume-image')}
        </section>
        <aside class="side-stats">
          <div class="stat-panel"><span class="meta">COURSE PROGRESS</span><strong>${pct()}%</strong><div class="bar"><span style="width:${pct()}%"></span></div></div>
          <div class="stat-panel"><span class="meta">LESSONS COMPLETED</span><strong>${completeCount()} <small style="font:400 14px var(--ui);color:var(--muted)">/ ${allLessons.length}</small></strong><p>${C.edition} edition</p></div>
          <div class="stat-panel"><span class="meta">CURRENT MODULE</span><strong style="font-size:22px">${next.module.number} <span class="serif">${esc(next.module.title)}</span></strong><p>${next.module.lessons[0].duration} · next lesson</p></div>
        </aside>
      </div>
      <div class="dash-lower">
        <section class="dash-section">
          <h2>YOUR COURSE</h2>
          <div class="simple-list">${C.modules.slice(0, 5).map(m => `<a class="simple-row" href="#/module/${m.id}"><span><span class="meta">MODULE ${m.number}</span><br><strong>${esc(m.title)}</strong></span><span class="meta">${moduleProgress(m)}% →</span></a>`).join('')}</div>
          <a class="button text" href="#/course">VIEW ALL MODULES <span aria-hidden="true">→</span></a>
        </section>
        <section class="dash-section">
          <h2>RECENT FEEDBACK</h2>
          ${fb ? `<div class="simple-list"><div class="simple-row"><span><span class="meta">${esc(submission.assignment)} · ${esc(fb.status || 'REVIEWED')}</span><br><strong>${esc(fb.text || 'Your work has been reviewed.')}</strong></span></div></div><a class="button text" href="#/assignment">VIEW SUBMISSION <span aria-hidden="true">→</span></a>`
            : `<div class="empty"><span class="eyebrow">NO FEEDBACK YET</span><p>Your instructor's notes will appear here after your work has been reviewed.</p></div>`}
        </section>
      </div>
      <section class="dash-section" style="margin-top:42px">
        <div class="simple-row"><span><span class="meta">WHAT'S NEW · SEPTEMBER 2026</span><br><strong>Module 09 — Budget Realisation &amp; Scenography: found objects, theatrical techniques and the final live found-object mockup.</strong></span><a class="button text" href="#/updates">VIEW UPDATES →</a></div>
        <div class="simple-row"><span><span class="meta">ABOUT THE AUTHOR · SELECTED PROJECTS</span><br><strong>Explore the author’s practice, hospitality experience and project photographs together in one place.</strong></span><button class="button text" type="button" data-author-open>ABOUT THE AUTHOR →</button></div>
      </section>
      <div class="dash-lower">
        <section class="dash-section">
          <h2>FINAL PROJECT</h2>
          <div class="empty"><span class="eyebrow">${pct() === 100 ? 'READY TO SHARE' : 'YOUR FINAL CHALLENGE'}</span><p>Design the hospitality concept of tomorrow — and present the physical mockup you built from antique tableware, candles, vintage glassware, found textures and light.</p><a class="button text" href="#/assignment">OPEN THE BRIEF →</a></div>
        </section>
        <section class="dash-section">
          <h2>COURSE STATUS</h2>
          <div class="simple-list">
            <div class="simple-row"><span class="meta">EDITION</span><strong>${C.edition} · ACTIVE</strong></div>
            <div class="simple-row"><span class="meta">INSTITUTION</span><strong>${esc(C.institution)}</strong></div>
            <div class="simple-row"><span class="meta">CERTIFICATE</span><strong>${certificateReady() ? '<a href="#/certificate">READY TO ISSUE ↗</a>' : 'FINAL REVIEW PENDING'}</strong></div>
          </div>
        </section>
      </div>
    </main>`);
  }

  /* ------------------------------------------------------------------ course */
  function coursePage() {
    const next = nextLesson();
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">THE DIGITAL ELECTIVE · ${C.edition} EDITION</span><h1 class="page-title">Contemporary<br><em>Horeca</em> Scene</h1><p>${esc(C.descriptor)}</p>
          <div class="course-meta">
            <div><strong>${C.modules.length}</strong><span>Modules</span></div>
            <div><strong>${allLessons.length}</strong><span>Learning units</span></div>
            <div><strong>12 weeks</strong><span>Suggested pace</span></div>
            <div><strong>${pct()}%</strong><span>Completed</span></div>
            <div><strong>English</strong><span>Language</span></div>
          </div>
        </div>
        ${button('CONTINUE', `lesson/${next.module.id}/${next.id}`)}
      </div>
      <div class="section-head">
        <div><span class="eyebrow">YOUR LEARNING JOURNEY</span><h2 style="font-size:clamp(30px,4vw,50px)">Explore the <em>modules</em>.</h2></div>
        <p>Move at your own pace. Each module brings together a focused lesson, an industry case and a challenge to apply your thinking.</p>
      </div>
      <div class="app-module-list">${C.modules.map(m => `<a class="app-module" href="#/module/${m.id}"><span class="module-num">${m.number}</span><div><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p></div><div class="progress-holder"><div class="bar"><span style="width:${moduleProgress(m)}%"></span></div></div><span class="progress-cell">${moduleProgress(m)}% · ${word(m.lessons.length)}</span><span aria-hidden="true">↗</span></a>`).join('')}</div>
    </main>`);
  }

  function modulePage(id) {
    const m = C.modules.find(x => x.id === id);
    if (!m) return notFound();
    const l = m.lessons[0];
    const materials = materialsFor(m.id);
    return layout(`<main class="app-main">
      <div class="crumb"><a href="#/course">THE ELECTIVE</a> <span>/</span> <span>MODULE ${m.number}</span></div>
      <div class="module-detail">
        <div>
          <span class="eyebrow">MODULE ${m.number} · ${moduleProgress(m)}% COMPLETE</span>
          <h2>${esc(m.title)}</h2>
          <p>${esc(m.description)}</p>
          <div class="bar" style="max-width:360px;margin:20px 0"><span style="width:${moduleProgress(m)}%"></span></div>
          <span class="meta">${word(m.lessons.length)} · ${l.duration}</span>
          <div class="lesson-list">${m.lessons.map(x => `<a class="lesson-link" href="#/lesson/${m.id}/${x.id}"><span class="meta">${progressFor().includes(x.id) ? '<span class="done">✓</span>' : '→'}</span><strong>${esc(x.title)}</strong><span class="meta">${x.duration}</span></a>`).join('')}</div>
          <div class="case-inline"><span class="meta">INDUSTRY CASE</span><h3>${esc(l.case)}</h3><p>Examine the choices behind the experience, and what they reveal about contemporary hospitality.</p><a class="button text" href="#/cases">OPEN CASE FILES →</a></div>
        </div>
        <div>
          <span class="eyebrow">LEARNING OBJECTIVES</span>
          <ul class="objective-list">${l.ideas.map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ul>
          <blockquote class="case-quote">“${esc(l.intro)}”</blockquote>
        </div>
      </div>
      ${materials.length ? `<section class="materials-block" aria-label="Additional materials for module ${m.number}">
        <span class="eyebrow">ADDITIONAL MATERIALS · MODULE ${m.number}</span>
        <div class="lesson-list">${materials.map(x => `<a class="lesson-link" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><span class="meta">↗</span><strong>${esc(x.note)}</strong><span class="meta">${esc(linkHost(x.url))}</span></a>`).join('')}</div>
      </section>` : ''}
      <div class="lesson-footer"><a class="button text" href="#/course">← ALL MODULES</a>${button('START MODULE', `lesson/${m.id}/${l.id}`)}</div>
    </main>`);
  }

  function lessonPage(mid, lid) {
    const m = C.modules.find(x => x.id === mid), l = m?.lessons.find(x => x.id === lid);
    if (!l) return notFound();
    const i = allLessons.findIndex(x => x.id === lid), next = allLessons[i + 1];
    const done = progressFor().includes(l.id);
    return layout(`<main class="app-main"><article class="lesson-layout">
      <div class="crumb"><a href="#/course">THE ELECTIVE</a> <span>/</span> <a href="#/module/${m.id}">MODULE ${m.number}</a> <span>/</span> <span>LESSON ${String(i + 1).padStart(2, '0')}</span></div>
      <div class="lesson-heading">
        <div><span class="eyebrow">MODULE ${m.number} · ${esc(m.title)}</span><h1>${esc(l.title)}</h1><p>${esc(l.intro)}</p></div>
        <div class="lesson-number"><span class="meta">LESSON ${String(i + 1).padStart(2, '0')}</span><br><span class="meta">${l.duration.toUpperCase()}</span></div>
      </div>
      <section class="video-frame" aria-label="Lesson media">
        <div>${l.videoUrl ? `<video controls playsinline preload="metadata" poster="${ASSET}${esc(l.thumbnail)}" src="${esc(l.videoUrl)}" data-video-lesson="${esc(l.id)}" aria-label="${esc(l.title)} lesson film"></video>` : image(l.thumbnail, `${l.title} visual`)}${creditFor(l.thumbnail)}</div>
        <div class="video-info">
          <span class="eyebrow">${l.videoUrl ? 'LESSON FILM' : 'EDITORIAL LESSON'} · ${l.duration.toUpperCase()}</span>
          <h2>${esc(l.title)}</h2>
          <p>${l.videoUrl ? 'Watch the lesson film, then explore the reading, case and challenge below.' : 'This edition’s lesson film is being prepared. Explore the editorial reading and key ideas below, then mark the lesson complete when you’re ready.'}</p>
          <div class="video-status"><span class="meta">${done ? 'LESSON COMPLETED' : l.videoUrl ? 'PLAY · PAUSE · FULLSCREEN' : 'READING · CASE · CHALLENGE'}</span></div>
        </div>
      </section>
      <div class="content-columns">
        <section>
          <span class="eyebrow">THE IDEA</span>
          <h2>Look beyond the surface.</h2>
          <p>${esc(l.body)}</p>
          <div class="case-inline"><span class="meta">CASE STUDY · ${esc(l.case)}</span><h3>Why this case matters</h3><p>Consider the relationship between a clear point of view and the details that make it tangible for guests and teams.</p><a class="button text" href="#/cases">EXPLORE CASE STUDIES →</a></div>
        </section>
        <aside>
          <span class="eyebrow">KEY IDEAS</span>
          <ul class="key-ideas">${l.ideas.map(x => `<li><span>${esc(x)}</span></li>`).join('')}</ul>
          <div class="case-inline"><span class="meta">READ MORE</span><p>Use the course case files and references as a starting point for your own investigation. Bring a specific observation to your next discussion.</p></div>
        </aside>
      </div>
      <section class="challenge-panel">
        <div><span class="eyebrow">YOUR CHALLENGE</span><p>${esc(l.challenge)}</p></div>
        <a href="#/assignment/${m.id}/${l.id}" class="button light">OPEN THE BRIEF <span aria-hidden="true">↗</span></a>
      </section>
      <div class="lesson-footer">
        <a class="button text" href="#/module/${m.id}">← MODULE ${m.number}</a>
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          ${done ? '<span class="status-pill">COMPLETED</span>' : `<button class="button light" data-action="complete" data-lesson="${l.id}">MARK AS COMPLETE <span aria-hidden="true">✓</span></button>`}
          ${next ? `<a href="#/lesson/${next.module.id}/${next.id}" class="button">NEXT LESSON <span aria-hidden="true">→</span></a>` : '<a href="#/certificate" class="button">FINISH THE ELECTIVE <span aria-hidden="true">→</span></a>'}
        </div>
      </div>
    </article></main>`);
  }

  /* ------------------------------------------------------------------- cases */
  function casesPage() {
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">INDUSTRY NOTEBOOK · ${C.edition} EDITION</span><h1 class="page-title">Real industry.<br>Useful <em>questions</em>.</h1><p>Case files connect hospitality practice to the ideas in this elective. Read closely, then decide what is relevant to the concept you want to build.</p></div>
        <button class="button light" data-action="search">SEARCH THE ELECTIVE <span aria-hidden="true">⌕</span></button>
      </div>
      <section class="section" id="industry-figures" style="padding:30px 0 10px">
        <span class="eyebrow">LEADING INDUSTRY FIGURES · MAPPED TO THE COURSE BLOCKS</span>
        <div class="figure-grid">${(C.figures || []).map(f => `
          <article class="case-item">
            ${f.image ? `<div class="shot">${image(f.image, f.name)}</div>${creditFor(f.image)}` : ''}
            <span class="meta">${esc(f.block)} · MODULE ${esc(f.moduleNumber)}</span>
            <h3>${esc(f.name)}</h3>
            <p>${esc(f.role)} · ${esc(f.venues)}</p>
            <p>${esc(f.summary)}</p>
            <p><strong>Course takeaway:</strong> ${esc(f.takeaway)}</p>
            ${f.sources?.length ? `<p class="figure-sources"><span class="meta">PRIMARY SOURCES</span> ${f.sources.map(source => `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a>`).join(' · ')}</p>` : ''}
          </article>`).join('')}
        </div>
      </section>
      <section class="section" style="padding:24px 0"><span class="eyebrow">WORLD’S 50 BEST · MENU CONCEPTS</span><div class="case-list"><article class="case-item"><h3>Rémy Savage · Little Red Door / Shapes / Bar Nouveau</h3><p>Art-manifesto menus: comic-book storytelling, Bauhaus geometry and Art Nouveau craft give guests a visual language for ordering.</p></article><article class="case-item"><h3>El Copitas · Igor Zernov</h3><p>A living chalkboard menu evolves with fresh batches and the intimate candle-lit ritual; menu and hospitality stay local and alive.</p></article><article class="case-item"><h3>Sips Drinkery House · Simone Caporale</h3><p>Drinkery House counterless bar: bespoke tactile vessels and 360-degree guest connection.</p></article><article class="case-item"><h3>Krasota Gastro-Theatre · Boris Zarkov</h3><p>Multisensory immersion: 360-degree projections and synchronized sound matching the culinary narrative.</p></article><article class="case-item"><h3>Bar Benfiddich · Hiroyasu Kayama</h3><p>Zero printed menu: the candle-lit apothecary, botanicals and conversation form a bespoke, guest-led menu.</p></article></div></section>
      <div id="case-files" style="margin-top:32px;display:grid;gap:26px">${C.cases.map((x, i) => `<article class="case-feature" style="grid-template-columns:${i % 2 ? '0.85fr 1.15fr' : '1.15fr .85fr'}">${i % 2
        ? `<div class="case-feature-copy"><span class="eyebrow">CASE FILE · ${esc(x.location)} · ${esc(x.year)}</span><h3>${esc(x.title)}</h3><span class="meta">${esc(x.industry)}</span><p><strong>Context</strong><br>${esc(x.context)}</p><p><strong>What happened</strong><br>${esc(x.what)}</p><p><strong>Why it matters</strong><br>${esc(x.why)}</p><p><strong>Key takeaway</strong><br>${esc(x.takeaway)}</p>${creditFor(x.image)}</div>${image(x.image, `${x.title} case image`)}`
        : `${image(x.image, `${x.title} case image`)}<div class="case-feature-copy"><span class="eyebrow">CASE FILE · ${esc(x.location)} · ${esc(x.year)}</span><h3>${esc(x.title)}</h3><span class="meta">${esc(x.industry)}</span><p><strong>Context</strong><br>${esc(x.context)}</p><p><strong>What happened</strong><br>${esc(x.what)}</p><p><strong>Why it matters</strong><br>${esc(x.why)}</p><p><strong>Key takeaway</strong><br>${esc(x.takeaway)}</p>${creditFor(x.image)}</div>`}</article>${(x.gallery || []).length > 1 ? `<div class="case-gallery">${x.gallery.map((f, gi) => zoomable(f, `${x.title} — photograph ${gi + 1}`, captionFor(f))).join('')}</div>` : ''}`).join('')}</div>
    </main>`);
  }

  /* ---------------------------------------------------------------- projects */
  function projectsPage() {
    const items = projectList();
    const totalPhotos = items.reduce((n, p) => n + projectPhotos(p).length, 0);
    return layout(`<main class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">${esc(C.projects?.eyebrow || 'PROJECTS OF THE AUTHOR')} · FIELD EVIDENCE</span>
          <h1 class="page-title">Built, repaired,<br><em>drawn</em>.</h1>
          <p>${esc(C.projects?.lead || '')}</p>
        </div>
        <button class="button light" data-action="search">SEARCH THE ELECTIVE <span aria-hidden="true">⌕</span></button>
      </div>
      <div class="course-meta">
        <div><strong>${items.length}</strong><span>Project files</span></div>
        <div><strong>${totalPhotos}</strong><span>Photographs</span></div>
        <div><strong>${items.filter(p => p.moduleId === 'budget').length}</strong><span>Mockup references</span></div>
        <div><strong>${items.reduce((n, p) => n + (p.facts?.length || 0), 0)}</strong><span>Documented facts</span></div>
      </div>
      <div class="project-grid">
        ${items.map(pr => `<a class="project-card" href="#/project/${esc(pr.id)}">
          <div class="project-shot">${image(pr.image, `${pr.name} — ${pr.role}`)}<span class="project-index">${esc(pr.index)}</span></div>${creditFor(pr.image)}
          <div class="project-card-copy">
            <span class="meta">${esc(pr.role)} · ${esc(pr.year)}</span>
            <h2>${esc(pr.name)}</h2>
            <p>${esc(pr.tagline)}</p>
            <span class="project-card-foot"><span class="meta">${projectPhotos(pr).length} PHOTOGRAPHS</span><span class="meta">MODULE ${esc(pr.moduleNumber)} ↗</span></span>
          </div>
        </a>`).join('')}
      </div>
      <section class="section" style="padding:44px 0 0;border-bottom:0">
        <span class="eyebrow tight">HOW TO READ THE ARCHIVE</span>
        <p class="form-help" style="max-width:76ch;font-size:13px">${esc(C.projects?.note || '')}</p>
      </section>
    </main>`);
  }

  function projectPage(id) {
    const items = projectList();
    const pr = projectById(id);
    if (!pr) return notFound();
    const position = items.indexOf(pr);
    const previous = items[(position - 1 + items.length) % items.length];
    const next = items[(position + 1) % items.length];
    const module = C.modules.find(m => m.id === pr.moduleId);
    const photos = projectPhotos(pr);
    return layout(`<main class="app-main">
      <a class="crumb" href="#/projects"><span class="meta">PROJECTS OF THE AUTHOR</span> <span aria-hidden="true">→</span> <span class="meta">INDEX</span></a>
      <div class="project-head">
        <div>
          <span class="eyebrow">PROJECT FILE ${esc(pr.index)} · ${esc(pr.role)} · ${esc(pr.year)}</span>
          <h1 class="page-title">${esc(pr.name)}</h1>
          <p class="project-tagline">${esc(pr.tagline)}</p>
        </div>
        <div class="project-facts">
          ${(pr.facts || []).map(f => `<div class="project-fact"><span class="meta">${esc(f[0])}</span><strong>${esc(f[1])}</strong></div>`).join('')}
        </div>
      </div>
      <div class="project-gallery project-gallery-lead">
        ${zoomable(photos[0]?.file || pr.image, `${pr.name} — lead photograph`, photos[0]?.caption || pr.tagline)}${creditFor(photos[0]?.file || pr.image)}
      </div>
      <div class="project-body">
        <p>${esc(pr.summary)}</p>
      </div>
      <section style="margin-top:clamp(30px,4vw,52px)">
        <span class="eyebrow tight">THE FILE · ${photos.length} PHOTOGRAPHS ${pr.team ? `· ${esc(pr.team)}` : ''}</span>
        <div class="project-gallery">
          ${photos.slice(1).map((ph, i) => zoomable(ph.file, `${pr.name} — photograph ${i + 2}`, ph.caption)).join('')}
        </div>
      </section>
      <div class="project-next">
        <a class="simple-row" href="#/project/${esc(previous.id)}"><span><span class="meta">PREVIOUS FILE</span><br><strong>${esc(previous.name)}</strong></span><span aria-hidden="true">←</span></a>
        <a class="simple-row" href="#/project/${esc(next.id)}"><span><span class="meta">NEXT FILE</span><br><strong>${esc(next.name)}</strong></span><span aria-hidden="true">→</span></a>
      </div>
      <div class="project-cta">
        ${module ? `<div class="institution-panel" style="margin-top:26px">
          <span class="eyebrow tight">USED IN THE COURSE</span>
          <h2>Module ${esc(module.number)} · ${esc(module.title)}</h2>
          <p>${esc(module.description)}</p>
          <a class="button text" href="#/module/${esc(module.id)}">OPEN THE MODULE <span aria-hidden="true">→</span></a>
        </div>` : ''}
      </div>
    </main>`);
  }

  /* -------------------------------------------------------------- assignment */
  function assignmentPage(mid, lid) {
    const u = user();
    const current = allLessons.find(x => x.id === lid) || allLessons.at(-1);
    const assignmentId = current.id;
    const assignmentTitle = current.title + ' · Practical Assignment';
    const mine = state.submissions.filter(s => s.student === u.email && s.courseId === C.id && s.edition === C.edition && s.lessonId === assignmentId).at(-1);
    const revising = sessionStorage.getItem('chs-revising') === '1';
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">PRACTICAL ASSIGNMENT · ${esc(current.title)}</span><h1 class="page-title">Apply the<br>lesson to your<br><em>own concept</em>.</h1><p>${esc(current.challenge)}</p></div>
        <span class="edition-tag meta">SUBMISSION · ${mine && revising ? 'REVISION IN PROGRESS' : mine ? esc(mine.status) : 'OPEN'}</span>
      </div>
      <div class="assignment-layout" style="margin-top:38px">
        <section class="assignment-brief">
          <span class="eyebrow">THE BRIEF</span>
          <h2>Make the future <em>tangible</em>.</h2>
          <p>Develop a concept that connects a distinct audience and occasion to an experience your team can credibly deliver — on a budget you can actually fund.</p>
          <span class="meta">YOUR CONCEPT SHOULD INCLUDE</span>
          <ul>
            <li>Concept and target audience</li>
            <li>Guest experience and journey — and the details that keep the fairy tale intact</li>
            <li>Space and visual direction</li>
            <li>Food &amp; beverage proposition</li>
            <li>Technology choices and human touchpoints</li>
            <li>Sourcing &amp; budget plan: what is bought, found second-hand, reused or built</li>
            <li>Scenography: the theatrical techniques that carry the atmosphere</li>
            <li>Business model and operating logic</li>
          </ul>
          <span class="meta">THE PHYSICAL MOCKUP</span>
          <p>For the physical concept, build a live found-object set (1:20 or 1:50), not a paper model: use antique tableware, candles, vintage glassware, found textures/props and a physical menu concept. Decide the entrance, sightline, light source and three atmosphere-carrying details. Photograph it at guest height and attach the images.</p>
          <span class="meta">SUBMISSION FORMAT</span>
          <p>Write your concept here and attach a PDF, images of your mockup or a presentation — or send the same package by email (see the email option above the form). You may also include a link to your work.</p>
          <span class="meta">REVIEW</span>
          <p>Your instructor will provide human, editorial feedback. Work may be approved or returned for revision.</p>
        </section>
        <section>
          <span class="eyebrow">YOUR SUBMISSION</span>
          ${mine && !revising ? `<div class="simple-list">
              <div class="simple-row"><span class="meta">STATUS</span><span class="status-pill">${esc(mine.status)}</span></div>
              <div class="simple-row"><span class="meta">SUBMITTED</span><strong>${new Date(mine.date).toLocaleDateString()}</strong></div>
              <div class="simple-row"><span class="meta">ATTACHMENTS</span><strong>${esc((mine.files || []).map(f => typeof f === 'string' ? f : f.name).join(', ') || 'No files')}</strong></div>
            </div>
            <div class="review-work" style="margin:20px 0">${esc(mine.answer)}</div>
            ${mine.feedback ? `<div class="case-inline"><span class="meta">INSTRUCTOR FEEDBACK · SCORE ${esc(mine.feedback.score ?? '—')}</span><p>${esc(mine.feedback.text)}</p></div>` : ''}
            ${mine.status === 'REVISION REQUESTED' ? '<button class="button light" data-action="revise" style="margin-top:18px">RESUBMIT REVISION <span aria-hidden="true">↗</span></button>' : ''}`
          : `<div class="case-inline" style="margin:0 0 20px"><span class="meta">PREFER EMAIL? BOTH CHANNELS ARE EQUAL</span><p>Send your concept note, mockup photographs and attachments to <a href="mailto:egor.tarasenko@him-mail.ch">egor.tarasenko@him-mail.ch</a> with the subject “${esc(C.edition)} · ${esc(current.title)} · your name”. The in-app form and the email inbox reach the same instructor review.</p><a class="button light" href="mailto:egor.tarasenko@him-mail.ch?subject=${encodeURIComponent(`${C.edition} · ${current.title} · assignment`)}">SEND BY EMAIL <span aria-hidden="true">↗</span></a></div>
            <form id="assignment-form" data-lesson="${esc(assignmentId)}" data-module="${esc(current.module.id)}">
              <div class="field"><label for="answer">Concept note</label><textarea class="form-control" id="answer" name="answer" rows="10" required placeholder="What are you building, for whom, and why does it matter? Include sourcing, budget, menu concept and your found-object mockup: entrance, first sightline, light and the three details that carry the atmosphere.">${esc(revising ? mine?.answer || '' : '')}</textarea></div>
              <div class="field"><label for="link">Link to your presentation (optional)</label><input class="form-control" id="link" name="link" type="url" value="${esc(revising ? mine?.link || '' : '')}" placeholder="https://"></div>
              <div class="field"><label>Attach supporting files &amp; mockup photographs</label><div class="file-drop"><label class="meta" for="files">PDF · IMAGE · PRESENTATION · UP TO 15 MB EACH</label><br><input type="file" name="files" id="files" accept=".pdf,.png,.jpg,.jpeg,.ppt,.pptx,.key" multiple><p class="form-help">Files are uploaded securely to the course app (maximum 15 MB per file). Feedback and help: egor.tarasenko@him-mail.ch</p></div></div>
              <button class="button" type="submit">SUBMIT ASSIGNMENT <span aria-hidden="true">↗</span></button>
            </form>`}
        </section>
      </div>
    </main>`);
  }

  /* ------------------------------------------------------- instructor & admin */
  function instructorPage() {
    const list = state.submissions.map((s, i) => ({ ...s, _index: i })).filter(s => s.status !== 'SUPERSEDED' && s.institutionId === user()?.institutionId && s.courseId === C.id && s.edition === C.edition);
    const awaiting = list.filter(s => s.status === 'WAITING FOR REVIEW' || s.status === 'REVISION REQUESTED');
    return layout(`<main class="app-main">
      <div class="welcome">
        <div><span class="eyebrow">INSTRUCTOR SPACE · ${esc(C.institution.toUpperCase())}</span><h1>Course<br><em>overview</em>.</h1><p>Review student work and return feedback that moves ideas forward.</p></div>
        <span class="edition-tag meta">${C.edition} EDITION · ACTIVE</span>
      </div>
      <p class="form-help">Illustrative cohort snapshot; connect live analytics before institutional use.</p>
      <div class="metric-grid">
        <div class="metric"><span>Total students</span><strong>24</strong></div>
        <div class="metric"><span>Active this week</span><strong>18</strong></div>
        <div class="metric"><span>Average progress</span><strong>${list.length ? Math.round(pct()) : 42}%</strong></div>
        <div class="metric"><span>Awaiting review</span><strong>${awaiting.length}</strong></div>
      </div>
      <section id="submissions">
        <div class="page-head" style="padding-top:25px">
          <div><span class="eyebrow">STUDENT WORK</span><h2 class="page-title" style="font-size:clamp(30px,4vw,50px)">Submissions</h2><p>Review work for the ${C.edition} edition — concept notes, sourcing plans and mockup photographs. Student submissions remain edition-scoped.</p></div>
        </div>
        ${list.length ? `<div class="submission-row" style="border-bottom:1px solid var(--ink)"><span class="meta">STUDENT</span><span class="meta">ASSIGNMENT</span><span class="meta">SUBMITTED</span><span class="meta">STATUS</span></div>${list.map(s => `<a class="submission-row" href="#/review/${s._index}"><strong>${esc(s.name)}</strong><span>${esc(s.assignment)}</span><span class="meta">${new Date(s.date).toLocaleDateString()}</span><span class="status-pill">${esc(s.status)}</span></a>`).join('')}`
          : `<div class="empty"><span class="eyebrow">NO SUBMISSIONS YET</span><p>Student work will appear here when it is submitted for review.</p></div>`}
      </section>
      <section class="section" style="padding:42px 0 18px" id="admin-review">
        <span class="eyebrow">ADMIN PANEL · ASSIGNMENT REVIEW</span><h2 class="page-title" style="font-size:clamp(30px,4vw,48px)">Student work &amp; <em>feedback</em>.</h2>
        <p>Accept or return each assignment. Written feedback is required; students keep immediate access to every lesson regardless of review.</p>
        <div class="admin-submissions">${state.submissions.length ? state.submissions.slice().reverse().map(s => `<article class="institution-panel" style="margin:18px 0"><div class="simple-row"><span><span class="meta">${esc(s.assignment)} · ${esc(s.lessonId || '')}</span><br><strong>${esc(s.name)} · ${esc(s.student)}</strong></span><span class="status-pill">${esc(s.status)}</span></div><p class="review-work">${esc(s.answer || '')}${s.link ? `<br><a href="${esc(s.link)}" target="_blank" rel="noopener">${esc(s.link)}</a>` : ''}</p><div>${(s.files || []).map((f, i) => `<a class="button text" href="${esc(f.url || '#')}" data-action="download-file" data-url="${esc(f.url || '')}" data-name="${esc(f.name || f)}">${esc(f.name || f)} ↓</a>`).join(' ')}</div><form id="review-form" data-id="${esc(s.id)}" class="review-actions" style="margin-top:18px"><div class="field"><label>Required feedback to student</label><textarea class="form-control" name="feedback" rows="3" required placeholder="Specific, useful feedback from Egor Tarasenko">${esc(s.feedback?.text || '')}</textarea></div><div class="field"><label>Score (optional)</label><input class="form-control" type="number" name="score" min="0" max="100" value="${esc(s.feedback?.score ?? '')}"></div><button class="button" name="decision" value="APPROVED">APPROVE &amp; SEND FEEDBACK ✓</button> <button class="button light" name="decision" value="REVISION REQUESTED">REQUEST REVISION ↗</button></form></article>`).join('') : '<div class="empty">No student assignments submitted yet.</div>'}</div>
      </section>
      <div class="dash-lower" id="analytics">
        <section><h2 class="serif" style="font-size:26px">Module performance</h2><p class="form-help">Illustrative overview for this edition.</p><div class="chart-bars">${[76, 62, 54, 68, 45, 36, 51, 29, 44, 8].map((n, i) => `<div style="height:${n}%"><span>${String(i + 1).padStart(2, '0')}</span></div>`).join('')}</div></section>
        <section><h2 class="serif" style="font-size:26px">Recent activity</h2><div class="empty">${list.length ? `${list.length} submission${list.length > 1 ? 's' : ''} in this edition.` : 'Course activity will appear as learners progress through the edition.'}</div></section>
      </div>
    </main>`);
  }

  function reviewPage(index) {
    const s = state.submissions[Number(index)];
    if (!s || s.institutionId !== user()?.institutionId || s.courseId !== C.id || s.edition !== C.edition) return notFound();
    return layout(`<main class="app-main">
      <div class="crumb"><a href="#/instructor">SUBMISSIONS</a> <span>/</span> <span>REVIEW</span></div>
      <div class="page-head">
        <div><span class="eyebrow">INSTRUCTOR REVIEW · ${C.edition} EDITION</span><h1 class="page-title">${esc(s.name).toUpperCase()}</h1><p>${esc(s.assignment)} · Submitted ${new Date(s.date).toLocaleString()}</p></div>
        <span class="status-pill">${esc(s.status)}</span>
      </div>
      <div class="submission-review">
        <section>
          <span class="eyebrow">STUDENT WORK</span>
          <div class="review-work">${esc(s.answer)}${s.link ? `\n\nLINK: ${esc(s.link)}` : ''}</div>
          <div class="simple-list">${(s.files || []).map((f, i) => `<div class="simple-row"><strong>${esc(typeof f === 'string' ? f : f.name)}</strong><a class="button text" href="${typeof f === 'object' && f.url ? f.url : '#'}" data-action="download-file" data-submission="${s.id}" data-index="${i}">DOWNLOAD →</a></div>`).join('') || '<div class="empty">No files attached.</div>'}</div>
        </section>
        <form id="review-form" data-id="${s.id}" class="review-actions">
          <span class="eyebrow">EDITORIAL FEEDBACK</span>
          <div class="field"><label for="feedback">Notes for the student</label><textarea class="form-control" id="feedback" rows="9" required placeholder="What is working? What would strengthen the concept — and the mockup — next?">${esc(s.feedback?.text || '')}</textarea></div>
          <div class="field"><label for="score">Score (optional)</label><input class="form-control" id="score" type="number" min="0" max="100" value="${esc(s.feedback?.score ?? '')}" placeholder="0–100"></div>
          <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="button" name="decision" value="APPROVED" type="submit">APPROVE WORK <span aria-hidden="true">✓</span></button><button class="button light" name="decision" value="REVISION REQUESTED" type="submit">REQUEST REVISION <span aria-hidden="true">↗</span></button></div>
        </form>
      </div>
    </main>`);
  }

  function adminPage() {
    const tribute = state.tribute || {};
    const students = state.serverStudents || [];
    const orders = tribute.orders || [];
    const editor = editorState();
    const editorRows = [
      ...editor.materials.slice(0, 6).map(x => `<div class="simple-row"><span><span class="meta">MODULE ${esc(x.moduleNumber)} · MATERIAL</span><br><strong>${esc(x.note)}</strong></span><span class="meta">${esc(linkHost(x.url))}</span></div>`),
      ...editor.posts.slice(0, 4).map(x => `<div class="simple-row"><span><span class="meta">LIVE UPDATE</span><br><strong>${esc(x.title)}</strong></span><span class="meta">${esc(x.date)}</span></div>`),
      ...editor.overrides.slice(0, 6).map(x => `<div class="simple-row"><span><span class="meta">COPY EDIT · ${esc(x.scope)} ${esc(x.targetId)} · ${esc(x.field)}</span><br>${esc(String(x.text).slice(0, 90))}</span><code>${esc(x.id)}</code></div>`),
    ].join('') || '<div class="empty">No editor changes yet. The course reads exactly as published.</div>';
    const checks = [
      ['One-time product link + product ID', tribute.productCheckoutReady],
      ['Subscription link + subscription ID', tribute.subscriptionCheckoutReady],
      ['Tribute webhook signature', tribute.webhookConfigured],
      ['Telegram bot token', tribute.botConfigured],
      ['Bot username and start link', tribute.botUsernameConfigured],
    ];
    return layout(`<main class="app-main">
      <div class="welcome">
        <div><span class="eyebrow">COURSE ADMINISTRATION</span><h1>Access &amp; <em>payments</em>.</h1><p>Tribute confirms the payment; the Access Bot creates one individual password and delivers it to the buyer’s Telegram chat.</p></div>
        <span class="edition-tag meta">${tribute.deliveryReady ? 'TRIBUTE AUTOMATION READY' : 'TRIBUTE SETUP REQUIRED'}</span>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>Issued passwords</span><strong>${students.length}</strong></div>
        <div class="metric"><span>Confirmed Tribute payments</span><strong>${tribute.paidOrdersCount || 0}</strong></div>
        <div class="metric"><span>Pending password deliveries</span><strong>${tribute.pendingDeliveriesCount || 0}</strong></div>
        <div class="metric"><span>Active edition</span><strong>${C.edition}</strong></div>
      </div>

      <section class="institution-panel" id="tribute-setup">
        <span class="eyebrow">TRIBUTE · AUTOMATIC PASSWORD DELIVERY</span>
        <h2>${tribute.deliveryReady ? 'Payment flow is connected.' : 'Finish the payment setup.'}</h2>
        <p>Set these values on the Node host. The webhook URL to enter in Tribute is <code>${esc(tribute.webhookEndpoint || '/api/tribute/webhook')}</code>. Tribute sends a signed server-to-server event; no password is issued by the public page.</p>
        <div class="simple-list">${checks.map(([label, ready]) => `<div class="simple-row"><span>${esc(label)}</span><strong class="status-pill">${ready ? 'READY' : 'MISSING'}</strong></div>`).join('')}</div>
        <p style="margin-top:14px">A buyer must open the Access Bot once before payment so Telegram allows it to message them. If a message is missed, the buyer can send <code>/password</code>; an admin can use <code>/resend TELEGRAM_ID</code>.</p>
      </section>

      <section class="institution-panel" id="tribute-orders">
        <span class="eyebrow">RECENT PAYMENT EVENTS</span>
        <h2>Tribute orders</h2>
        <div class="simple-list">${orders.length ? orders.slice(0, 12).map(order => `<div class="simple-row"><span><strong>${esc(order.buyerName || order.telegramUsername || 'Telegram buyer')}</strong><br><span class="meta">${esc(order.productTitle || order.kind || 'Tribute event')} · ${esc(order.amount || '')} · ${esc(order.id)}</span></span><span><span class="status-pill">${esc(order.status || '—')}</span><br><span class="meta">DELIVERY · ${esc(order.deliveryStatus || '—')}</span></span></div>`).join('') : '<div class="empty">No confirmed Tribute events yet. They will appear here after the first signed webhook.</div>'}</div>
      </section>

      <section class="institution-panel" id="editor">
        <span class="eyebrow">CONTENT EDITOR · ADMIN BOT</span>
        <h2>Edit the course from Telegram</h2>
        <p>Materials land at the end of their module block, posts join the Updates page, and copy edits apply to modules and lessons until reverted. Commands: <code>/addmat MODULE URL DESCRIPTION</code>, <code>/materials</code>, <code>/editmat ID [URL] DESCRIPTION</code>, <code>/delmat ID</code>, <code>/post TITLE | TEXT</code>, <code>/posts</code>, <code>/delpost ID</code>, <code>/editmodule MODULE [FIELD] TEXT</code>, <code>/editlesson LESSON [FIELD] TEXT</code>, <code>/overrides</code>, <code>/revert ID</code>.</p>
        <div class="simple-list">${editorRows}</div>
      </section>

      <div class="dash-lower" style="margin:32px 0">
        <section class="institution-panel">
          <span class="eyebrow">PAID LEARNERS · DELIVERY STATUS</span><h2>Issued access</h2>
          <div class="simple-list">${students.length ? students.slice(0, 12).map(student => `<div class="simple-row"><span><strong>${esc(student.name)}</strong><br><span class="meta">${esc(student.email)} · ${esc(student.telegramUsername ? `@${student.telegramUsername}` : student.telegramId || 'Telegram not linked')}</span></span><span class="status-pill">${student.active ? esc(student.passwordDeliveryStatus || 'ISSUED') : 'INACTIVE'}</span></div>`).join('') : '<div class="empty">No paid learners yet.</div>'}</div>
          <p style="margin-top:14px">Passwords are sent privately by the Access Bot after Tribute confirms payment. For a missed message, use <code>/resend TELEGRAM_ID</code>; the code is never shown in this dashboard.</p>
        </section>
        <section class="institution-panel">
          <span class="eyebrow">TELEGRAM ADMIN BOT</span><h2>Run a bot command</h2>
          <p>Commands: <code>/orders</code>, <code>/resend TELEGRAM_ID</code>, <code>/students</code>, <code>/pending</code>, <code>/approve ID feedback</code>, <code>/revise ID feedback</code>.</p>
          <form id="admin-bot-form"><div class="field"><label for="admin-bot-command">Command</label><input class="form-control" id="admin-bot-command" name="command" required placeholder="/orders"></div><button class="button">RUN COMMAND ↗</button></form>
          <pre id="bot-response" class="review-work" style="white-space:pre-wrap">${esc((state.adminBot?.logs || []).slice(0, 5).map(entry => entry.text).join('\n'))}</pre>
        </section>
      </div>

      <section class="institution-panel" id="institutions">
        <span class="eyebrow">INSTITUTION · HIM-001</span>
        <h2>${esc(C.institution)}</h2>
        <p>${esc(C.title)} · ${C.edition} Edition</p>
        <div class="simple-list">
          <div class="simple-row"><span class="meta">LICENSE PERIOD</span><strong>01.09.2026 — 31.08.2027</strong></div>
          <div class="simple-row"><span class="meta">STATUS</span><span class="status-pill">${state.licenseActive ? 'ACTIVE' : 'SUSPENDED'}</span></div>
          <div class="simple-row"><span class="meta">COURSE ACCESS</span><strong>Individual password · confirmed Tribute purchase</strong></div>
        </div>
      </section>
    </main>`);
  }

  /* ------------------------------------------------- progress, quiz, certificate */
  function progressPage() {
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">YOUR LEARNING RECORD · ${C.edition} EDITION</span><h1 class="page-title">Progress,<br>with <em>purpose</em>.</h1><p>A clear view of the ideas explored, challenges submitted and milestones ahead.</p></div>
        <div class="progress-ring" style="color:var(--ink);border-color:var(--line-strong)"><span>${pct()}%<small style="color:var(--muted)">COMPLETE</small></span></div>
      </div>
      <div class="metric-grid">
        <div class="metric"><span>Lessons completed</span><strong>${completeCount()}</strong></div>
        <div class="metric"><span>Quiz results</span><strong>${Object.keys(state.quizzes).filter(k => k.startsWith(key())).length}</strong></div>
        <div class="metric"><span>Assignments</span><strong>${state.submissions.filter(s => s.student === user().email).length}</strong></div>
        <div class="metric"><span>Certificate</span><strong style="font-size:22px">${pct() === 100 ? 'READY' : 'IN PROGRESS'}</strong></div>
      </div>
      <div class="app-module-list">${C.modules.map(m => `<a class="app-module" href="#/module/${m.id}"><span class="module-num">${m.number}</span><div><h3>${esc(m.title)}</h3><p>${m.lessons.filter(l => progressFor().includes(l.id)).length} of ${m.lessons.length} learning units completed</p></div><div class="progress-holder"><div class="bar"><span style="width:${moduleProgress(m)}%"></span></div></div><span class="progress-cell">${moduleProgress(m)}%</span><span aria-hidden="true">↗</span></a>`).join('')}</div>
      <div class="lesson-footer"><a href="#/quiz" class="button light">TAKE A KNOWLEDGE CHECK <span aria-hidden="true">↗</span></a>${pct() === 100 ? button('VIEW CERTIFICATE', 'certificate') : ''}</div>
    </main>`);
  }

  function quizPage() {
    const qkey = `${key()}:quiz01`;
    const old = state.quizzes[qkey];
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">KNOWLEDGE CHECK · MODULE 05</span><h1 class="page-title">Automation<br>without losing<br><em>humanity</em>.</h1><p>One question to pause and apply your thinking.</p></div>
        <span class="edition-tag meta">QUESTION 01 / 01</span>
      </div>
      ${old ? `<section class="institution-panel"><span class="eyebrow">RESULT · ${old.score === 1 ? 'CORRECT' : 'REVIEW'}</span><h2>${old.score === 1 ? 'A useful distinction.' : 'Return to the key idea.'}</h2><p>Automation can remove friction, but the value of hospitality often lives in human attention and judgement.</p><button class="button light" data-action="retake-quiz" style="margin-top:16px">TRY AGAIN <span aria-hidden="true">↻</span></button></section>`
      : `<form id="quiz-form" class="institution-panel">
          <span class="meta">QUESTION 01</span>
          <h2 style="margin-top:12px">Which principle best guides automation in a hospitality setting?</h2>
          <label class="simple-row" style="justify-content:flex-start;gap:12px"><input type="radio" name="answer" value="a" required> <span>Automate every guest interaction to maximise speed.</span></label>
          <label class="simple-row" style="justify-content:flex-start;gap:12px"><input type="radio" name="answer" value="b"> <span>Automate repetition while protecting moments where human attention creates value.</span></label>
          <label class="simple-row" style="justify-content:flex-start;gap:12px"><input type="radio" name="answer" value="c"> <span>Use technology only when guests can see it working.</span></label>
          <button class="button" style="margin-top:24px" type="submit">SUBMIT ANSWER <span aria-hidden="true">↗</span></button>
        </form>`}
    </main>`);
  }

  function certificatePage() {
    const u = user();
    const id = `CHS-${C.edition}-${String(Math.abs((u.email + C.edition).split('').reduce((a, c) => a + c.charCodeAt(0), 0))).padStart(6, '0')}`;
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">A MILESTONE WORTH SHARING</span><h1 class="page-title">Your <em>certificate</em>.</h1><p>This printable certificate is issued when all ${allLessons.length} learning units are complete and your final project — concept and mockup — is approved.</p></div>
        <button class="button" data-action="print" ${certificateReady() ? '' : 'disabled'}>DOWNLOAD / PRINT <span aria-hidden="true">↗</span></button>
      </div>
      ${certificateReady() ? `<section class="certificate">
          <span class="eyebrow">${esc(C.institution)} · DIGITAL ELECTIVE</span>
          <span class="meta">CONTEMPORARY HORECA SCENE</span>
          <h1>Certificate of<br><em>Completion</em></h1>
          <p>This certificate confirms that</p>
          <div class="cert-name">${esc(u.name)}</div>
          <p>has successfully completed the digital elective, including the final concept and its physical mockup.</p>
          <span class="meta">${C.edition} EDITION</span>
          <div class="certificate-footer"><span class="meta">CERTIFICATE ID · ${id}</span><span class="meta">COURSE AUTHOR · EGOR TARASENKO</span><span class="meta">ISSUED · ${new Date().toLocaleDateString()}</span></div>
        </section>`
      : `<div class="empty"><span class="eyebrow">IN PROGRESS · ${pct()}% COMPLETE</span><p>Complete all ${allLessons.length} learning units and receive approval for your final project to make the certificate available. Your progress is saved for this edition.</p><a class="button" href="#/course" style="margin-top:18px">RETURN TO THE ELECTIVE <span aria-hidden="true">↗</span></a></div>`}
    </main>`);
  }

  /* ---------------------------------------------------- profile & utilities */
  function profilePage() {
    const u = user();
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">YOUR ACCOUNT · ${esc(u.role)} PROFILE</span><h1 class="page-title">${esc(u.name).toUpperCase()}</h1><p>Your learning profile for this institution and edition.</p></div>
        <span class="avatar" style="width:58px;height:58px;font-size:16px">${initials(u.name)}</span>
      </div>
      <section class="institution-panel">
        <span class="eyebrow">PROFILE DETAILS</span>
        <div class="simple-list">
          <div class="simple-row"><span class="meta">NAME</span><strong>${esc(u.name)}</strong></div>
          <div class="simple-row"><span class="meta">EMAIL</span><strong>${esc(u.email)}</strong></div>
          <div class="simple-row"><span class="meta">ROLE</span><strong>${esc(u.role)}</strong></div>
          <div class="simple-row"><span class="meta">COURSE</span><strong>${esc(C.title)}</strong></div>
          <div class="simple-row"><span class="meta">INSTITUTION</span><strong>${esc(C.institution)}</strong></div>
          <div class="simple-row"><span class="meta">COURSE AUTHOR</span><strong>${esc(C.author)}</strong></div>
          <div class="simple-row"><span class="meta">ENROLLED EDITION</span><strong>${C.edition} · ${esc(C.title)}</strong></div>
          <div class="simple-row"><span class="meta">DEVICE ACCESS</span><strong>UNLOCKED · 30 DAYS</strong></div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
          <button class="button light" data-action="logout">SIGN OUT <span aria-hidden="true">↗</span></button>
          <button class="button text" data-action="lock">LOCK THE COURSE ON THIS DEVICE →</button>
        </div>
      </section>
      ${state.myPurchase ? `<section class="institution-panel" style="margin-top:22px">
        <span class="eyebrow">YOUR PURCHASE · PAYMENT TRANSPARENCY</span>
        <div class="simple-list">
          <div class="simple-row"><span class="meta">PRODUCT</span><strong>${esc(state.myPurchase.productTitle)}</strong></div>
          <div class="simple-row"><span class="meta">AMOUNT PAID</span><strong>${esc(state.myPurchase.amount)}</strong></div>
          <div class="simple-row"><span class="meta">PAID AT</span><strong>${esc(new Date(state.myPurchase.paidAt).toLocaleString())}</strong></div>
          <div class="simple-row"><span class="meta">PURCHASE ID</span><strong>${esc(state.myPurchase.purchaseId)}</strong></div>
          <div class="simple-row"><span class="meta">PROVIDER</span><strong>${esc(state.myPurchase.provider)} · the course never sees card data</strong></div>
          <div class="simple-row"><span class="meta">PASSWORD DELIVERY</span><strong>${esc(state.myPurchase.deliveryStatus === 'DELIVERED' ? 'DELIVERED AUTOMATICALLY' : state.myPurchase.deliveryStatus)}</strong></div>
        </div>
        <p style="margin-top:14px">One individual password per purchase. Refunds follow the Tribute policy inside Telegram; any question about your payment: <a href="mailto:egor.tarasenko@him-mail.ch">egor.tarasenko@him-mail.ch</a>.</p>
      </section>` : u.role === 'STUDENT' ? '<section class="institution-panel" style="margin-top:22px"><span class="eyebrow">YOUR PURCHASE</span><p>No verified Tribute purchase is registered for this account yet. Write to the course team if you have paid — the record appears here automatically.</p></section>' : ''}
    </main>`);
  }

  function updatesPage() {
    const live = editorState().posts;
    return layout(`<main class="app-main">
      <div class="page-head">
        <div><span class="eyebrow">WHAT'S NEW · A LIVING ELECTIVE</span><h1 class="page-title">The industry<br>keeps <em>moving</em>.</h1><p>Course editions are designed to evolve with hospitality. New materials can be added while preserving past learning records.</p></div>
      </div>
      ${[...live, ...C.updates].map(x => `<article class="institution-panel"><span class="eyebrow">${esc(x.tag)} · ${esc(x.date)}</span><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></article>`).join('')}
    </main>`);
  }

  function searchPage(query = '') {
    const q = query.toLowerCase();
    const results = [];
    C.modules.forEach(m => {
      if (`${m.title} ${m.description}`.toLowerCase().includes(q)) results.push({ type: 'MODULE', title: m.title, desc: m.description, href: `module/${m.id}` });
      m.lessons.forEach(l => { if (`${l.title} ${l.intro} ${l.body} ${l.ideas.join(' ')}`.toLowerCase().includes(q)) results.push({ type: 'LESSON', title: l.title, desc: l.intro, href: `lesson/${m.id}/${l.id}` }); });
    });
    C.cases.forEach(x => { if (`${x.title} ${x.location} ${x.context} ${x.takeaway} ${x.industry}`.toLowerCase().includes(q)) results.push({ type: 'CASE STUDY', title: x.title, desc: x.context, href: 'cases' }); });
    projectList().forEach(pr => { if (`${pr.name} ${pr.role} ${pr.year} ${pr.tagline} ${pr.summary} ${pr.team}`.toLowerCase().includes(q)) results.push({ type: 'PROJECT FILE', title: pr.name, desc: pr.tagline, href: `project/${pr.id}` }); });
    return layout(`<main class="app-main">
      <div class="page-head"><div><span class="eyebrow">GLOBAL SEARCH · EDUCATIONAL CONTENT</span><h1 class="page-title">Find a <em>thread</em>.</h1></div></div>
      <form id="search-form" style="display:flex;gap:10px;margin:26px 0;flex-wrap:wrap">
        <input class="form-control" name="q" value="${esc(query)}" placeholder="Search lessons, modules, cases and topics" aria-label="Search course content" style="flex:1 1 320px">
        <button class="button">SEARCH <span aria-hidden="true">⌕</span></button>
      </form>
      ${query ? results.length
        ? `<span class="eyebrow">${results.length} RESULT${results.length === 1 ? '' : 'S'} FOR “${esc(query)}”</span><div class="simple-list">${results.map(r => `<a class="simple-row" href="#/${r.href}"><span><span class="meta">${r.type}</span><br><strong>${esc(r.title)}</strong><br><span class="form-help">${esc(r.desc)}</span></span><span aria-hidden="true">↗</span></a>`).join('')}</div>`
        : `<div class="empty"><span class="eyebrow">NO RESULTS</span><p>No content matched that search. Try a broader topic.</p></div>`
      : `<div class="empty"><span class="eyebrow">SEARCH THE EDITION</span><p>Find a lesson, module, case or topic across the course — try “mockup”, “budget”, “scenography” or “fairy tale”.</p></div>`}
    </main>`);
  }

  function notFound() {
    return layout(`<main class="app-main"><div class="page-head"><div><span class="eyebrow">404 · PAGE NOT FOUND</span><h1 class="page-title">Not this <em>way</em>.</h1><p>The page may have moved or may not be part of this edition.</p></div>${button('RETURN TO THE ELECTIVE', user() ? 'dashboard' : '')}</div></main>`);
  }

  /* ----------------------------------------------------------------- credits */
  function creditsPage() {
    const ic = C.imageCredits || {};
    const used = new Set();
    const collect = name => name && used.add(name);
    C.cases.forEach(x => collect(x.image));
    (C.figures || []).forEach(f => collect(f.image));
    C.modules.forEach(m => collect(m.image));
    (projectList() || []).forEach(p => collect(p.image));
    collect('web-insider-hall.jpg');
    const rows = [...used].sort().map(name => {
      const ill = (ic.illustrative || []).find(x => x.file === name);
      const g = creditGroup(name);
      const source = g?.source ? `<br><a href="${esc(g.source)}" target="_blank" rel="noopener noreferrer">${esc(g.source.replace(/^https?:\/\//, ''))} ↗</a>` : '';
      return `<div class="simple-row"><span><strong>${esc(name)}</strong><br><span class="meta">${esc(ill ? 'ILLUSTRATIVE · AUTHOR’S ARCHIVE · NOT THE VENUE PICTURED' : g?.credit || 'SOURCE ON REQUEST')}</span></span><span class="meta">${esc(g?.license || '')}${source}</span></div>`;
    }).join('');
    return layout(`<main class="app-main">
      <div class="page-head">
        <div>
          <span class="eyebrow">TRANSPARENCY FOR STUDENTS &amp; INSTITUTION</span>
          <h1 class="page-title">Image sources<br>&amp; <em>rights</em>.</h1>
          <p>${esc(ic.statement || '')}</p>
        </div>
      </div>
      <section class="institution-panel" id="image-sources">
        <span class="eyebrow">EVERY IMAGE USED IN THE ELECTIVE</span>
        <div class="simple-list">${rows}</div>
      </section>
      <section class="institution-panel" style="margin-top:22px">
        <span class="eyebrow">ILLUSTRATIVE PHOTOGRAPHS</span>
        <div class="simple-list">${(ic.illustrative || []).map(x => `<div class="simple-row"><span><strong>${esc(x.file)}</strong><br>${esc(x.note)}</span></div>`).join('')}</div>
      </section>
      <section class="institution-panel" style="margin-top:22px">
        <span class="eyebrow">RIGHTS HOLDERS &amp; TAKEDOWN</span>
        <p>Write to <a href="mailto:${esc(ic.contact || '')}">${esc(ic.contact || '')}</a> — credited images are listed above, and any rights-holder request is honoured promptly without discussion.</p>
      </section>
    </main>`);
  }

  /* ----------------------------------------------------------------- router */
  function render() {
    state = getState();
    closeLightbox();
    syncTelegramNavigation();
    const r = route();
    const u = user();
    if (r[0] === 'login') { go('dashboard'); return; }
    if (!r[0]) { app.innerHTML = landing(); return; }
    if (!u) { location.hash = '/'; return; }
    if (r[0] === 'dashboard' && u.role === 'STUDENT') app.innerHTML = dashboard();
    else if (r[0] === 'course') app.innerHTML = coursePage();
    else if (r[0] === 'module') app.innerHTML = modulePage(r[1]);
    else if (r[0] === 'lesson') app.innerHTML = lessonPage(r[1], r[2]);
    else if (r[0] === 'cases') app.innerHTML = casesPage();
    else if (r[0] === 'projects') app.innerHTML = projectsPage();
    else if (r[0] === 'project') app.innerHTML = projectPage(r[1]);
    else if (r[0] === 'assignment') app.innerHTML = assignmentPage(r[1], r[2]);
    else if (r[0] === 'instructor' && u.role === 'INSTRUCTOR') app.innerHTML = instructorPage();
    else if (r[0] === 'review' && u.role === 'INSTRUCTOR') app.innerHTML = reviewPage(r[1]);
    else if (r[0] === 'progress') app.innerHTML = progressPage();
    else if (r[0] === 'quiz') app.innerHTML = quizPage();
    else if (r[0] === 'certificate') app.innerHTML = certificatePage();
    else if (r[0] === 'admin' && u.role === 'ADMIN') app.innerHTML = adminPage();
    else if (r[0] === 'updates') app.innerHTML = updatesPage();
    else if (r[0] === 'credits') app.innerHTML = creditsPage();
    else if (r[0] === 'profile') app.innerHTML = profilePage();
    else if (r[0] === 'search') app.innerHTML = searchPage(new URLSearchParams(location.hash.split('?')[1] || '').get('q') || '');
    else if (r[0] === 'logout') { sessionStorage.removeItem('chs-user'); go(''); }
    else app.innerHTML = u.role === 'STUDENT' ? notFound() : `<main class="app-main"><div class="page-head"><div><span class="eyebrow">403 · ACCESS RESTRICTED</span><h1 class="page-title">This space<br>is <em>role-restricted</em>.</h1><p>Your current role does not have access to this area.</p></div><a class="button" href="#/${u.role === 'INSTRUCTOR' ? 'instructor' : u.role === 'ADMIN' ? 'admin' : 'dashboard'}">RETURN TO YOUR SPACE <span aria-hidden="true">↗</span></a></div></main>`;
  }

  function toast(text) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  function updateProgress(id) {
    state = getState();
    const list = state.progress[key()] || [];
    if (!list.includes(id)) { list.push(id); state.progress[key()] = list; saveState(state); toast('LESSON COMPLETED · PROGRESS SAVED'); }
    render();
  }

  function openSearch() {
    const q = prompt('Search lessons, modules, cases and topics');
    if (q?.trim()) go(`search?q=${encodeURIComponent(q.trim())}`);
  }

  function idbFile(submissionId, index) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('chs-submission-files', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('files');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('files', 'readonly');
        const get = tx.objectStore('files').get(`${submissionId}:${index}`);
        get.onsuccess = () => resolve(get.result);
        get.onerror = () => reject(get.error);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async function lockDevice() {
    if (!confirm('Lock Contemporary Horeca Scene on this device? You will need the course password to reopen it.')) return;
    try { await fetch('/api/access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'revoke' }) }); } catch { /* static hosting */ }
    try { localStorage.removeItem('chs-access-token'); localStorage.removeItem('chs-user-backup'); sessionStorage.removeItem('chs-user'); } catch { /* ignore */ }
    location.hash = '';
    location.reload();
  }

  /* -------------------------------------------------------------- lightbox */
  function lightboxEl() {
    let el = document.getElementById('lightbox');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lightbox';
      el.className = 'lightbox';
      el.innerHTML = '<button class="lightbox-close" data-action="lightbox-close" aria-label="Close image">✕ CLOSE</button><figure><img alt=""><figcaption></figcaption></figure>';
      document.body.appendChild(el);
    }
    return el;
  }

  function openLightbox(src, alt, caption) {
    const el = lightboxEl();
    el.querySelector('img').src = src;
    el.querySelector('img').alt = alt || '';
    el.querySelector('figcaption').textContent = caption || '';
    el.classList.add('show');
    document.body.classList.add('lightbox-open');
    el.querySelector('.lightbox-close').focus();
  }

  function closeLightbox() {
    const el = document.getElementById('lightbox');
    if (!el) return;
    el.classList.remove('show');
    document.body.classList.remove('lightbox-open');
  }

  /* --------------------------------------------------------------- events */
  document.addEventListener('click', async e => {
    const actionEl = e.target.closest('[data-action]');
    const action = actionEl?.dataset.action;
    if (action === 'lightbox') { openLightbox(actionEl.dataset.src, actionEl.querySelector('img')?.alt, actionEl.dataset.caption); return; }
    if (action === 'lightbox-close' || e.target.id === 'lightbox') { closeLightbox(); return; }
    if (action === 'complete') { updateProgress(actionEl.dataset.lesson); return; }
    if (action === 'search') { e.preventDefault(); openSearch(); return; }
    if (action === 'profile') { go('profile'); return; }
    if (action === 'logout') { if (confirm('Sign out of this course session?')) go('logout'); return; }
    if (action === 'lock') { await lockDevice(); return; }
    if (action === 'retake-quiz') { state = getState(); delete state.quizzes[`${key()}:quiz01`]; saveState(state); render(); return; }
    if (action === 'print') { window.print(); return; }
    if (action === 'toggle-license') { state = getState(); state.licenseActive = !state.licenseActive; state.licenses[0].status = state.licenseActive ? 'ACTIVE' : 'SUSPENDED'; saveState(state); render(); toast(`LICENSE ${state.licenseActive ? 'ACTIVE' : 'SUSPENDED'}`); return; }
    if (action === 'revise') { state = getState(); const prior = state.submissions.filter(s => s.student === user().email && s.courseId === C.id && s.edition === C.edition).at(-1); if (prior) prior.status = 'SUPERSEDED'; sessionStorage.setItem('chs-revising', '1'); saveState(state); render(); return; }
    if (action === 'download-file') {
      e.preventDefault();
      try {
        const remoteUrl = actionEl.dataset.url;
        if (remoteUrl) {
          const response = await fetch(remoteUrl, { headers: tokenHeaders() });
          if (!response.ok) throw new Error('File download unavailable');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = actionEl.dataset.name || 'assignment-file'; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else {
          const file = await idbFile(actionEl.dataset.submission, Number(actionEl.dataset.index));
          if (!file) { toast('FILE IS NOT AVAILABLE IN THIS BROWSER'); return; }
          const url = URL.createObjectURL(file.blob);
          const a = document.createElement('a'); a.href = url; a.download = file.name; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
      } catch { toast('FILE STORAGE IS NOT AVAILABLE'); }
      return;
    }
    if (e.target.closest('[data-scroll]')) {
      const dest = e.target.closest('[data-scroll]').dataset.scroll;
      setTimeout(() => document.getElementById(dest)?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  });

  document.addEventListener('ended', e => { if (e.target.matches('video[data-video-lesson]')) updateProgress(e.target.dataset.videoLesson); }, true);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeLightbox(); return; }
    const figure = e.target.closest?.('.gallery-item[data-action="lightbox"]');
    if (figure && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLightbox(figure.dataset.src, figure.querySelector('img')?.alt, figure.dataset.caption); }
  });

  document.addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.id === 'assignment-form') {
      const u = user(), fd = new FormData(e.target), files = [...document.getElementById('files').files];
      if (files.some(f => f.size > 15 * 1024 * 1024)) { toast('EACH FILE MUST BE UNDER 15 MB'); return; }
      const sub = {
        id: `sub-${Date.now()}`, student: u.email, name: u.name, institutionId: u.institutionId || 'him-001',
        courseId: C.id, edition: C.edition,
        assignment: `${allLessons.find(l => l.id === e.target.dataset.lesson)?.title || 'Final Challenge'} · Practical Assignment`,
        moduleId: e.target.dataset.module || 'final', lessonId: e.target.dataset.lesson || 'final-brief',
        studentId: u.id, telegramId: u.telegramId || null,
        answer: String(fd.get('answer') || ''), link: String(fd.get('link') || ''),
        files: files.map(f => f.name), date: new Date().toISOString(), status: 'WAITING FOR REVIEW', feedback: null,
      };
      try {
        const encodedFiles = await Promise.all(files.map(file => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, type: file.type, size: file.size, dataBase64: String(reader.result).split(',')[1] });
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })));
        const response = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...tokenHeaders() },
          body: JSON.stringify({ ...sub, files: encodedFiles }),
        });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'Submission upload failed');
        }
        const result = await response.json();
        Object.assign(sub, result.submission || {});
      } catch (error) {
        if (!String(error.message).includes('Failed to fetch')) { toast(error.message || 'SUBMISSION FAILED'); return; }
        toast('SERVER NOT AVAILABLE — SUBMISSION SAVED LOCALLY');
      }
      state = getState();
      state.submissions = state.submissions.filter(s => !(s.student === u.email && s.lessonId === sub.lessonId));
      state.submissions.push(sub);
      saveState(state);
      sessionStorage.removeItem('chs-revising');
      saveState(state);
      toast('SUBMISSION RECEIVED · CONCEPT + MOCKUP');
      render();
      return;
    }
    if (e.target.id === 'review-form') {
      const form = e.target, id = form.dataset.id, decision = e.submitter?.value || 'APPROVED';
      const feedback = form.elements.feedback.value.trim();
      if (!feedback) { toast('FEEDBACK IS REQUIRED'); return; }
      try {
        const response = await fetch('/api/admin/review', {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...tokenHeaders() },
          body: JSON.stringify({ submissionId: id, decision, feedback, score: form.elements.score?.value || null }),
        });
        if (!response.ok) throw new Error((await response.json()).error || 'Review failed');
        await syncServerState();
      } catch (error) {
        state = getState();
        const sub = state.submissions.find(s => s.id === id);
        if (!sub) { toast(error.message); return; }
        sub.status = decision;
        sub.feedback = { text: feedback, score: form.elements.score?.value || null, status: decision, updatedAt: new Date().toISOString() };
        saveState(state);
      }
      toast(decision === 'APPROVED' ? 'FEEDBACK SAVED · WORK APPROVED' : 'FEEDBACK SAVED · REVISION REQUESTED');
      go('admin');
      return;
    }
    if (e.target.id === 'admin-bot-form') {
      const command = String(new FormData(e.target).get('command') || '');
      try {
        const response = await fetch('/api/admin/bot-command', { method: 'POST', headers: { 'Content-Type': 'application/json', ...tokenHeaders() }, body: JSON.stringify({ command }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Bot command failed');
        await syncServerState(); render();
        const replyBox = document.getElementById('bot-response');
        if (replyBox) replyBox.textContent = data.reply || '';
      } catch (error) { toast(error.message); }
      return;
    }
    if (e.target.id === 'quiz-form') {
      const val = new FormData(e.target).get('answer');
      state = getState();
      state.quizzes[`${key()}:quiz01`] = { score: val === 'b' ? 1 : 0, answer: val, at: new Date().toISOString() };
      saveState(state);
      render();
      return;
    }
    if (e.target.id === 'search-form') { const q = new FormData(e.target).get('q'); go(`search?q=${encodeURIComponent(q)}`); return; }
  });

  async function authenticateTelegram() {
    if (!tg?.initData || !user()) return;
    try {
      const response = await fetch('/api/telegram-auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ initData: tg.initData }) });
      const result = await response.json();
      if (!response.ok || !result.user) throw new Error(result.error || 'Telegram verification unavailable');
      const current = user();
      const profile = { ...current, telegramId: result.user.id, telegramUsername: result.user.username || null };
      sessionStorage.setItem('chs-user', JSON.stringify(profile));
      localStorage.setItem('chs-user-backup', JSON.stringify(profile));
    } catch (error) {
      console.warn('Telegram profile could not be refreshed:', error.message);
    }
  }

  /* Live updates: editor and payment changes arrive in the open app without a reload. */
  function startLiveSync() {
    const tick = async () => {
      try {
        const response = await fetch('/api/state', { headers: tokenHeaders() });
        if (!response.ok) return;
        const data = await response.json();
        const signature = liveSignatureOf(data);
        if (signature === liveSignature) return;
        const editing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
        adoptServerData(data);
        if (editing) return; // do not interrupt typing; the next tick renders
        liveSignature = signature;
        render();
      } catch { /* offline preview */ }
    };
    setInterval(tick, 30000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  window.addEventListener('hashchange', render);
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', async () => { await syncServerState(); render(); startLiveSync(); });
  else { syncServerState().finally(() => { render(); startLiveSync(); }); }
  if (tg?.initData) authenticateTelegram();
};
