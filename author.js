/* ============================================================================
   AUTHOR POP-UP — Contemporary Horeca Scene
   The information about the course author is not part of the page flow: it opens
   in a dialog only when the visitor asks for it. Any element with
   [data-author-open] (password gate, landing navigation, footers) triggers it.
   ========================================================================== */
(() => {
  'use strict';

  const ASSET = 'presentation/assets/';
  const EMAIL = 'egor.tarasenko@him-mail.ch';

  const path = [
    ['2015', 'Sakhalin', 'First steps in HoReCa: waiter at Tiflis, a Georgian restaurant in Yuzhno-Sakhalinsk, and at Duke nightclub.'],
    ['2019', 'Thailand', 'Restaurant manager at Ronin, a Russian-cuisine restaurant.'],
    ['2019', 'Switzerland', 'Master’s degree at Hotel Institute Montreux.'],
    ['2021', 'Dubai', 'Senior bartender at Jumeirah Beach Hotel.'],
    ['2022', 'St Petersburg', 'Senior bartender at Crowne Plaza.']
  ];

  const projects = [
    ['author-passie-2022.jpg', 'Passie Cakes Co.', '2022', 'passie'],
    ['author-coocoo-2024.jpg', 'CooCoo', '2024', 'coocoo'],
    ['author-pacific-2024.jpg', 'Pacific', '2024', 'pacific'],
    ['author-joi-2025.jpg', 'Joi', '2025', 'joi'],
    ['author-chc-2024.jpg', 'Chicken Connection', '2024', 'chicken']
  ];

  const markup = () => `
    <div class="author-dialog" role="dialog" aria-modal="true" aria-labelledby="author-title" tabindex="-1">
      <button class="author-close" type="button" data-author-close aria-label="Close author information">✕</button>
      <header class="author-head">
        <span class="eyebrow">ABOUT THE AUTHOR</span>
        <h2 id="author-title">Egor <em>Tarasenko</em></h2>
        <p class="author-role">HIM alumnus · Master in Business Management · Hotel Institute Montreux</p>
      </header>
      <div class="author-body">
        <section class="author-col">
          <h3 class="author-label">International experience</h3>
          <ol class="author-path">
            ${path.map(([year, place, text]) => `<li><b>${year}</b><span><strong>${place}</strong>${text}</span></li>`).join('')}
          </ol>
        </section>
      </div>
      <section class="author-work">
        <h3 class="author-label">Own projects</h3>
        <div class="author-frames">
          ${projects.map(([file, name, year, id]) => `<figure>${window.COURSE
            ? `<a class="author-project-link" href="#/project/${id}" data-author-route><img src="${ASSET}${file}" alt="${name} ${year}" loading="lazy"><figcaption>${name} <b>${year}</b></figcaption></a>`
            : `<img src="${ASSET}${file}" alt="${name} ${year}" loading="lazy"><figcaption>${name} <b>${year}</b></figcaption>`}</figure>`).join('')}
        </div>
        ${window.COURSE ? '<a class="author-archive-link" href="#/projects" data-author-route>OPEN THE FULL PROJECT ARCHIVE <span aria-hidden="true">→</span></a>' : ''}
      </section>
      <p class="author-mail">Course, licensing and programme enquiries: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
    </div>`;

  let overlay = null;
  let lastFocus = null;

  const close = () => {
    if (!overlay) return;
    overlay.classList.remove('show');
    document.body.classList.remove('author-open');
    const el = overlay;
    overlay = null;
    setTimeout(() => el.remove(), 220);
    lastFocus?.focus?.({ preventScroll: true });
  };

  const open = () => {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'author-overlay';
    overlay.innerHTML = markup();
    document.body.appendChild(overlay);
    document.body.classList.add('author-open');
    requestAnimationFrame(() => {
      overlay?.classList.add('show');
      overlay?.querySelector('.author-dialog')?.focus({ preventScroll: true });
    });
  };

  document.addEventListener('click', event => {
    if (event.target.closest('[data-author-open]')) { event.preventDefault(); open(); return; }
    if (!overlay) return;
    if (event.target.closest('[data-author-route]')) { close(); return; }
    if (event.target.closest('[data-author-close]') || event.target === overlay) close();
  });

  document.addEventListener('keydown', event => {
    if (!overlay) return;
    if (event.key === 'Escape') { event.stopImmediatePropagation(); close(); return; }
    if (event.key === 'Tab') {
      const items = [...overlay.querySelectorAll('button, a[href]')];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === overlay.querySelector('.author-dialog'))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }, true);

  window.openAuthorModal = open;
})();
