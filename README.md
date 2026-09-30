# CONTEMPORARY HORECA SCENE

**Contemporary Horeca Scene** — a living digital elective for Hotel Institute Montreux, created by **Egor Tarasenko**, HIM alumnus and Master in Business Management.

> A digital elective that reads the contemporary horeca scene through rankings, design, neurogastronomy, technology and entrepreneurship — and ends with a live found-object mockup assembled from antique tableware, candles, vintage glassware, found props and a physical menu concept.

## Access

Students use an individual password issued through the Tribute digital-product flow (one password per person). A valid password immediately opens every module and lesson; assignment review is not an access check and does not lock lessons. The app remembers access on the device for 30 days.

The Node service verifies the student password and issues a signed session (`POST /api/access`). `/course-data.js`, `/course/`, `/presentation/dist/` and `/presentation/build/` are protected until access is granted. Repeated wrong entries are throttled (`429` after 20 attempts per 10 minutes). Administrators use the master password configured with `COURSE_PASSWORD` (the repository default is for local development only); set a strong private value before deployment. `ACCESS_SECRET` controls signed session tokens and should also be set to a stable secret in production.

## Brand & design system

The visual language is taken from **Swiss Education Group** (swisseducation.com) and reinterpreted as a contemporary editorial system — the same brand DNA, a new arrangement:

| Token | Value | Source in the SEG style |
|---|---|---|
| Signal red | `#e42313` | SEG accent (links, hover fills, footer titles, icons) |
| Deep maroon | `#410c0c` | SEG dark panel / quote CTA |
| Ink | `#0a0a0a` on `#ffffff` | SEG black-on-white pages |
| Warm paper | `#f4f3f0`, `#faf9f7` | panel and inset surfaces |
| Hairlines | `rgba(10,10,10,.14)`, `#e6e6e6` | SEG 1px rules and card borders |
| Display sans | **Sora** 200–500 | SEG UI/headline face (`font-family:Sora`) |
| Display serif | **Spectral** italic (a free stand-in for **Canela**) | SEG italic accents — “Creating tomorrow's industry *leaders*” |
| Micro-labels | **Inter** 10.5px, uppercase, `.16em` tracking | SEG pretitle/footer labels |
| Key figures | giant light-weight numbers on hairline columns | SEG “4 schools / 6K+ students” strip |

Signature moves used across the site: a split hero stage (giant light-weight uppercase type on ink, the photograph hung whole beside it) with an italic serif accent word; a pretitle eyebrow with a red dash and a hairline rule; a marquee ticker of the venues “on the scene”; a maroon quote band with a red bottom border; rectangular buttons that fill red from below on hover; underline-animated text links; hairline module tables with hover shift; SEG-style key-figure counters.

The **course author is credited inside the product** (footer, profile, certificate small print, instructor identity) but his **name is not shown on the title visuals** — hero, login visual, deck cover. The **author bio and selected projects live in a pop-up, not a standalone landing-page block**: `author.js` opens a dialog from the clickable “About the author” controls on the password gate, landing page, dashboard and app header. It lists only the author’s international experience (Sakhalin 2015 → Thailand 2019 → Switzerland 2019 → Dubai 2021 → St Petersburg 2022), beginning with his first steps in HoReCa as a waiter, and five own projects as photographs with only a name and year (Passie Cakes Co. 2022 / CooCoo 2024 / Pacific 2024 / Joi 2025 / Chicken Connection 2024). All copy is in English and project names use Latin script. The bars of Ivan Lyashuk and Vladimir Nikolaev — One and Half Room, Flowers Bar, Oy!, Ultramen! and Ruc’s Heaven — and their Artender media/community project are documented in their Cases & figures profiles, not attributed to the course author. The public start page (`.gate-page` → `.gate-stage` + `.gate-info`) states what the course is. The full author-project archive remains available from the About the author pop-up after course access; cases and leading industry figures remain in the Cases section/page.

## Run locally / deploy on BotHost

A **Node.js-served web app** (not Python). No npm packages are required; Node 18 or newer is sufficient.

