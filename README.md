# CONTEMPORARY HORECA SCENE

**Contemporary Horeca Scene** — a living digital elective for Hotel Institute Montreux, created by **Egor Tarasenko**, HIM alumnus and Master in Business Management.

> A digital elective that reads the contemporary horeca scene through rankings, design, neurogastronomy, technology and entrepreneurship — and ends with a live found-object mockup assembled from antique tableware, candles, vintage glassware, found props and a physical menu concept.

## Access and payment flow

The start page offers only **Log in** and **Register**. The app contains no Tribute purchase button, checkout link or payment window: all purchases happen in Tribute, outside the course. A signed Tribute webhook records payment; manual admin approval in the Telegram bot is required before account registration.

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

The **course author is credited inside the product** (footer, profile, certificate small print, instructor identity) but his **name is not shown on the title visuals** — hero, sign-in visual, deck cover. The **author bio and selected projects live in a pop-up, not a standalone landing-page block**: `author.js` opens a dialog from the clickable “About the author” controls on the access page, landing page, dashboard and app header. It lists only the author’s international experience (Sakhalin 2015 → Thailand 2019 → Switzerland 2019 → Dubai 2021 → St Petersburg 2022), beginning with his first steps in HoReCa as a waiter, and five own projects as photographs with only a name and year (Passie Cakes Co. 2022 / CooCoo 2024 / Pacific 2024 / Joi 2025 / Chicken Connection 2024). All copy is in English and project names use Latin script. The author's bar equipment and station fabrication studio is named **Pacific**; its **Mirain** station line is equipped with dedicated pumps built into the station that cut preparation to seconds. The public access page (`.gate-page` → `.gate-stage` + `.gate-info`) describes the shared registration flow, the manual approval step, student FAQ and sign-in. The full author-project archive remains available from the About the author pop-up after course access; cases and leading industry figures remain in the Cases section/page.

## Run locally / deploy on BotHost

A **Node.js-served web app** (not Python). No npm packages are required; Node 18 or newer is sufficient.

```bash
npm start          # http://0.0.0.0:$PORT (default 3000)
npm run check      # syntax check: server, app, access, course data, admin console and site copy
npm test           # English-only copy, author/figure separation and API regression checks
```

The server binds to `0.0.0.0`, serves the site, exposes `/healthz`, verifies Telegram `initData` and enforces the course password. Opening `index.html` as a `file://` URL is not supported; use the server so cookies, storage and assets work correctly.

On BotHost, set a private `COURSE_PASSWORD`, a stable `ACCESS_SECRET`, the Telegram `BOT_TOKEN`, `BOT_USERNAME`, and `ADMIN_IDS` (comma- or space-separated Telegram numeric user IDs). For paid delivery, set `TRIBUTE_API_KEY` and the matching Tribute product ID and/or subscription ID. No Tribute checkout URLs are used by the course app. Optional price values (`TRIBUTE_PRODUCT_PRICE`, `TRIBUTE_SUBSCRIPTION_PRICE`) are fallbacks only; signed webhook amounts take precedence. `COURSE_URL` is the public HTTPS course origin used for the shared registration page and course links; the optional `COURSE_START_URL` (`COURSE_APP_URL` and `START_URL` are accepted aliases) is the bot's immediate post-payment start link and falls back to `COURSE_URL` when empty. BotHost supplies `PORT`. Secrets stay server-side; never put bot tokens, passwords or the Tribute key in front-end code.

## Telegram launch

The responsive site can be opened directly on its HTTPS domain or launched inside Telegram as a **Mini App**. Point your bot's `web_app` button (or menu button) at the deployed URL. The front end detects Telegram's Web App SDK, calls `ready()` / `expand()`, syncs the viewport and header colours (on the sign-in page and inside the course), and uses Telegram's back button when available. The public Mini App URL must use HTTPS.

When launched inside Telegram, the client initializes the Web App SDK. After course access is established with a valid password, the app can verify the SDK's signed `initData` at `POST /api/telegram-auth` using `BOT_TOKEN` and attach the Telegram identity to the profile. This verification does not bypass the password gate. `ADMIN_IDS` is used to authorize private admin-bot chats; configure the menu or launch button in BotFather.

## Learner and admin sessions

There are no public demo profiles, manual password-generation tools or payment links in the course app. The registration page is shared and reusable, but the server creates an account only for a Telegram identity manually approved by the course admin after payment verification. The learner sets a personal password during registration; passwords are stored as scrypt hashes. The configured master password is reserved for administrators. Learning progress and quiz state are saved in the browser (`localStorage`). Confirmed payment, admission, chat and order records are stored server-side in `data/store.json`; uploaded assignment files are kept in `data/uploads/`.

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

