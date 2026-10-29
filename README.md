# CONTEMPORARY HORECA SCENE

**Contemporary Horeca Scene** — a living digital elective for Hotel Institute Montreux, created by **Egor Tarasenko**, HIM alumnus and Master in Business Management.

> A digital elective that reads the contemporary horeca scene through rankings and awards, design, neurogastronomy, technology and entrepreneurship — and ends with a live found-object mockup assembled from antique tableware, candles, vintage glassware, found props and a physical menu concept.

## Access and payment flow

The start page offers **Sign in** and a **Get access on Tribute** button beside the login form, with instructions for obtaining a password. Set `TRIBUTE_PRODUCT_URL` to the course purchase link (HTTPS); without it, the page shows an email support fallback. All purchases happen in Tribute, outside the course. A signed Tribute webhook records payment; manual admin approval in the Telegram bot is required before account registration.

A signed Tribute webhook records a paid purchase and creates a pending admission; it does not activate course access automatically. Immediately after the verified payment the buyer receives a convenient start link in the bot — a two-button message that opens the course start page (`COURSE_START_URL`, falling back to `COURSE_URL`) and the shared registration page — while registration itself stays locked until approval; set `PAYMENT_START_MESSAGE=false` to send that link only after approval. The course owner checks the payment in Tribute and manually approves or rejects the learner in the Telegram bot (`/admissions`, then `/admit STUDENT_ID` or `/reject STUDENT_ID`, or the inline approval buttons). Once approved, the bot sends the same reusable shared registration-page link to the learner again, now with an additional button that opens the course. During registration, the learner enters the Telegram username or numeric ID approved by the admin, plus name and email, and chooses a personal password. There is no per-purchase token or link expiry. A forgotten password cannot be recovered or resent; support is available only by email at `egor.tarasenko@him-mail.ch`. A learner can send `/register` to the Access Bot to request admission or delivery help.

Buyers should open the Access Bot and tap **Start** before purchasing, because Telegram does not let a bot initiate a private conversation. A signed HTTPS webhook to `POST /api/tribute/webhook` verifies `trbt-signature`, matches the configured Tribute product or subscription ID, creates a pending manual-review request and safely processes duplicate events. The signed-in session is remembered on that device for 30 days. `/course-data.js`, `/course/`, `/presentation/dist/` and `/presentation/build/` remain protected until access is verified. Repeated incorrect entries are throttled (`429` after 20 attempts per 10 minutes); the master-password check occurs before throttling so learner mistakes behind a shared proxy cannot lock out the administrator. The administrator uses a private `COURSE_PASSWORD`; set a stable `ACCESS_SECRET` in production.

**Payment transparency for students (SEG and partner institutions).** The master `COURSE_PASSWORD` signs in as **ADMIN only** and never grants a student account. The learner profile shows the verified Tribute purchase record—product, amount, date, purchase ID and provider—through `myPurchase` in `/api/state`. Tribute handles checkout, card data, receipts and refunds; the course app neither collects card data nor offers a payment flow. Subscription access follows Tribute's verified expiry; a one-time product purchase grants lasting access.

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

The **course author is credited inside the product** (footer, profile, certificate small print, instructor identity) but his **name is not shown on the title visuals** — hero, sign-in visual, deck cover. The **author bio and selected projects live in a pop-up, not a standalone landing-page block**: `author.js` opens a dialog from the clickable “About the author” controls on the access page, landing page, dashboard and app header. It lists only the author’s international experience (Sakhalin 2015 → Thailand 2019 → Switzerland 2019 → Dubai 2021 → St Petersburg 2022), beginning with his first steps in HoReCa as a waiter, and five own projects as drawn illustrations, each redrawn from an archive photograph and captioned with only a name and year (Passie Cakes Co. 2022 / CooCoo 2024 / Pacific 2024 / Joi 2025 / Chicken Connection 2024). All copy is in English and project names use Latin script. The author's bar equipment and station fabrication studio is named **Pacific**; its **Mirain** station line is equipped with dedicated pumps built into the station that cut preparation to seconds. The public access page (`.gate-page` → `.gate-stage` + `.gate-info`) describes the shared registration flow, the manual approval step, student FAQ and sign-in. The full author-project archive remains available from the About the author pop-up after course access; cases and leading industry figures remain in the Cases section/page.

## Run locally / deploy on BotHost

A **Node.js-served web app** (not Python). No npm packages are required; Node 18 or newer is sufficient.

```bash
npm start          # http://0.0.0.0:$PORT (default 3000)
npm run check      # syntax check: server, app, access, course data, admin console and site copy
npm test           # English-only copy, author/figure separation and API regression checks
```

The server binds to `0.0.0.0`, serves the site, exposes `/healthz`, verifies Telegram `initData` and enforces the course password. Opening `index.html` as a `file://` URL is not supported; use the server so cookies, storage and assets work correctly.

On BotHost, set a private `COURSE_PASSWORD`, a stable `ACCESS_SECRET`, the Telegram `BOT_TOKEN`, `BOT_USERNAME`, and `ADMIN_IDS` (comma- or space-separated Telegram numeric user IDs). For paid delivery, set `TRIBUTE_API_KEY` and the matching Tribute product ID and/or subscription ID. Set `TRIBUTE_PRODUCT_URL` to the HTTPS Tribute purchase link shown on the public start page. Optional price values (`TRIBUTE_PRODUCT_PRICE`, `TRIBUTE_SUBSCRIPTION_PRICE`) are fallbacks only; signed webhook amounts take precedence. `COURSE_URL` is the public HTTPS course origin used for the shared registration page and course links; the optional `COURSE_START_URL` (`COURSE_APP_URL` and `START_URL` are accepted aliases) is the bot's immediate post-payment start link and falls back to `COURSE_URL` when empty. BotHost supplies `PORT`. Secrets stay server-side; never put bot tokens, passwords or the Tribute key in front-end code.

## Telegram launch

The responsive site can be opened directly on its HTTPS domain or launched inside Telegram as a **Mini App**. Point your bot's `web_app` button (or menu button) at the deployed URL. The front end detects Telegram's Web App SDK, calls `ready()` / `expand()`, syncs the viewport and header colours (on the sign-in page and inside the course), and uses Telegram's back button when available. The public Mini App URL must use HTTPS.