```bash
npm start          # http://0.0.0.0:$PORT (default 3000)
npm run check      # syntax check: server.js, app.js, access.js, author.js, course-data.js
npm test           # English-only copy, author/figure separation and API regression checks
```

The server binds to `0.0.0.0`, serves the site, exposes `/healthz`, verifies Telegram `initData` and enforces the course password. Opening `index.html` as a `file://` URL is not supported; use the server so cookies, storage and assets work correctly.

On BotHost, provide a private `COURSE_PASSWORD` for the administrator, a stable `ACCESS_SECRET`, and for Telegram launch `BOT_TOKEN` plus `ADMIN_IDS` (comma- or space-separated Telegram numeric user IDs). BotHost supplies `PORT`. The bot token and passwords stay server-side; never put them in front-end code.

## Telegram launch

The responsive site can be opened directly on its HTTPS domain or launched inside Telegram as a **Mini App**. Point your bot's `web_app` button (or menu button) at the deployed URL. The front end detects Telegram's Web App SDK, calls `ready()` / `expand()`, syncs the viewport and header colours (both on the password gate and inside the course), and uses Telegram's back button when available. The public Mini App URL must use HTTPS.

When launched inside Telegram, the Node server verifies the SDK's signed `initData` at `POST /api/telegram-auth` using `BOT_TOKEN`. Telegram users whose numeric ID is listed in `ADMIN_IDS` receive the administrator role; other verified users enter as students. The course password gate applies to Telegram sessions as well. Bot menu/launch-button configuration is done in BotFather.

## Demo identities

Course access is the password above. Inside the course, **Student login** accepts an email and any non-empty password in this prototype:

- Student: `student@him.edu`
- Instructor: `instructor@him.edu` (course author identity)
- Admin: `admin@him.edu`

Demo state is saved in the browser (`localStorage`); attached submission files are kept in IndexedDB. For an end-to-end review flow, submit work as the student, sign out, sign in as the instructor, open the submission and approve it or request a revision. No demo accounts or student records are sent to a server.

## Course structure (2026 edition)

Ten modules / thirteen learning units:

| # | Module | Focus |
|---|---|---|
| 01 | The Future of Hospitality | Reading the signals reshaping the industry |
| 02 | Experience Design | Atmosphere, service choreography — and the “sweet fairy tale” principle |
| 03 | Neurogastronomy | Perception, gastrophysics, multisensory serves |
| 04 | Restaurant & Bar Concepts | Positioning, storytelling, business logic |
| 05 | Technology & Automation | Where to automate, where to stay human |
| 06 | AI in Hospitality | AI workflows, limits and responsibility |
| 07 | Food & Beverage Futures | New formats, ingredients, beverage culture |
| 08 | Entrepreneurship | From idea to operating model |
| **09** | **Budget Realisation & Scenography** | **Found objects and flea markets, theatrical decorative techniques, the live found-object mockup** |
| 10 | Final Challenge | Concept of tomorrow, defended together with the mockup |

### Module 09 — Budget Realisation & Scenography

Three learning units:

1. **Soul before budget** — a venue does not need a large budget to feel alive; it needs a point of view and the patience to hunt for objects that carry one. Sourcing discipline (flea markets, auctions, demolition yards, liquidations, the street), repair / reuse / re-upholstery, and the case of **Joi Espresso Bar** — the author's own project, assembled almost entirely from the street and flea markets. *Money buys speed and finish; intention buys soul.*
2. **Theatrical techniques & the live found-object mockup** — scenography borrowed from the stage: painted flats, forced perspective, backdrops, scrim and gauze, trompe-l'œil, glazing, patina, distressing, stencil and gold leaf, faux bois / faux marbre, drapery, haze and one tight beam of light. A theatrical trick must support the story and never announce itself.
3. **Small venues, real budgets: the author's project archive** — the photographic evidence behind the method: **Joi Espresso Bar** (2025 · OGONEK TEAM), **Passie Cakes Co.**, **CooCoo Coffee**, **Chicken Connection** (Moscow, filmed with Dmitry Konnikov), **Pacific** and the **TAM / TYT** object line, plus a collecting file of found details (chessboards, resin ashtrays, pasted posters, a lemon press on the pavement). Students read the archive and write down what was bought, what was found and what was made.