- **Public start page** (SEG-styled split screen: gate visual + sign-in / shared registration requiring manual Telegram approval) followed by course information, the student FAQ and a clickable About the author pop-up. It has no Tribute checkout link or purchase CTA. Once access is granted, the editorial landing page covers the elective's positioning, subject areas, learning sequence, case files, the fairy-tale principle, the budget & scenography block, ten-module structure and final challenge. Cases and leading industry figures remain available together on the Cases page.
- **Projects of the author** (`#/projects`, `#/project/<id>`) — 43 photographs across seven project files: Joi Espresso Bar, Passie Cakes Co., CooCoo Coffee, Chicken Connection, Pacific, TAM / TYT and a found-object research file. Each file carries facts, an English explanation and a captioned gallery with a keyboard-accessible lightbox. The full archive is reached via the About the author pop-up rather than a separate main-navigation item; its photographs also remain course evidence in the relevant cases and modules.
- **Student space** with course progress, next lesson, modules, editorial lesson pages, case studies, private real-time Project Q&A, assignment submissions (concept + mockup photographs, in-app or by email to the instructor), quiz, feedback, updates and a printable certificate.
- **Instructor space** for reviewing work, assigning a score, providing feedback and approving or returning submissions for revision.
- **Admin view** for Tribute setup readiness, pending manual approvals, signed-webhook payment events, shared-link delivery status, private Project Q&A and the Telegram admin-command console.
- Responsive desktop and mobile navigation, search across course content, accessible form labels, keyboard-operable controls, reduced-motion and print styles.
- **Photography is shown whole.** Source frames are mostly 3:4 / 4:5 phone photographs, so content images (case cards, project cards, galleries, creator and budget frames, the hero plate) render at their natural proportions instead of being cropped to a fixed-height strip. Only surfaces that are treated as background fields — hero on mobile, the gate/login visual, the case feature band, module and lesson banners — are cropped, and their `object-position` is set deliberately.
- **Image sources are credited.** The access-page visual, course landing hero and selected module covers draw on close-detail Joi and Pacific photographs from the author’s archive, rendered in a high-contrast black-and-white, film-inspired treatment. Source files are unchanged; this is a visual style, not a claim that the originals were shot on a professional film camera. Supporting photos, including open-source editorial references, may also receive a CSS-only grayscale treatment in the browser; original image files remain untouched, and their photographers and venues retain copyright. Source links and rights notes appear on the in-app `#/credits` page. Illustrative archive images are explicitly marked as *not* depicting the venue discussed; the HIM logo is © Swiss Education Group. A few author-archive photographs (`*-ai.jpg`) have separate **subtle AI exposure and shadow-detail recovery, composition untouched** — each is labelled “AI-PROCESSED” under the image and on `#/credits`.
- Existing course materials and photography remain available; the new UI uses the existing hospitality imagery and does not present the HIM or SEG logos as a claim of institutional endorsement.

## Language and editorial boundaries

The public access page, registration guidance, author dialog, lessons, captions, project archive, web administration, Telegram Access Bot and downloadable materials are English-only. Cyrillic name duplicates and translated project/caption fields are not shipped. The deck builder produces the English PDF only; there are no alternate-language course handouts or decks.

The single sanctioned exception is the **private Telegram admin console** (`admin-bot.ru.js`): a Russian-language inline-button panel requested by the course owner for his own bot. It is required only by `server.js`, is never referenced by `index.html`, `app.js` or `access.js`, and therefore never reaches learners; the test suite asserts both that it stays server-side and that it remains Russian.

The author dialog contains the author’s own career and projects. Perfect Bars Team’s venues belong in Ivan Lyashuk’s and Vladimir Nikolaev’s industry profiles; Artender is identified as a media and creative-community project, not a sixth bar. These profiles link to the team’s primary sources. Original documentary photographs are preserved unchanged, including any signage visible within them.

`npm test` guards the language and attribution rules, shared registration with manual approval, signed Tribute webhooks, duplicate-payment handling, chat privacy and live delivery.

## Content, architecture and boundaries

- `access.js` owns the sign-in / shared-registration gate and boots `app.js` (`window.bootCourse`) only after `course-data.js` has been unlocked and loaded.
- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files, the `projects` archive (seven files with captioned photography) and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text.
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

`presentation/dist/Contemporary-Horeca-Scene-Course-Pitch-EN.pdf` is the English-only proposal deck. Its sources use the SEG palette, keep the author off the cover, and include Module 6 and the mockup in the course map, week plan, assessment and final project slides. Rebuild the deck after changing its sources:

```bash
python3 -m venv .venv
.venv/bin/pip install -r presentation/build/requirements.txt
.venv/bin/python presentation/build/build_deck.py
```

The deck generator prefers Inter when available through `HIM_FONT_DIR`, with DejaVu Sans as a fallback.


## Access, lessons, submissions and administration

A learner account is created only when `/api/register` receives a Telegram username or ID matching a manually approved admission. Registration collects a name and unique email address, then stores a scrypt hash of the learner-created password. `/api/access` signs in registered learners using email and password; the configured master password opens the admin account only. All 13 learning units and all modules are available at once; assignment review never gates lesson access. Students can submit the practical assignment from each lesson, add text, a link and files in the app, and receive feedback. Forgotten-password recovery is handled only by email at `egor.tarasenko@him-mail.ch`.