When launched inside Telegram, the client initializes the Web App SDK. After course access is established with a valid password, the app can verify the SDK's signed `initData` at `POST /api/telegram-auth` using `BOT_TOKEN` and attach the Telegram identity to the profile. This verification does not bypass the password gate. `ADMIN_IDS` is used to authorize private admin-bot chats; configure the menu or launch button in BotFather.

## Learner and admin sessions

There are no public demo profiles, manual password-generation tools or payment links in the course app. The registration page is shared and reusable, but the server creates an account only for a Telegram identity manually approved by the course admin after payment verification. The learner sets a personal password during registration; passwords are stored as scrypt hashes. The configured master password is reserved for administrators. Learning progress and quiz state are saved in the browser (`localStorage`). Confirmed payment, admission, chat and order records are stored server-side in `data/store.json`; uploaded assignment files are kept in `data/uploads/`.

### Opening modules and learning units in restrictive browsers

Course content is protected server-side, and not every client keeps the session cookie: Telegram on iOS, in-app WebViews and third-party iframes routinely drop it, so a `<script src="course-data.js">` request was answered `403` after a successful sign-in and the learner stayed on the sign-in screen with no module or learning unit to open. The content file is therefore loaded with the `X-Access-Token` header first and the signed cookie only as a fallback; when neither is available the gate reports that the content could not be read instead of showing an empty course.

Navigation no longer depends on a single browser event either. Every click on an internal `#/…` link is confirmed by the router: if the browser does not move the address (WebViews that do not deliver `hashchange`), the app navigates and paints the screen itself. `popstate` is handled as well, so back and forward keep working. The address `#/dashboard` that the gate opens after sign-in now renders the space that matches the session — student dashboard, administrator panel or instructor overview — instead of the access-restricted screen. A screen that still fails to build shows the display-error notice with a route back, and a course app that cannot start at all reports it on the gate.

## Course structure (2026 edition)

Ten modules / twelve learning units, authored in `lessons.txt` and published from `course-data.js`:

| # | Module | Lessons | Focus |
|---|---|---|---|
| 01 | Hospitality Futures | 01 | Reading the signals reshaping the industry — rankings, awards and juries |
| 02 | Experience Design | 02 | Atmosphere, service choreography — and the “sweet fairy tale” principle |
| 03 | Neurogastronomy | 03 | Perception, gastrophysics, vessel weight, multisensory serves |
| 04 | Restaurant & Bar Concepts & 50 Best Menu Breakdown | 04–05 | Concept manifestos, 50 Best menus, concept objects |
| 05 | Technology & Automation | 06 | Automation, ergonomics and The Horeca Code |
| 06 | AI in Hospitality | 07 | AI workflows, the R&D matrix and an ethics charter |
| 07 | Food & Beverage Futures | 08 | Ingredient-led menus, the farm-to-glass apothecary |
| 08 | Entrepreneurship | 09 | From idea to operating model and a talent ecosystem |
| **09** | **Budget Realisation, Scenography & Found-Object Mockup** | **10–11** | **Found objects and flea markets, theatrical techniques, the live mockup** |
| 10 | Final Challenge | 12 | “Open & Operate”, defended together with the mockup |

The lesson text in `course-data.js` is generated from the authored source rather than typed twice. The tool also emits each lesson's header (`illo-lesson-<lesson-id>.jpg`) and the curated challenge text, so a rebuild keeps the published course byte-identical — the check when the file is touched by hand is `node tools/build-course-lessons.js` followed by `git diff --quiet course-data.js`:

```bash
node tools/build-course-lessons.js --dry   # preview the parsed lessons
node tools/build-course-lessons.js         # rewrite the modules array in course-data.js
```

Module metadata (ids, covers, key ideas, cases, challenges) is curated inside the tool, so re-running it after an edit to `lessons.txt` keeps the published course in sync.

Lesson bodies keep a deliberately small Markdown subset so students read a structured page rather than an undifferentiated wall of prose. The build tool preserves the structure from `lessons.txt` and the app renders it:

| Source | Rendered as |
|---|---|
| `## Section` / `### Sub-heading` | Section heading / red micro-label |
| `**bold**`, `*italic*` | Inline emphasis inside a paragraph |
| `- item`, `1. item` | Bulleted or numbered list |
| A paragraph written entirely in bold | Large serif pull-quote highlight |
| `*Single italic line*` | Note or figure caption |
| `<text>` / `<ins>` blocks | Figure caption / labelled principle |
| Table rows | Definition-style bullet list |

The page also prints the lesson standfirst in serif italic and keeps the key ideas beside the reading. Image placeholders (`<AsyncImage…>`) are dropped from the published body. Administrators can still override `body` in the Telegram console with plain prose; unmarked text renders as ordinary paragraphs.

### Module 09 — Budget Realisation & Scenography

Two learning units (10–11):

1. **Soul before budget** — a venue does not need a large budget to feel alive; it needs a point of view and the patience to hunt for objects that carry one. Sourcing discipline (flea markets, auctions, demolition yards, liquidations, the street), repair / reuse / re-upholstery, and the case of **Joi Espresso Bar** — the author's own project, assembled almost entirely from the street and flea markets. *Money buys speed and finish; intention buys soul.*
2. **Theatrical techniques & the live found-object mockup** — scenography borrowed from the stage: painted flats, forced perspective, backdrops, scrim and gauze, trompe-l'œil, glazing, patina, distressing, stencil and gold leaf, faux bois / faux marbre, drapery, haze and one tight beam of light. A theatrical trick must support the story and never announce itself.
The photographic archive behind the method — **Joi Espresso Bar** (2025 · OGONEK TEAM), **Passie Cakes Co.**, **CooCoo Coffee**, **Chicken Connection** (Moscow, filmed with Dmitry Konnikov), **Pacific** and the **TAM / TYT** object line, plus the collecting file of found details — stays in the Projects section of the app, where students can still read what was bought, what was found and what was made.

Module 04 also gained a learning unit, **Concept objects: the menu, the merchandise, the furniture**, reading the same archive through the takeaway object: a menu that leaves the venue, flavour cubes that teach a drinks list, and bar stations drawn for the workshop.

