# CONTEMPORARY HORECA SCENE

**Contemporary Horeca Scene** — a living digital elective for Hotel Institute Montreux, created by **Egor Tarasenko**, HIM alumnus and Master in Business Management.

> A password-protected digital elective that reads the contemporary horeca scene through rankings, design, neurogastronomy, technology and entrepreneurship — and ends with every student building a physical mockup of their own venue from paper, like stage scenery.

## Access

The course is protected by a cohort password. Enter it on the first screen; access is then remembered on that device for 30 days.

| | |
|---|---|
| **Course password** | `Mzgnxtj8` |
| Override in production | `COURSE_PASSWORD` (or a comma-separated `COURSE_PASSWORDS` list) |
| Signing key for the access cookie | `ACCESS_SECRET` (derived from the password when unset) |

The password is verified by the Node server (`POST /api/access`), which sets a signed, `HttpOnly` cookie. That cookie also unlocks the course content on the server: `/course-data.js`, `/course/`, `/presentation/dist/` and `/presentation/build/` return `403` until access is granted. The password itself is never shipped to the browser — `access.js` only holds a SHA-256 digest, used as a fallback when the app is hosted without the Node server. Repeated wrong entries are throttled (`429` after 12 attempts per 10 minutes), and a signed-in user can re-lock the device from **Profile → Lock the course on this device**.

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

Signature moves used across the site: full-bleed hero stage with giant light-weight uppercase type and an italic serif accent word; a pretitle eyebrow with a red dash and a hairline rule; a marquee ticker of the venues “on the scene”; a maroon quote band with a red bottom border; rectangular buttons that fill red from below on hover; underline-animated text links; hairline module tables with hover shift; SEG-style key-figure counters.

The **course author is credited inside the product** (author section, footer, profile, certificate small print, instructor identity) but is **not shown on the title visuals** — hero, password gate, login visual, deck cover.

## Run locally / deploy on BotHost

A **Node.js-served web app** (not Python). No npm packages are required; Node 18 or newer is sufficient.

```bash
npm start          # http://0.0.0.0:$PORT (default 3000)
npm run check      # syntax check: server.js, app.js, access.js, course-data.js
```

The server binds to `0.0.0.0`, serves the site, exposes `/healthz`, verifies Telegram `initData` and enforces the course password. Opening `index.html` as a `file://` URL is not supported; use the server so cookies, storage and assets work correctly.

On BotHost, provide: `COURSE_PASSWORD` (defaults to the cohort password above), and for Telegram launch `BOT_TOKEN` plus `ADMIN_IDS` (comma- or space-separated Telegram numeric user IDs). BotHost supplies `PORT`. The bot token and the password stay server-side; never put them in front-end code.

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

Ten modules / eleven learning units:

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
| **09** | **Budget Realisation & Scenography** | **Found objects and flea markets, theatrical decorative techniques, the paper mockup** |
| 10 | Final Challenge | Concept of tomorrow, defended together with the mockup |

### Module 09 — Budget Realisation & Scenography

Two learning units:

1. **Soul before budget** — a venue does not need a large budget to feel alive; it needs a point of view and the patience to hunt for objects that carry one. Sourcing discipline (flea markets, auctions, demolition yards, liquidations, the street), repair / reuse / re-upholstery, and the case of **Joi Espresso Bar** — the author's own project, assembled almost entirely from the street and flea markets. *Money buys speed and finish; intention buys soul.*
2. **Theatrical techniques & the paper mockup** — scenography borrowed from the stage: painted flats, forced perspective, backdrops, scrim and gauze, trompe-l'œil, glazing, patina, distressing, stencil and gold leaf, faux bois / faux marbre, drapery, haze and one tight beam of light. A theatrical trick must support the story and never announce itself.

**Final exercise:** every student builds a physical mockup of their own project — paper, cardboard, matchboxes, wire, fabric scraps, clay, printed photographs, a small torch for light — at 1:20 or 1:50, as a *set* rather than a plan: entrance, first sightline, light source, and the three details that carry the atmosphere. Photographed at guest height, it becomes part of the final pitch.