The Tribute integration is event-driven, not a checkout embedded in the course app. A signed `new_digital_product` event grants lasting access; `new_subscription` issues access through its verified `expires_at`, `renewed_subscription` extends that date, and `cancelled_subscription` stops renewal while preserving access only through Tribute’s reported expiry. In the Tribute creator dashboard, set the webhook URL to `https://YOUR-DOMAIN/api/tribute/webhook`, set `TRIBUTE_API_KEY`, and configure the relevant `TRIBUTE_PRODUCT_ID` and/or `TRIBUTE_SUBSCRIPTION_ID`. No purchase link or checkout URL is configured or rendered by the course app.

The buyer should start the Access Bot before purchasing. The webhook creates an admission request and instantly hands the buyer the start-link message described above; the course owner verifies the payment and runs `/admit <student_id>` before the account can actually be registered on the shared page. `/register` requests admission, resends the start link to a paid buyer, or resends the shared page after approval. `/password` never reveals a password and directs the learner to email support. Admin commands include `/admissions`, `/admit`, `/reject`, `/orders`, `/resend <telegram_id>`, `/students`, `/pending`, `/approve` and `/revise`; `/chat` opens the Project Q&A inbox. The app's private Project Q&A page stores individual student/team threads and delivers new messages live over authenticated server-sent events. Telegram admins receive a notification when a learner asks a question, and replies appear live in the learner's chat. The FAQ explains how to use it. The admin dashboard shows pending admissions, Tribute setup readiness, recent payment events, link-delivery status and the latest editor changes. Run with `npm start`; run syntax checks with `npm run check` and regression tests with `npm test`.

### Content editor in the admin bot

The same admin bot edits the live course without a redeploy. `/addmat <module> <https url> <short description>` adds an extra reading to a course block; materials are stored per module and rendered at the end of that module block inside the course (never as a separate window). `/editmat <id> [new url] <new description>`, `/delmat <id>` and `/materials [module]` manage the library. `/post <title> | <text>`, `/posts` and `/delpost <id>` publish or remove live updates on the Updates page. `/editmodule <module> [title|description] <text>` and `/editlesson <lesson> [title|intro|body|challenge] <text>` override published copy in `course-data.js` until `/revert <id>` (or `/overrides` to list) restores it. Module arguments accept an id (`budget`), a number (`09`) or any lesson id inside the block.

The open app picks editor changes up automatically: it re-checks `/api/state` every 30 seconds and whenever the browser tab regains focus, applies new materials, posts and copy overrides, and re-renders the current page. An input in progress is never interrupted — the refresh waits until the learner stops typing.

### Russian inline-button admin console

The same bot is a Russian admin panel driven entirely by inline keyboards (`admin-bot.ru.js`). After `/admin <master password>` (or `ADMIN_IDS`) the admin gets a button menu: 📋 submissions (approve / request revision with typed feedback, detail view), 👥 students, 💳 Tribute payments, 📚 materials and 📣 announcements (add/remove through guided input), ⚙️ status and ↩️ the override journal with one-tap revert.

The block editor (the "Course blocks" menu, shown in Russian inside the bot) rewrites any existing block without a redeploy: the password gate and the landing page (editable copy lives in `site-copy.js`, merged server-side at the public `GET /api/site` and applied in the browser), every module and lesson (title, description / intro / body / challenge, and the cover image), plus cases, industry figures and author projects. Pressing a field button opens a deferred input — the next message saves the override; `/cancel` aborts. Edited fields are marked in the menus, each block has a reset button, and legacy English text commands keep working for scripting and the web console.

### Photo replacement in the admin bot

Every image block can be replaced with a photograph sent in the Telegram chat — no redeploy and no file paths to remember. The 🖼 **Photo & backgrounds** section collects the gate background, the landing hero, the budget and mockup photographs, module covers, lesson frames, case photos, figure portraits and project covers / lead photos; the 📷 buttons inside any block do the same for that block. After tapping an image field the bot waits for the next message: a photo or an image file becomes the new picture, while an https link or an archive file name (for example `project-joi-bar.jpg`) still works as text. Uploads are validated (JPEG / PNG / WebP, up to 8 MB, magic-byte checked), stored in `data/uploads/`, registered in 🖼 **Media library** (`editor.media` in `data/store.json`) and served publicly from `/media/<file>` with immutable caching. The bot answers with a preview of the saved photo plus "replace again" and "revert" buttons; deleting a photo from the media library also clears every block that pointed at it, restoring the published image. Uploaded photographs are credited in the app as `PHOTO · UPDATED BY THE COURSE TEAM` and are never listed in the *Image sources & rights* archive credits.

### Photographs & image credits

The access-page and course-cover imagery uses existing author-archive photographs from **Joi** and **Pacific**, with food and beverage details from the author's project files. The direction is black-and-white macro photography with high contrast, a narrow plane of focus and the tactile character of professional analogue film. The display treatment leaves the source files untouched; the rejected generic generated series is not used. Other editorial photographs are taken from publicly available websites and press materials, and the in-app *Image sources & rights* page lists source links, credits and rights notes. Public availability does not transfer copyright; rights remain with the respective photographers and venues.

The public course preview is deliberately compact: positioning, format facts and author contacts only. Lesson ideas, cases, techniques and the mockup brief stay inside the password-protected course so the preview does not spoil the content.