**Final exercise:** every student stages a live physical mockup directly from found objects — antique tableware, candles, vintage glassware, found textures and props, and a physical menu concept — at 1:20 or 1:50. It is a set rather than a plan: entrance, first sightline, light source, and the details that carry the atmosphere. Photograph it at guest height for the final pitch.

**Operating principle of the course:** a bar or a restaurant is a sweet fairy tale — for two hours the guest agrees to believe in a world the team built, and any small detail (a harsh light, a plastic tray, a visible printer, a dirty door handle) can instantly wake them from that dream.

## Product experience

- **Public start page** (SEG-styled split screen: gate visual + sign-in / shared registration requiring manual Telegram approval) followed by course information, the student FAQ and a clickable About the author pop-up. It includes an external Tribute purchase CTA and password guidance. Once access is granted, the editorial landing page covers the elective's positioning, subject areas, learning sequence, case files, the fairy-tale principle, the budget & scenography block, ten-module structure and final challenge. Cases and leading industry figures remain available together on the Cases page.
- **Projects of the author** (`#/projects`, `#/project/<id>`) — 43 photographs across seven project files: Joi Espresso Bar, Passie Cakes Co., CooCoo Coffee, Chicken Connection, Pacific, TAM / TYT and a found-object research file. Each file carries facts, an English explanation and a captioned gallery with a keyboard-accessible lightbox. The full archive is reached via the About the author pop-up rather than a separate main-navigation item; its photographs also remain course evidence in the relevant cases and modules.
- **Student space** with course progress, next lesson, modules, editorial lesson pages, case studies, private real-time Project Q&A, assignment submissions (concept + mockup photographs, in-app or by email to the instructor), quiz, feedback, updates and a printable certificate.
- **Instructor space** for reviewing work, assigning a score, providing feedback and approving or returning submissions for revision.
- **Admin view** for Tribute setup readiness, pending manual approvals, signed-webhook payment events, shared-link delivery status, private Project Q&A and the Telegram admin-command console.
- Responsive desktop and mobile navigation, search across course content, accessible form labels, keyboard-operable controls, reduced-motion and print styles.
- **Photography is shown whole.** Source frames are mostly 3:4 / 4:5 phone photographs, so content images (case cards, project cards, galleries, creator and budget frames, the hero plate) render at their natural proportions instead of being cropped to a fixed-height strip. Only surfaces that are treated as background fields — hero on mobile, the gate/login visual, the case feature band, module and lesson banners — are cropped, and their `object-position` is set deliberately.
- **Image sources are credited.** The access-page visual, course landing hero and selected module covers draw on close-detail Joi and Pacific photographs from the author’s archive, presented in full color with a close-detail, film-inspired tone treatment. Source files are unchanged; this is a visual style, not a claim that the originals were shot on a professional film camera. Supporting photos, including open-source editorial references, are shown in full color and may receive only a light CSS tone adjustment in the browser; original image files remain untouched, and their photographers and venues retain copyright. Source links and rights notes appear on the in-app `#/credits` page. Illustrative archive images are explicitly marked as *not* depicting the venue discussed; the HIM logo is © Swiss Education Group. A few author-archive photographs (`*-ai.jpg`) have separate **subtle AI exposure and shadow-detail recovery, composition untouched** — each is labelled “AI-PROCESSED” under the image and on `#/credits`.
- Existing course materials and photography remain available; the new UI uses the existing hospitality imagery and does not present the HIM or SEG logos as a claim of institutional endorsement.

## Language and editorial boundaries

The public access page, registration guidance, author dialog, lessons, captions, project archive, web administration, Telegram Access Bot and downloadable materials are English-only. Cyrillic name duplicates and translated project/caption fields are not shipped. The deck builder produces the English PDF only; there are no alternate-language course handouts or decks.

The single sanctioned exception is the **private Telegram admin console** (`admin-bot.ru.js`): a Russian-language inline-button panel requested by the course owner for his own bot. It is required only by `server.js`, is never referenced by `index.html`, `app.js` or `access.js`, and therefore never reaches learners; the test suite asserts both that it stays server-side and that it remains Russian.

The author dialog contains the author’s own career and projects. Perfect Bars Team’s venues belong in Ivan Lyashuk’s and Vladimir Nikolaev’s industry profiles; Artender is identified as a media and creative-community project, not a sixth bar. These profiles link to the team’s primary sources. Original documentary photographs are preserved unchanged, including any signage visible within them.

`npm test` guards the language and attribution rules, shared registration with manual approval, signed Tribute webhooks, duplicate-payment handling, chat privacy and live delivery.

## Content, architecture and boundaries

- `access.js` owns the sign-in / shared-registration gate and boots `app.js` (`window.bootCourse`) only after `course-data.js` has been unlocked and loaded.
- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files, the `projects` archive (seven files with captioned photography) and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text. Lesson `body` fields may use blank lines to separate paragraphs; `prose()` in `app.js` escapes and renders each paragraph, so course copy never injects raw HTML.
- The original photographs live in the repository root (`IMG_*.jpeg`, `IMG_8809.png`) and are never referenced directly by the app. `presentation/build/build_project_assets.py` derives the optimised, metadata-free web set (`presentation/assets/project-*.jpg|png`, max edge 1400 px) from them, so the camera files stay untouched and the shipped assets stay small and stably named. Re-run it after adding photographs: `python3 presentation/build/build_project_assets.py`.
- The initial generic domain is: **Institution → User / Enrollment → Course → Edition → Module → Lesson**; learning and operations entities include **Video, CaseStudy, ReadingMaterial, Assignment, Submission, Feedback, Quiz, Question, Answer, Progress, Certificate, License, CourseUpdate, Notification**.
- Progress and quiz records are scoped to user and edition. Submissions record the student and edition context; an institution-scoped instructor review view is the intended authorization boundary.
- Course content and author IP remain separate from the institution's licensed access. A new edition can evolve independently, without overwriting existing edition records.
- `course/` is the English-only source library for the full syllabus, lectures, assignments and case material, including Module 6 — Budget Realisation & Scenography, the Joi Espresso Bar and Pacific cases, and the mockup brief. `presentation/` is the reproducible proposal-deck project.