Module 04 also gained a learning unit, **Concept objects: the menu, the merchandise, the furniture**, reading the same archive through the takeaway object: a menu that leaves the venue, flavour cubes that teach a drinks list, and bar stations drawn for the workshop.

**Final exercise:** every student stages a live physical mockup directly from found objects — antique tableware, candles, vintage glassware, found textures and props, and a physical menu concept — at 1:20 or 1:50. It is a set rather than a plan: entrance, first sightline, light source, and the details that carry the atmosphere. Photograph it at guest height for the final pitch.

**Operating principle of the course:** a bar or a restaurant is a sweet fairy tale — for two hours the guest agrees to believe in a world the team built, and any small detail (a harsh light, a plastic tray, a visible printer, a dirty door handle) can instantly wake them from that dream.

## Product experience

- **Public start page** (SEG-styled split screen: gate visual + password form) followed by a course-information band and a clickable About the author pop-up. Once access is granted, the editorial landing page covers the elective's positioning, subject areas, learning sequence, case files, the fairy-tale principle, the budget & scenography block, ten-module structure and final challenge. Cases and leading industry figures remain available together on the Cases page.
- **Projects of the author** (`#/projects`, `#/project/<id>`) — 43 photographs across seven project files: Joi Espresso Bar, Passie Cakes Co., CooCoo Coffee, Chicken Connection, Pacific, TAM / TYT and a found-object research file. Each file carries facts, an English explanation and a captioned gallery with a keyboard-accessible lightbox. The full archive is reached via the About the author pop-up rather than a separate main-navigation item; its photographs also remain course evidence in the relevant cases and modules.
- **Student space** with course progress, next lesson, modules, editorial lesson pages, case studies, assignment submissions (concept + mockup photographs), quiz, feedback, updates and a printable certificate.
- **Instructor space** for reviewing work, assigning a score, providing feedback and approving or returning submissions for revision.
- **Admin view** for the generic institution/license model, edition overview, password-access status and license demonstration.
- Responsive desktop and mobile navigation, search across course content, accessible form labels, keyboard-operable controls, reduced-motion and print styles.
- **Photography is shown whole.** Source frames are mostly 3:4 / 4:5 phone photographs, so content images (case cards, project cards, galleries, creator and budget frames, the hero plate) render at their natural proportions instead of being cropped to a fixed-height strip. Only surfaces that are treated as background fields — hero on mobile, the gate/login visual, the case feature band, module and lesson banners — are cropped, and their `object-position` is set deliberately.
- Existing course materials and photography remain available; the new UI uses the existing hospitality imagery and does not present the HIM or SEG logos as a claim of institutional endorsement.

## Language and editorial boundaries

The gate, checkout, author dialog, lessons, captions, project archive, administration, Telegram bot and downloadable materials are English-only. Cyrillic name duplicates and translated project/caption fields are not shipped. The deck builder produces the English PDF only; there are no alternate-language course handouts or decks.

The author dialog contains the author’s own career and projects. Perfect Bars Team’s venues belong in Ivan Lyashuk’s and Vladimir Nikolaev’s industry profiles; Artender is identified as a media and creative-community project, not a sixth bar. These profiles link to the team’s primary sources. Original documentary photographs are preserved unchanged, including any signage visible within them.

`npm test` guards the language and attribution rules, alongside isolated checks of server-provided access, checkout and bot messages.

## Content, architecture and boundaries