**Operating principle of the course:** a bar or a restaurant is a sweet fairy tale — for two hours the guest agrees to believe in a world the team built, and any small detail (a harsh light, a plastic tray, a visible printer, a dirty door handle) can instantly wake them from that dream.

## Product experience

- **Password gate** (SEG-styled split screen) → public editorial landing page with the elective's positioning, subject areas, learning sequence, case files, the fairy-tale principle, the budget & scenography block, author timeline, ten-module structure and final challenge.
- **Student space** with course progress, next lesson, modules, editorial lesson pages, case studies, assignment submissions (concept + mockup photographs), quiz, feedback, updates and a printable certificate.
- **Instructor space** for reviewing work, assigning a score, providing feedback and approving or returning submissions for revision.
- **Admin view** for the generic institution/license model, edition overview, password-access status and license demonstration.
- Responsive desktop and mobile navigation, search across course content, accessible form labels, keyboard-operable controls, reduced-motion and print styles.
- Existing course materials and photography remain available; the new UI uses the existing hospitality imagery and does not present the HIM or SEG logos as a claim of institutional endorsement.

## Content, architecture and boundaries

- `access.js` owns the password gate and boots `app.js` (`window.bootCourse`) only after `course-data.js` has been unlocked and loaded.
- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text.
- The initial generic domain is: **Institution → User / Enrollment → Course → Edition → Module → Lesson**; learning and operations entities include **Video, CaseStudy, ReadingMaterial, Assignment, Submission, Feedback, Quiz, Question, Answer, Progress, Certificate, License, CourseUpdate, Notification**.
- Progress and quiz records are scoped to user and edition. Submissions record the student and edition context; an institution-scoped instructor review view is the intended authorization boundary.
- Course content and author IP remain separate from the institution's licensed access. A new edition can evolve independently, without overwriting existing edition records.
- `course/` is the source library for the full bilingual syllabus, lectures, assignments and case material (both languages include Module 6 — Budget Realisation & Scenography, the Joi Espresso Bar case and the mockup brief). `presentation/` is the reproducible proposal-deck project.

### Important production boundary

The repository includes a lightweight Node server that verifies Telegram Mini App `initData` against `BOT_TOKEN`, grants `ADMIN` to `ADMIN_IDS`, and enforces the course password with a signed `HttpOnly` cookie. However, it has **no database, persistent server-side sessions, server-backed learning APIs, content-management service or production file storage**. Progress, quizzes, submissions and feedback are still browser-local and editable, and uploaded files stay in that browser. The password gate protects content delivery from this server; it is not a substitute for per-student accounts. Do not use this build for real student records until a database/API, server-enforced institution/course/role access, secure upload storage, retention/backup policies and monitoring are in place.

## Original course proposal

The educational proposal is a 12-week, 36-contact-hour elective in English for BBA/MIB students. Its syllabus now runs to **six modules** — the original five plus *Budget Realisation & Scenography* (weeks 11–12) — with the mockup defended at Final Pitch Day. Grading model and reading list remain in `course/`.

The course brings together hospitality futures, experience design, neurogastronomy, restaurant and bar concepts, technology, AI, food & beverage, entrepreneurship and budget realisation. Its through-line is a student-designed hospitality concept, developed to a final pitch and a physical mockup.

## Proposal deck

`presentation/dist/Contemporary-Horeca-Scene-Course-Pitch-EN.pdf` and `...-RU.pdf` are retained proposal artefacts. The deck **sources** have been updated (SEG palette, author removed from the cover, Module 6 and the mockup added to the course map, week plan, assessment and final project slides); the committed PDFs predate that change and should be rebuilt:

```bash
python3 -m venv .venv
.venv/bin/pip install -r presentation/build/requirements.txt
.venv/bin/python presentation/build/build_deck.py
```

The deck generator prefers Inter when available through `HIM_FONT_DIR`, with DejaVu Sans as a fallback.