### Important production boundary

The Node service verifies Tribute webhook signatures, keeps paid learners pending until manual admin approval, issues the shared registration page, hashes personal passwords with scrypt, issues signed `HttpOnly` session cookies and runs the customer Access Bot and admin commands through the Telegram Bot API. It persists password hashes, admission and chat messages, Tribute orders and submissions in `data/store.json`; uploaded files live in `data/uploads/`. It still has **no database, persistent server-side learning API, content-management service or production-grade file storage**: learning progress and quiz state remain browser-local and editable. Before using it for real student work, add a database-backed learning API, secure upload storage, retention/backup policies and monitoring. Keep the JSON store and uploaded files on persistent host storage.

## Original course proposal

The educational proposal is a 12-week, 36-contact-hour elective in English for BBA/MIB students. Its syllabus now runs to **six modules** — the original five plus *Budget Realisation & Scenography* (weeks 11–12) — with the mockup defended at Final Pitch Day. Grading model and reading list remain in `course/`.

The course brings together hospitality futures, experience design, neurogastronomy, restaurant and bar concepts, technology, AI, food & beverage, entrepreneurship and budget realisation. Its through-line is a student-designed hospitality concept, developed to a final pitch and a physical mockup.

## Proposal deck

`presentation/dist/Contemporary-Horeca-Scene-Course-Pitch-EN.pdf` is the English-only proposal deck. It describes the elective as it was proposed — twelve weeks, six modules — and is deliberately not a description of the shipped app, which publishes ten modules and twelve learning units; the deck is the case for the elective, the app is the elective. Its sources use the SEG palette, keep the author off the cover, and include Module 6 and the mockup in the course map, week plan, assessment and final project slides. Rebuild the deck after changing its sources:

```bash
python3 -m venv .venv
.venv/bin/pip install -r presentation/build/requirements.txt
.venv/bin/python presentation/build/build_deck.py
```

The deck generator prefers Inter when available through `HIM_FONT_DIR`, with DejaVu Sans as a fallback.


## Access, lessons, submissions and administration

A learner account is created only when `/api/register` receives a Telegram username or ID matching a manually approved admission. Registration collects a name and unique email address, then stores a scrypt hash of the learner-created password. `/api/access` signs in registered learners using email and password; the configured master password opens the admin account only. All 12 learning units and all modules are available at once; assignment review never gates lesson access. Students can submit the practical assignment from each lesson, add text, a link and files in the app, and receive feedback. Forgotten-password recovery is handled only by email at `egor.tarasenko@him-mail.ch`.

The Tribute integration is event-driven, not a checkout embedded in the course app. A signed `new_digital_product` event grants lasting access; `new_subscription` issues access through its verified `expires_at`, `renewed_subscription` extends that date, and `cancelled_subscription` stops renewal while preserving access only through Tribute’s reported expiry. In the Tribute creator dashboard, set the webhook URL to `https://YOUR-DOMAIN/api/tribute/webhook`, set `TRIBUTE_API_KEY`, and configure the relevant `TRIBUTE_PRODUCT_ID` and/or `TRIBUTE_SUBSCRIPTION_ID`. The public start page links to external checkout using `TRIBUTE_PRODUCT_URL`; checkout is not embedded in the app.

The buyer should start the Access Bot before purchasing. The webhook creates an admission request and instantly hands the buyer the start-link message described above; the course owner verifies the payment and runs `/admit <student_id>` before the account can actually be registered on the shared page. `/register` requests admission, resends the start link to a paid buyer, or resends the shared page after approval. `/password` never reveals a password and directs the learner to email support. Admin commands include `/admissions`, `/admit`, `/reject`, `/orders`, `/resend <telegram_id>`, `/students`, `/pending`, `/approve` and `/revise`; `/chat` opens the Project Q&A inbox. The app's private Project Q&A page stores individual student/team threads and delivers new messages live over authenticated server-sent events. Telegram admins receive a notification when a learner asks a question, and replies appear live in the learner's chat. The FAQ explains how to use it. The admin dashboard shows pending admissions, Tribute setup readiness, recent payment events, link-delivery status and the latest editor changes. Run with `npm start`; run syntax checks with `npm run check` and regression tests with `npm test`.

### Content editor in the admin bot

The same admin bot edits the live course without a redeploy. `/addmat <module> <https url> <short description>` adds an extra reading to a course block; materials are stored per module and rendered at the end of that module block inside the course (never as a separate window). `/editmat <id> [new url] <new description>`, `/delmat <id>` and `/materials [module]` manage the library. `/post <title> | <text>`, `/posts` and `/delpost <id>` publish or remove live updates on the Updates page. `/editmodule <module> [title|description] <text>` and `/editlesson <lesson> [title|intro|body|challenge] <text>` override published copy in `course-data.js` until `/revert <id>` (or `/overrides` to list) restores it. Module arguments accept an id (`budget`), a number (`09`) or any lesson id inside the block.

The open app picks editor changes up automatically: it re-checks `/api/state` every 30 seconds and whenever the browser tab regains focus, applies new materials, posts and copy overrides, and re-renders the current page. An input in progress is never interrupted — the refresh waits until the learner stops typing.

### Russian inline-button admin console

The same bot is a Russian admin panel driven entirely by inline keyboards (`admin-bot.ru.js`). After `/admin <master password>` (or `ADMIN_IDS`) the admin gets a button menu: 📋 submissions (approve / request revision with typed feedback, detail view), 👥 students, 💳 Tribute payments, 📚 materials and 📣 announcements (add/remove through guided input), ⚙️ status and ↩️ the override journal with one-tap revert.

The block editor (the "Course blocks" menu, shown in Russian inside the bot) rewrites any existing block without a redeploy: the password gate and the landing page (editable copy lives in `site-copy.js`, merged server-side at the public `GET /api/site` and applied in the browser), every module and lesson (title, description / intro / body / challenge, and the cover image), plus cases, industry figures and author projects. Pressing a field button opens a deferred input — the next message saves the override; `/cancel` aborts. Edited fields are marked in the menus, each block has a reset button, and legacy English text commands keep working for scripting and the web console.

### Photo replacement in the admin bot

