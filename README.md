# CONTEMPORARY HORECA SCENE

**THE FUTURE OF HOSPITALITY** — a living digital elective for Hotel Institute Montreux, created by Egor Tarasenko, HIM alumnus and Master in Business Management.

> A digital elective exploring the ideas, technologies and experiences shaping the next generation of hospitality.

## Repository audit and implementation decision

This repository started as a **course proposal and content library**, not an application. The initial audit found:

- **Framework / frontend:** no web framework or frontend application; no package manifest or dependency tree.
- **Backend / database / APIs:** none present.
- **Authentication / user flows:** none present.
- **Routing / components / design system:** none present.
- **Existing product assets:** hospitality photography and a HIM logo in `presentation/assets/`; bilingual syllabus, lecture notes, assignments and case files in `course/`; reproducible English and Russian pitch decks in `presentation/`.
- **Environment / deployment:** no environment variables or deployment configuration.

The existing curriculum, photo library and pitch-deck sources are retained. To avoid inventing a backend or replacing the repository with an unrelated stack, the new experience is implemented as a dependency-free, responsive web app. Course content is edition-scoped and separate from the UI. A browser-persisted demo adapter makes the core student and instructor journeys testable immediately. The seam for a future API/CMS, persistent database, institution SSO and secure file service is documented below.

## Run locally / deploy on BotHost

This is a **Node.js-served web app** (not Python). No npm packages are required. Node 18 or newer is sufficient.

```bash
npm start
```

The server binds to `0.0.0.0` and listens on `process.env.PORT` (default `3000`), as expected by app hosts such as BotHost. It serves the site and exposes `/healthz` for health checks. Opening `index.html` as a `file://` URL is not supported; use the server so browser storage and assets work correctly.

On BotHost, provide only two app variables: `BOT_TOKEN` and `ADMIN_IDS` (a comma- or space-separated list of Telegram numeric user IDs). BotHost supplies `PORT` automatically. The Node server keeps the bot token private and uses it to verify Telegram Mini App `initData`; the admin ID list determines which verified Telegram users receive the `ADMIN` role. Never put the bot token in front-end code.

## Telegram launch

The responsive site can be opened directly on its HTTPS domain or launched inside Telegram as a **Mini App**. Point your bot's `web_app` button (or menu button) to the deployed site URL. The front end detects Telegram's Web App SDK, calls `ready()` / `expand()`, syncs the viewport, and uses Telegram's back button when available. Local HTTP is only for development; the public Mini App URL must use HTTPS.

When launched inside Telegram, the Node server verifies the SDK's signed `initData` at `POST /api/telegram-auth` using `BOT_TOKEN`; the token never reaches the browser. Telegram users whose numeric ID is listed in `ADMIN_IDS` receive the administrator role, and other verified Telegram users enter as students. The email/password demo flow remains available only in a normal browser outside Telegram. Bot menu/launch-button configuration is still done in BotFather.

## Demo access

Use **Student login**, then select one of the demo roles. The login form also accepts an email and any non-empty password in this local prototype.

- Student: `student@him.edu`
- Instructor: `instructor@him.edu`
- Admin: `admin@him.edu`

Demo state is saved in the browser (`localStorage`); attached submission files are kept in IndexedDB. For an end-to-end review flow, submit work as the student, sign out, sign in as instructor, open the submission and approve it or request a revision. No demo accounts or student records are sent to a server.

## Product experience

- Public editorial landing page with the elective's positioning, subject areas, learning sequence, case files, author timeline, nine-module structure and final challenge.
- Student space with course progress, next lesson, modules, editorial lesson pages, case studies, assignment submissions, quiz, feedback, updates and printable certificate.
- Instructor space for reviewing work, assigning a score, providing feedback and approving or returning submissions for revision.
- Admin view for the generic institution/license model, edition overview and license status demonstration.
- Responsive desktop and mobile navigation, search across course content, accessible form labels and keyboard-operable controls.
- Existing course materials and images remain available; the new UI uses the existing hospitality photography and does not present the HIM logo as a claim of institutional endorsement.

## Content, architecture and boundaries

- `course-data.js` holds portable content seed data: course identity, edition, modules, lessons, case files and updates. Renderers in `app.js` consume this structure; UI markup is not the source of truth for lesson text.
- The initial generic domain is: **Institution → User / Enrollment → Course → Edition → Module → Lesson**; learning and operations entities include **Video, CaseStudy, ReadingMaterial, Assignment, Submission, Feedback, Quiz, Question, Answer, Progress, Certificate, License, CourseUpdate, Notification**.
- Progress and quiz records are scoped to user and edition. Submissions record the student and edition context; an institution-scoped instructor review view is the intended authorization boundary.
- Course content and author IP remain separate from the institution's licensed access. A new edition can evolve independently, without overwriting existing edition records.
- `course/` remains the source library for the full bilingual syllabus, lectures, assignments and case material. `presentation/` remains the reproducible proposal-deck project.

### Important production boundary

The repository includes a lightweight Node server and verifies Telegram Mini App `initData` against `BOT_TOKEN`; `ADMIN_IDS` grants the `ADMIN` role to configured Telegram accounts. However, it has **no database, persistent server-side sessions, server-backed learning APIs, content-management service or production file storage**. Progress, quizzes, submissions and feedback are still browser-local and editable, and uploaded files stay in that browser. Telegram identity is signed and verified, but this alone does not make the learning records production-secure. Do not use this build for real student records until a database/API and server-enforced institution/course/role access, secure upload storage, retention/backup policies and monitoring are in place.

## Original course proposal

The educational proposal is a 12-week, 36-contact-hour elective in English for BBA/MIB students. Its original five-part syllabus and grading model remain in `course/` and can inform future editorial expansion of the nine digital modules.

The course brings together hospitality futures, experience design, neurogastronomy, restaurant and bar concepts, technology, AI, food & beverage and entrepreneurship. Its through-line is a student-designed hospitality concept, developed through to a final pitch.

## Existing proposal deck

`presentation/dist/Contemporary-HoReCa-Scene-Course-Pitch-EN.pdf` and `...-RU.pdf` are retained proposal artefacts. Rebuild them with:

```bash
python3 -m venv .venv
.venv/bin/pip install -r presentation/build/requirements.txt
.venv/bin/python presentation/build/build_deck.py
```

The deck generator prefers Inter when available through `HIM_FONT_DIR`, with DejaVu Sans as a fallback.