- `access.js` owns the password gate and boots `app.js` (`window.bootCourse`) only after `course-data.js` has been unlocked and loaded.
- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files, the `projects` archive (seven files with captioned photography) and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text.
- The original photographs live in the repository root (`IMG_*.jpeg`, `IMG_8809.png`) and are never referenced directly by the app. `presentation/build/build_project_assets.py` derives the optimised, metadata-free web set (`presentation/assets/project-*.jpg|png`, max edge 1400 px) from them, so the camera files stay untouched and the shipped assets stay small and stably named. Re-run it after adding photographs: `python3 presentation/build/build_project_assets.py`.
- The initial generic domain is: **Institution → User / Enrollment → Course → Edition → Module → Lesson**; learning and operations entities include **Video, CaseStudy, ReadingMaterial, Assignment, Submission, Feedback, Quiz, Question, Answer, Progress, Certificate, License, CourseUpdate, Notification**.
- Progress and quiz records are scoped to user and edition. Submissions record the student and edition context; an institution-scoped instructor review view is the intended authorization boundary.
- Course content and author IP remain separate from the institution's licensed access. A new edition can evolve independently, without overwriting existing edition records.
- `course/` is the English-only source library for the full syllabus, lectures, assignments and case material, including Module 6 — Budget Realisation & Scenography, the Joi Espresso Bar case and the mockup brief. `presentation/` is the reproducible proposal-deck project.

### Important production boundary

The repository includes a lightweight Node server that verifies Telegram Mini App `initData` against `BOT_TOKEN`, grants `ADMIN` to `ADMIN_IDS`, and enforces the course password with a signed `HttpOnly` cookie. However, it has **no database, persistent server-side sessions, server-backed learning APIs, content-management service or production file storage**. Progress, quizzes, submissions and feedback are still browser-local and editable, and uploaded files stay in that browser. The password gate protects content delivery from this server; it is not a substitute for per-student accounts. Do not use this build for real student records until a database/API, server-enforced institution/course/role access, secure upload storage, retention/backup policies and monitoring are in place.

## Original course proposal

The educational proposal is a 12-week, 36-contact-hour elective in English for BBA/MIB students. Its syllabus now runs to **six modules** — the original five plus *Budget Realisation & Scenography* (weeks 11–12) — with the mockup defended at Final Pitch Day. Grading model and reading list remain in `course/`.

The course brings together hospitality futures, experience design, neurogastronomy, restaurant and bar concepts, technology, AI, food & beverage, entrepreneurship and budget realisation. Its through-line is a student-designed hospitality concept, developed to a final pitch and a physical mockup.

## Proposal deck

`presentation/dist/Contemporary-Horeca-Scene-Course-Pitch-EN.pdf` is the English-only proposal deck. Its sources use the SEG palette, keep the author off the cover, and include Module 6 and the mockup in the course map, week plan, assessment and final project slides. Rebuild the deck after changing its sources:

```bash
python3 -m venv .venv
.venv/bin/pip install -r presentation/build/requirements.txt
.venv/bin/python presentation/build/build_deck.py
```

The deck generator prefers Inter when available through `HIM_FONT_DIR`, with DejaVu Sans as a fallback.


## Access, lessons, submissions and administration

A valid personal Tribute password (one per person) or the administrator password opens the course immediately. All 13 lessons and all modules are available at once; assignment review never gates lesson access. Students can submit the practical assignment from each lesson, add text, a link and files in the app, and receive feedback. Help/reference email: `egor.tarasenko@him-mail.ch`.

The self-hosted Node service persists records in `data/store.json` and uploaded files in `data/uploads/` (excluded from Git). Tribute integration is a clearly labelled digital-product stub until real credentials/configuration are supplied. Admin tools include assignment review with required written feedback, password generation, and a bot-command console. Optional Telegram Bot API integration uses `BOT_TOKEN` and configured admin chat IDs.

Configuration: `COURSE_PASSWORD` (or comma-separated `COURSE_PASSWORDS`) for administrator access; `ACCESS_SECRET` for stable signed sessions; `TRIBUTE_PRODUCT_ID`, `TRIBUTE_PRODUCT_URL`, `TRIBUTE_PRICE`, `TRIBUTE_API_KEY`, `BOT_TOKEN`, and `ADMIN_IDS` as needed. Run with `npm start`; run syntax checks with `npm run check`.