Every image block can be replaced with a photograph sent in the Telegram chat — no redeploy and no file paths to remember. The 🖼 **Photo & backgrounds** section collects the gate background, the landing hero, the budget and mockup photographs, module covers, lesson frames, case photos, figure portraits and project covers / lead photos; the 📷 buttons inside any block do the same for that block. After tapping an image field the bot waits for the next message: a photo or an image file becomes the new picture, while an https link or an archive file name (for example `project-joi-bar.jpg`) still works as text. Uploads are validated (JPEG / PNG / WebP, up to 8 MB, magic-byte checked), stored in `data/uploads/`, registered in 🖼 **Media library** (`editor.media` in `data/store.json`) and served publicly from `/media/<file>` with immutable caching. The bot answers with a preview of the saved photo plus "replace again" and "revert" buttons; deleting a photo from the media library also clears every block that pointed at it, restoring the published image. Uploaded photographs are credited in the app as `PHOTO · UPDATED BY THE COURSE TEAM` and are never listed in the *Image sources & rights* archive credits.

### Course image restyle — active

**Current art direction:** the latest cafe-poster series supersedes the earlier cobalt engraving direction. Redraw each image from its own existing course image, keeping the person, venue, objects and main composition recognisable. Match `style-ref-1.jpeg`, `style-ref-2.jpeg` and the completed `illo-m01-signals.jpg`: cheerful, slightly irregular black ink outlines, flat gouache-like colour, a white background and one small signal-red accent. Do not introduce invented text or logos, replace a specific subject with a generic one, or apply a blanket filter. Keep the published filenames and pixel dimensions stable.

**Two tests before any drawing is published — October 2026.** Both failures below have now happened
once, so they are written down as rules rather than warnings.

*Resemblance must be obvious, not arguable.* Put the drawing and its own photograph side by side at the
same size and ask someone who has not read the caption to name the venue or the person. If they need the
caption, the drawing is not finished. The anchors to check, in this order: the person's hair, beard, age
and clothes; the room's dominant pair of colours; the counter or table material; the one object that
identifies the venue; the light logic — a black room stays black, a neon room keeps its neon, a bright
room stays bright. A drawing that swaps a white jacket for a waistcoat, or a blue night for beige, has
lost the resemblance even if every other line is right.

*One hand drew the whole series.* Before publishing, put the new file beside `illo-m01-signals.jpg` and
`illo-case-black-swan-bobkov.jpg`: it has to look like the same artist on the same day. One even ink
contour of the same weight across the frame, flat gouache fills with no rendering, no gradients, no
airbrush, no photographic shading, no coloured backdrop, no drop shadow, white paper, one small
signal-red accent, no lettering. A new drawing that is more photographic, smoother or thinner than the
series is drift, not an improvement — and it is drift even when the individual picture is good.

*Drift is repaired once, at the end.* When several new files come in thinner than the rest, do not
re-render them one at a time; leave them as they are and make a single unifying pass over the whole
series when the batch is closed, so the correction is the same everywhere.

**Lesson headers — redrawn as sketch pages, 29 October 2026.** Each of the twelve lessons opens with its own header image (`illo-lesson-<lesson-id>.jpg`, 1264 × 843), and the whole set was redrawn in a different hand from the module covers: one loose cloud of the lesson's objects on a pure white page, dense pencil, one small signal-red mark, no lettering. The set is described in *The lesson sketch pages* below and the two tests above still govern it — obvious subject, one hand across the twelve. The pinned count in `tests/english-content.test.js` is fifty-two, and a lesson that loses its own `thumbnail` key now fails the suite instead of quietly borrowing the module cover.

**Revised subjects — October 2026.** The ten module covers keep exactly this drawing style but their subjects are brought up to date: the warm book-illustration scenes (striped awning, chalkboards, craft clutter, a friendly robot with an antenna) were replaced with present-day equivalents — glass-front cafe pavilions, blank touchscreen kiosks, floating blank panels, sensor bases, a wheeled service robot with a blank visor, a farm-to-glass testing bench and a designer's bench with a cut-card model. **Ergonomics is drawn as futuristic**, not vintage: `illo-m05-automation.jpg` puts a translucent anatomical study doll with joint rings and unnumbered dimension lines beside a wafer-thin cantilevered console with a glass end panel, a recessed well, hanging bottles and a slim three-joint service arm. Screens, notes, tags, rulers and panels stay blank or carry ruled lines only; no frame in this series contains lettering, numerals, logos or interface copy. The previous ten covers are kept at `presentation/assets/originals/illo-m/` as the reference for the series.

**Progress — the series is closed: 52 of 52 publishable targets drawn.** A target was any asset in `presentation/assets` that could responsibly carry a drawn twin. Fifty-two `illo-*` files are published — hero, gate, ten module covers, **twelve lesson headers**, twelve case covers, eleven practitioner portraits and five author-dialog illustrations — and everything else is excluded by decision rather than left undone:

- The author's own project archive (`project-*`, 43 photographs): photographs only, at the author's instruction. The seventeen gallery drawings and six drawn covers that had been published were withdrawn on 28 October 2026 (see below).
- The three `web-insider-*` files: documentary photographs of another venue, Insider Bar Lab, credited to © Insider Bar / @insider.bar.lab with a takedown contact. They are someone else's room, photographed by someone else; redrawing them would put an interpretation of a third-party venue into the course, so they stay as credited photographs.
- The twelve `studio-*` plates: the author's own studio photography — the gate still life, the landing hero and ten module plates. The app never references them (`tests/english-content.test.js` asserts the string `studio-` reaches neither the app, the gate nor the course data), so they carry no drawn twin and are recorded here instead.
- The two logos (`project-pacific-logo.png`, the HIM / SEG marks): brand marks, never redrawn.
- The twelve documentary `case-*` photographs, the five `author-*` archive frames and the 18 `horeca-*` deck images: evidence, or deck-only, not art.

Every published illustration follows the art direction above; the asset index and the prompt sheet list them file by file:

