# CONTEMPORARY HORECA SCENE

**Contemporary Horeca Scene** — a living digital elective for Hotel Institute Montreux, created by **Egor Tarasenko**, HIM alumnus and Master in Business Management.

> A digital elective that reads the contemporary horeca scene through rankings, design, neurogastronomy, technology and entrepreneurship — and ends with a live found-object mockup assembled from antique tableware, candles, vintage glassware, found props and a physical menu concept.

## Access and payment flow

Course entry is password-only. Tribute is the payment route; a payment link never unlocks the course. Each confirmed buyer receives an individual password that opens every module and lesson. The signed-in session is remembered on that device for 30 days.

The customer journey is deliberately short: open the course Access Bot and tap **Start**, buy the one-time product or start a subscription through Tribute, then receive an individual password in that same bot chat after confirmation. Starting the bot first is important because Telegram does not let a bot initiate a private conversation. If a payment notification arrives before the customer starts the bot, delivery is retried when they send `/start`; `/password` resends an already-issued code.

Tribute sends a signed HTTPS webhook to `POST /api/tribute/webhook`. The Node service verifies `trbt-signature`, matches the configured product or subscription ID, processes duplicate events safely, creates one password per Telegram user, and sends it through the Telegram Bot API. Only that webhook can issue a Tribute password. The old demo checkout and static password fallback have been removed. `/course-data.js`, `/course/`, `/presentation/dist/` and `/presentation/build/` remain protected until the server verifies a password. Repeated incorrect entries are throttled (`429` after 20 attempts per 10 minutes). The administrator uses a private `COURSE_PASSWORD`; `ACCESS_SECRET` should be set to a stable secret in production.

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

The **course author is credited inside the product** (footer, profile, certificate small print, instructor identity) but his **name is not shown on the title visuals** — hero, login visual, deck cover. The **author bio and selected projects live in a pop-up, not a standalone landing-page block**: `author.js` opens a dialog from the clickable “About the author” controls on the password gate, landing page, dashboard and app header. It lists only the author’s international experience (Sakhalin 2015 → Thailand 2019 → Switzerland 2019 → Dubai 2021 → St Petersburg 2022), beginning with his first steps in HoReCa as a waiter, and five own projects as photographs with only a name and year (Passie Cakes Co. 2022 / CooCoo 2024 / Pacific 2024 / Joi 2025 / Chicken Connection 2024). All copy is in English and project names use Latin script. The author's bar equipment and station fabrication studio is named **Pacific**. The public start page (`.gate-page` → `.gate-stage` + `.gate-info`) states what the course is. The full author-project archive remains available from the About the author pop-up after course access; cases and leading industry figures remain in the Cases section/page.

## Run locally / deploy on BotHost

A **Node.js-served web app** (not Python). No npm packages are required; Node 18 or newer is sufficient.

```bash
npm start          # http://0.0.0.0:$PORT (default 3000)
npm run check      # syntax check: server.js, app.js, access.js, author.js, course-data.js
npm test           # English-only copy, author/figure separation and API regression checks
```

The server binds to `0.0.0.0`, serves the site, exposes `/healthz`, verifies Telegram `initData` and enforces the course password. Opening `index.html` as a `file://` URL is not supported; use the server so cookies, storage and assets work correctly.

On BotHost, set a private `COURSE_PASSWORD`, a stable `ACCESS_SECRET`, the Telegram `BOT_TOKEN`, `BOT_USERNAME`, and `ADMIN_IDS` (comma- or space-separated Telegram numeric user IDs). For paid delivery, set `TRIBUTE_API_KEY` and configure the matching Tribute IDs and HTTPS links: `TRIBUTE_PRODUCT_ID` with `TRIBUTE_PRODUCT_URL` for lasting one-time access, and/or `TRIBUTE_SUBSCRIPTION_ID` with `TRIBUTE_SUBSCRIPTION_URL` for recurring access. Optional display prices are `TRIBUTE_PRODUCT_PRICE` and `TRIBUTE_SUBSCRIPTION_PRICE`; `COURSE_URL` adds an Open Course button. BotHost supplies `PORT`. Secrets stay server-side; never put bot tokens, passwords or the Tribute key in front-end code.

## Telegram launch

The responsive site can be opened directly on its HTTPS domain or launched inside Telegram as a **Mini App**. Point your bot's `web_app` button (or menu button) at the deployed URL. The front end detects Telegram's Web App SDK, calls `ready()` / `expand()`, syncs the viewport and header colours (both on the password gate and inside the course), and uses Telegram's back button when available. The public Mini App URL must use HTTPS.

When launched inside Telegram, the client initializes the Web App SDK. After course access is established with a valid password, the app can verify the SDK's signed `initData` at `POST /api/telegram-auth` using `BOT_TOKEN` and attach the Telegram identity to the profile. This verification does not bypass the password gate. `ADMIN_IDS` is used to authorize private admin-bot chats; configure the menu or launch button in BotFather.

## Learner and admin sessions