- Done previously: `illo-hero-scene.jpg`, `illo-gate-still-life.jpg`, `illo-m01-signals.jpg` through `illo-m10-mockup.jpg`, `figure-jiro.jpg`, `project-passie-room.jpg` and the first ten `illo-case-*.jpg` covers (each originally redrawn from its own earlier cover art at 1264 × 848; the case-file photographs were not changed).
- Revised in this batch: the case-card set is now complete at twelve. The last two cards were redrawn from their own case photographs — `illo-case-krasota-zarkov.jpg` follows the 360° projected table of Krasota, its black central void, the seascape spread across the tabletop and the ring of guests against the curved screen of sea and blossom; `illo-case-dave-arnold.jpg` follows Dave Arnold mid-shake, the stainless shaker held overhead, the coupe glass in the lower hand and a curl of vapour between them. Two cases that had a drawn card missing now have one: `illo-case-alex-kratena.jpg` — the gilet, the clear glasses, the cap, the tattooed forearm and the second figure waiting in the corridor of Tayēr + Elementary — and `illo-case-rene-redzepi.jpg`, the chef laughing with both hands on his hips, herbs rising from the apron pocket. Both are pinned as `cover` on their case files, which keep the illustrative archive photograph they already published, and both are drawn from the editorial portraits retained at `originals/case-alex-kratena.jpg` and `originals/case-rene-redzepi.jpg` — so the app labels them *illustration · AI-generated from an editorial portrait* rather than from the case photograph, and the credits statement says the same. The earlier direction was also recalibrated: line weight thinned to an even contour, fills flattened, interiors left white, and a single signal-red accent per frame, so the whole drawn set reads as one poster series rather than a set of filtered photographs.
- Reverted on 28 October 2026 — the project archive is photographs only. At the author's instruction the drawn project set was withdrawn: the seventeen framed drawings and six drawn project covers (23 `illo-project-*` files) were deleted, every `project-*` file opens again with its own lead photograph, and each file carries only its photographs, captions and credits. Nothing about the photographs, captions or the archive credit rows changed, and no drawn twin of a `project-*` image is to be commissioned again. The case covers, practitioner portraits, module covers, hero, gate and author-dialog illustrations are unaffected and stay in the series.
- Revised earlier: eight of the ten case-card covers — `illo-case-benfiddich-kayama.jpg`, `illo-case-black-swan-bobkov.jpg`, `illo-case-shapes-savage.jpg`, `illo-case-sips-caporale.jpg`, `illo-case-el-copitas-zernov.jpg`, `illo-case-city-space-narzi.jpg`, `illo-case-sensory-talalay.jpg` and `illo-case-jiro-ono.jpg` — were redrawn again, this time from each case's own documentary photograph rather than from the earlier cover art, so every drawn card carries the real room, counter and objects of that venue: Kayama's apothecary counter under its brick arch, the pub hall of Black Swan, the minimal shelf-and-bench corner of Shapes, the island workstation of Sips, the candlelit vault of El Copitas, the panoramic lounge of City Space, the sensory still life of the Talalay serve and the two chefs behind Jiro's counter. Published dimensions stay 1264 × 848, the case-file photographs are unchanged, their untouched originals are kept in `presentation/assets/originals/case-*.jpg` and each cover has an exact-file credit linking its source photograph.
- Done earlier: the practitioner portrait set is complete — eleven `illo-figure-*.jpg` portraits (Redzepi, Caporale, Kratena, Talalay, Dave Arnold, Savage, Narzi, Kayama, Zernov, Zarkov, Bobkov), each redrawn from its own editorial photograph at 848 × 1264, wired into the course with the editorial original retained beside it and linked as its source; and the five author project illustrations `illo-author-passie-2022.jpg`, `illo-author-coocoo-2024.jpg`, `illo-author-pacific-2024.jpg`, `illo-author-joi-2025.jpg` and `illo-author-chc-2024.jpg`, redrawn at the published dimensions of their archive photographs (600 × 900, 900 × 900, 675 × 900, 675 × 900, 900 × 466) and shown in the About-the-author dialog and on the author figure card, with the archive photographs retained as sources and the dialog noting that its project images are illustrations.

### The lesson sketch pages — October 2026

The twelve lesson headers are **sketchbook pages**. Each card is a working page from a designer's
notebook, not a finished poster, and the twelve pages gather into one board at the end of the course. The
set was drawn on 29 October 2026; it replaced an ink-and-gouache header set that followed the module covers.

- **One page, one lesson.** A loose cloud of the objects that lesson is actually about — the room
  fragment, the tools, the paperwork — scattered across the page at different sizes and angles, as if
  tipped out of a box. No frame, no sheet, no plan, no left and right halves, no ground line, no horizon.
- **The hand is a sketch.** Dense pen-and-pencil: uneven line weight, strokes that overshoot their
  corners, faint construction lines and guide arcs left visible, short hatching and cross-hatching on the
  studied objects, a few leaves barely started. Colour appears only as loose pale washes that stop short
  of the outlines, with bare paper showing between.
- **The page stays white.** The sketch texture lives in the drawing, never in the paper: no grey cast, no
  beige tint, no grain, no vignette. The app multiplies every drawing into the page, so a tinted paper
  would arrive as a grey rectangle around the sketch.
- **One red dot.** The single `#e42313` accent is one small red pencil mark on the object that is the
  lesson's control.
- **No lettering.** No text, numerals, logos or interface copy anywhere, including on receipts, menus and
  panels — those carry ruled lines only.

The **tasks follow the pages, lightly**: every challenge keeps its existing wording and its assignment
number and gains one sentence naming the page it produces. Assignment 12 gathers the twelve pages into one
board, and the pitch is read from it.

### Image audit — October 2026

Reviewed every published illustration against its own reference photograph and against the laws of physics.
Items are ordered by how much they cost the reader: likeness that should be obvious but is not, then frames
that cannot exist, then series inconsistencies, then the bookkeeping that the last two batches left behind.

**Status — 29 October 2026.** Fifteen assets were redrawn or recoloured from their photographs in this pass
and are marked `done` below; everything still marked `open` is the remaining task list. The second review in
`presentation/build/illustration-audit.md` §10 is the current one: it adds the two tests the drawings are now
judged by (obvious resemblance, one hand across the series) and names the four files drawn in the wrong hand —
`illo-figure-narzi.jpg`, `illo-figure-dave-arnold.jpg`, `illo-lesson-scenography.jpg` and
`illo-lesson-final-brief.jpg` — which are redrawn next, in the thin-line hand of their own set.