There are no public demo profiles, link-based previews, manual password-generation tools or secondary email/password logins. A personal password is issued only after a verified Tribute payment; the configured master password is reserved for administrators. Learning progress and quiz state are saved in the browser (`localStorage`). Confirmed payment, password-delivery and order records are stored server-side in `data/store.json`; uploaded assignment files are kept in `data/uploads/`.

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
- **Admin view** for Tribute setup readiness, signed-webhook payment events, password-delivery status, paid-learner summaries and the Telegram admin-command console.
- Responsive desktop and mobile navigation, search across course content, accessible form labels, keyboard-operable controls, reduced-motion and print styles.
- **Photography is shown whole.** Source frames are mostly 3:4 / 4:5 phone photographs, so content images (case cards, project cards, galleries, creator and budget frames, the hero plate) render at their natural proportions instead of being cropped to a fixed-height strip. Only surfaces that are treated as background fields — hero on mobile, the gate/login visual, the case feature band, module and lesson banners — are cropped, and their `object-position` is set deliberately.
- Existing course materials and photography remain available; the new UI uses the existing hospitality imagery and does not present the HIM or SEG logos as a claim of institutional endorsement.

## Language and editorial boundaries

The gate, Tribute instructions, author dialog, lessons, captions, project archive, administration, Telegram Access Bot and downloadable materials are English-only. Cyrillic name duplicates and translated project/caption fields are not shipped. The deck builder produces the English PDF only; there are no alternate-language course handouts or decks.

The author dialog contains the author’s own career and projects. Perfect Bars Team’s venues belong in Ivan Lyashuk’s and Vladimir Nikolaev’s industry profiles; Artender is identified as a media and creative-community project, not a sixth bar. These profiles link to the team’s primary sources. Original documentary photographs are preserved unchanged, including any signage visible within them.

`npm test` guards the language and attribution rules, password-only access, signed Tribute webhooks, duplicate-payment handling and Telegram delivery.

## Content, architecture and boundaries

- `access.js` owns the password gate and boots `app.js` (`window.bootCourse`) only after `course-data.js` has been unlocked and loaded.
- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files, the `projects` archive (seven files with captioned photography) and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text.
- The original photographs live in the repository root (`IMG_*.jpeg`, `IMG_8809.png`) and are never referenced directly by the app. `presentation/build/build_project_assets.py` derives the optimised, metadata-free web set (`presentation/assets/project-*.jpg|png`, max edge 1400 px) from them, so the camera files stay untouched and the shipped assets stay small and stably named. Re-run it after adding photographs: `python3 presentation/build/build_project_assets.py`.
- The initial generic domain is: **Institution → User / Enrollment → Course → Edition → Module → Lesson**; learning and operations entities include **Video, CaseStudy, ReadingMaterial, Assignment, Submission, Feedback, Quiz, Question, Answer, Progress, Certificate, License, CourseUpdate, Notification**.
- Progress and quiz records are scoped to user and edition. Submissions record the student and edition context; an institution-scoped instructor review view is the intended authorization boundary.
- Course content and author IP remain separate from the institution's licensed access. A new edition can evolve independently, without overwriting existing edition records.
- `course/` is the English-only source library for the full syllabus, lectures, assignments and case material, including Module 6 — Budget Realisation & Scenography, the Joi Espresso Bar and Pacific cases, and the mockup brief. `presentation/` is the reproducible proposal-deck project.

### Important production boundary

The Node service verifies Tribute webhook signatures, issues password sessions with a signed `HttpOnly` cookie, and can run the customer Access Bot and admin commands through the Telegram Bot API. It persists passwords, Tribute orders and submissions in `data/store.json` and uploaded files in `data/uploads/`. It still has **no database, persistent server-side learning API, content-management service or production-grade file storage**: learning progress and quiz state remain browser-local and editable. Before using it for real student work, add a database-backed learning API, secure upload storage, retention/backup policies and monitoring. Keep the JSON store and uploaded files on persistent host storage.

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

A valid individual password or the configured administrator password opens the course immediately. All 13 learning units and all modules are available at once; assignment review never gates lesson access. Students can submit the practical assignment from each lesson, add text, a link and files in the app, and receive feedback. Help/reference email: `egor.tarasenko@him-mail.ch`.

The Tribute integration is event-driven, not a fake checkout. A signed `new_digital_product` event grants lasting access; `new_subscription` issues access through its verified `expires_at`, `renewed_subscription` extends that date, and `cancelled_subscription` stops renewal while preserving access only through Tribute’s reported expiry. Each confirmed buyer receives an individual password through the Access Bot. In the Tribute creator dashboard, set the webhook URL to `https://YOUR-DOMAIN/api/tribute/webhook`. Set `TRIBUTE_API_KEY` to the key used to sign webhooks. Configure `TRIBUTE_PRODUCT_ID` with `TRIBUTE_PRODUCT_URL` for the one-time product and/or `TRIBUTE_SUBSCRIPTION_ID` with `TRIBUTE_SUBSCRIPTION_URL` for a recurring plan. The matching purchase CTA remains disabled until its Tribute ID and link, webhook verification, bot token and bot username are all configured.

The buyer should start the Access Bot before paying. If the bot cannot deliver the first message, delivery stays pending; `/start` retries it and `/password` resends an issued code. Admin commands include `/orders`, `/resend <telegram_id>`, `/students`, `/pending`, `/approve` and `/revise`. Password generation without a confirmed Tribute event is intentionally unavailable. The admin dashboard also shows Tribute setup readiness, recent payment events and delivery status. Run with `npm start`; run syntax checks with `npm run check` and regression tests with `npm test`.