**Two portraits lost their pastel grounds, 29 October 2026.** `illo-figure-redzepi.jpg` and
`illo-figure-savage.jpg` were the last two portraits still carrying a coloured wash behind the figure; both
are white paper now, and the Redzepi apron knot was redrawn in the signal red the redraw had dropped.

**Still open after this pass.** In order: (1) ~~the four wrong-hand files above~~ — done 29 October 2026, all
four redrawn thin and light in the hand of their own set, and `illo-figure-kratena.jpg` re-framed from
768 × 1376 to the series' 848 × 1264; (2) ~~the two case cards that still read as the wrong place — `illo-case-sensory-talalay.jpg` and
`illo-case-dave-arnold.jpg`~~ — done 29 October 2026, both redrawn from their photographs in the case-card
hand; (3) ~~the two portraits that are still another person — `illo-figure-zarkov.jpg` and
`illo-figure-talalay.jpg`~~ — done 29 October 2026, both redrawn from their photographs; (4) the physics
list in `presentation/build/illustration-audit.md` §10.4 — fixed on 29 October 2026 for
`illo-m03-senses` (the plate now stands on the table), `illo-m07-fnb` (a shelf with a front edge) and
`illo-m08-venture` (the cup tray moved inside the table); three further entries were checked at full size and
were **wrong** — `illo-m09-found` ties every tag to its object, `illo-m06-ai` holds the bowl in the gripper,
`illo-m10-mockup` rests both hands on the panel edges — and the Sips foreground has been fully painted since
its redraw. What genuinely remains there is one line: the tasting glass in `illo-m03-senses` overlaps the
drinker's nose; (5) ~~one unifying pass over the line weight of the whole series once the list is closed~~ —
**cancelled after measurement**, 29 October 2026: the median ink stroke is 2 px in the light documents and
3 px in the dense ones across the whole library, so there is no drift to repair and re-rendering 52 files
would only have introduced one. What read as drift was ink *area* (dark rooms score high on any area metric)
and two real faults in the portrait set, now recorded in `illustration-audit.md` §10.6: portraits drawn
without an outer contour, and figures cut at mid-thigh with no shadow. The checklist used
for every redraw, and the reasoning behind each verdict, are in
`presentation/build/illustration-audit.md`.

| Done | File | What changed |
| --- | --- | --- |
| A1 | `illo-case-shapes-savage.jpg` | Rebuilt to the photograph: black steel bottle shelf on the green laminate table, colour-banded bottles, two red stools on the floor, the framed blue-circle / yellow-triangle poster standing on the table, rust-brown wall panel. Stray frame lines, the diagonal strut and the floating card are gone. |
| A2 | `illo-case-sensory-talalay.jpg` | The board, the iced tumbler and the lit rim of the photograph, two canapés, a second board behind on the same surface; waterline horizontal, ice below it, straw ending under the water. The pastel confetti is gone. |
| A3 | `illo-case-dave-arnold.jpg` | The pour now exists: tin raised, julep strainer over its mouth, a thin stream falling into the coupe held low, one curl of vapour on the glass. The counter has a real front edge and the tools stand on it. |
| A4 | `illo-figure-zarkov.jpg` | Redrawn from the photograph: long dark hair, beard, white tee, dark trousers, a single white armchair, the water bottle on the paper floor. The man and the room are finally the ones in the source. |
| A5 | `illo-figure-talalay.jpg` | Redrawn from the photograph: he stands behind the counter with one arm raised holding a small tumbler, stone linen overshirt over the white tee with its red-orange circle, arches, bottle shelf and pendant lamp behind. |
| A6 | `illo-case-benfiddich-kayama.jpg` | Redrawn from the photograph: white jacket over a white shirt with a dark red tie, the red serving mat and mixing glass on a dark mahogany counter, jars of botanicals, dark timber shelving of amber bottles, the framed painting and the dried herbs. The invented brick arch is gone. |
| A7 | `illo-case-sips-caporale.jpg` | The room's own colours: black ceiling band, bottle-green walls, the black island with its pale stone top, the lit back-bar shelves and the espresso machine, two green stools on the plank floor, the street window. Nothing left in outline. |
| A8 | `illo-case-city-space-narzi.jpg` | The red ceiling sweep, the magenta-and-blue striped floor and the deep blue night band are back; the guardrail runs in front of the armchairs instead of through them, and the bartender is drawn at stool scale. |
| A9 | `illo-case-jiro-ono.jpg` | The drawing is kept; the noren is recoloured from pale blue to dark navy, masked to the curtain band so no other part of the frame moves. |
| A10 | `illo-case-alex-kratena.jpg` | Redrawn from the photograph: the ornamental sleeve with no lettering in it, the phone in his right hand rather than the mirror, the second man in a black beanie in pale outline, the invented bar at the left edge removed. |
| A11 | `illo-case-krasota-zarkov.jpg` | The projected seascape is dark again, with the black void at the centre of the table and no fire on it; the guests, their plates and the curving screen behind them follow the photograph. |

Every new file keeps its published dimensions (1264 × 848 covers, 848 × 1264 portraits) and was run
through `tools/normalize-artwork-paper.js` so its paper is true white and the drawing still blends into
the page.

**A. Likeness — the reference is not recognisable enough**

1. `done` — `illo-case-shapes-savage.jpg`: the photo is a black open steel shelf with a *green* table and small bottles lined along it, red-ochre chairs and a pink table edge under a black-framed window. The drawing replaced that with a brown upholstered bench, a dark mat and a hanging card. Redrawn to the photo's own composition and colour.
2. `done` — `illo-case-benfiddich-kayama.jpg` — the photo: white jacket, dark tie, red counter mat, dark timber back bar, a large framed painting behind, warm lantern light, glass jars of botanicals in front of him. The drawing gives a brown waistcoat, no jacket or tie, no red mat, and invents a brick arch that is the strongest shape in the frame. The arch must go and the white jacket, tie and red mat must return.
3. `done` — `illo-case-sips-caporale.jpg` — the room is black and green; the drawing is uniformly pale blue, so the venue reads as a generic cafe. The green bottle wall is the identity of the place and is currently washed out. Also the shop glass carries mirrored lettering that must be blanked (see C1).
4. `done` — `illo-case-city-space-narzi.jpg` — the ceiling is a red-lit sweep and the floor runs magenta and blue; the drawing has a beige ceiling and brown armchairs, losing the only unforgettable feature. The guardrail also cuts through the armchairs (see B2).
5. `done` — `illo-case-jiro-ono.jpg` — the noren is dark navy in the photo and pale blue in the drawing. Restore the dark curtain; it is the frame's anchor.
6. `done` — `illo-case-alex-kratena.jpg` — the second figure in the photo is a tattooed man in a black beanie; the drawing gives a man in a cap and a scarf with no tattoos. The invented bar with straws at the left edge is not in the photo and should go.
7. `done` — `illo-case-krasota-zarkov.jpg` — the table projection is the point of the room: a dark seascape with aircraft and ships around a black void. The drawing puts pale water and toy sailboats on it, which turns a specific artwork into decoration. Keep the dark projected image and the void.
8. `illo-figure-redzepi.jpg` and `illo-case-rene-redzepi.jpg` — same person drawn twice with different T-shirts (light blue vs navy) and two different greys for the same apron. One likeness, one wardrobe.

**B. Physics and logic — frames that cannot exist**

1. `illo-case-el-copitas-zernov.jpg` — the ceiling is left as white void, so the ceiling candles float unsupported in mid-air. Draw the dark vaulted ceiling; it is the room's whole character.
2. `illo-case-city-space-narzi.jpg` — the guardrail passes through the backs of the armchairs; two bar stools overlap the bar front; one stool's seat overlaps the countertop.
3. `illo-case-shapes-savage.jpg` — the glass stands on the floor mat, and the hanging card and the dark mat do not exist in the photograph, so the left half of the frame tells a different story from the right.
4. `illo-hero-scene.jpg` — the seated guest's crossed leg passes into the counter apron, and the bartender's second arm vanishes behind the counter with no shoulder line.
5. `illo-gate-still-life.jpg` — the pedestal stops in mid-air above its shadow; the spoon and napkin cross the table edge and hover.
6. `illo-lesson-concept-objects.jpg` — the bar blade's shadow falls beyond the bench edge while the blade stays on it; the sock is folded so it reads as a rolled towel rather than a sock.
7. `illo-m05-automation.jpg` — the hanging bottles have their necks cut by the shelf, the "wafer-thin" worktop runs into the glass panel with no joint, and the service arm's gripper holds nothing while a glass floats beside it.
8. `illo-lesson-automation.jpg` — the study figure's forearm passes through the reach arc, and the glass end panel stops above the floor so the console has nothing to stand on.
9. `illo-lesson-signals.jpg` — the phone is held with no hand, and the scan line runs in front of the glass but behind the column at the same time.
10. `illo-m10-mockup.jpg` — the model's back wall cuts through the counter, the steel rule floats without a shadow, and the right hand shows two fingers and a thumb.
11. Hands in general: check every drawn hand at 100 %. Known offender: `illo-m10-mockup.jpg` (two fingers and a thumb on the right hand). The Kratena phone hand reads correctly on close inspection and is not on the list.

**C. The lettering rule — violations still visible**

1. `illo-case-sips-caporale.jpg` — mirrored shop lettering in the window. Must be blank, like every other sign in the series.
2. `illo-m10-mockup.jpg` — the three sticky notes and the glue-stick label were painted over with flat patches, and the patches still read as rectangles. Repaint inside the drawing instead of patching over it.
3. `illo-case-kratena`/`illo-m10` numbered rulers: any tick that reads as a numeral goes.

**D. Series consistency**

1. `illo-figure-*.jpg` carry a soft watercolour halo behind the sitter; the module and lesson covers sit on plain white paper. Decide one treatment for the portraits and apply it to all eleven.
2. Case covers set in dark rooms (Sips, City Space, El Copitas, Benfiddich, Krasota) were all lightened to the same pale palette, which erases the venue's own identity. Keep the poster style but hold each room's own light: dark rooms stay dark, with the ink contour doing the describing.
3. The two author-dialog sets overlap: `illo-author-joi-2025.jpg` and the Joi case cover tell the same story in two different idioms.

**E. Bookkeeping left by the last two batches**

1. `done` — All twelve lesson headers are published and wired into their own lessons, so none falls back to the module cover; the pinned count is fifty-two and the test now requires every lesson to name its own header. The set was redrawn as sketch pages on 29 October 2026, which supersedes the gouache direction recorded for these files in §D and in the measurements of `illustration-audit.md` §10.6.
2. `done` — the progress line counted forty files while ten lesson headers were already published; it now reads fifty and names the lesson headers.
3. `done` — `presentation/build/illustration-prompts.md` now describes what is actually on the three redrawn cards (Shapes, Sensory, Dave Arnold) and carries a redraw-pass note with the four recognition anchors.

**No further batch is planned.** The series ends at fifty-two published illustrations, and a new drawing is only commissioned for a genuinely new asset. The `project-*` archive stays photographic, the three `web-insider-*` files stay credited documentary photographs of another venue, the twelve `studio-*` plates stay as studio photography, and the two logos stay unchanged. Anything added later keeps the rule below: a generated file is disclosed per exact filename and never stands in for evidence of a real venue.

Generated redraws must not be represented as documentary photographs. Before replacing a photograph, preserve the original and its credit wherever it is needed as evidence; add an exact-file `imageCredits.files` entry with `generated: true`, an illustration label and a link to the original. The previously replaced Jiro reference portrait is retained at `presentation/assets/originals/figure-jiro.jpg`; the Passie Cakes source remains `passiecakes_7625.jpeg`. The app identifies those two illustrations and the `illo-*` series as AI-generated, including in gallery/lightbox captions. Rights remain with the respective photographers and venues. If a source is unavailable or cannot be responsibly redrawn, leave it unchanged and record its exact filename and reason here rather than fabricating a replacement. Verify the files, dimensions and labels at the end of each batch.

The public course preview is deliberately compact: positioning, format facts and author contacts only. Lesson ideas, cases, techniques and the mockup brief stay inside the password-protected course so the preview does not spoil the content.
