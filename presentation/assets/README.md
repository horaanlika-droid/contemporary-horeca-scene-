# Presentation assets

These assets support the English-language Contemporary Horeca Scene course deck. They are included for reproducible builds; the presentation is a course proposal, not an official HIM Business School publication.

## Brand asset

| File | Source |
| --- | --- |
| `him-logo-white.png` | Official HIM logo asset linked from the [Swiss Education Group HIM Business School page](https://www.swisseducation.com/en/him-business-school/). |

## Polychrome cartoon illustrations

The `illo-*.jpg` files are original hand-drawn illustrations made for the course interface — a loose ink doodle: a thin, wobbly black fineliner line with visible hand tremor, flat matte pastel fills (pale ice blue, sage, warm sand) left slightly off-register on white paper, wide empty margins around a small centred subject, and exactly one small signal-red `#e42313` accent per drawing. They illustrate concepts, not specific venues, and are credited in the app as *illustration · original course graphic*.

| Surface | Size | Files |
| --- | --- | --- |
| Access page (vertical) | 1080 × 1620 | `illo-gate-still-life.jpg` |
| Landing hero (vertical) | 1080 × 1620 | `illo-hero-scene.jpg` |
| Module covers (3:2) | 1536 × 1024 | `illo-m01-signals.jpg` … `illo-m10-mockup.jpg` |
| Case-card covers (3:2) | 1264 × 848 | `illo-case-*.jpg` |

The masters (PNG, drawn at 768 × 1376 and 1264 × 848) live outside the repository in `tmp/illustrations/`, which is git-ignored. `presentation/build/build_illustrations.py` trims the empty paper around each drawing, restores a 7% margin, fits it to the surface the interface needs and writes a progressive JPEG. Re-run it after replacing a master:

```bash
python3 presentation/build/build_illustrations.py            # the whole set
python3 presentation/build/build_illustrations.py --only m06 # one asset
```

Do not edit the JPEGs by hand. The app marks every `illo-` file with the `illo-photo` class, so drawn covers are shown whole on white paper instead of being cropped like a camera frame, and the access panel switches to a light sheet with ink-coloured type (`.gate-visual.is-illustration`).

| File | Use |
| --- | --- |
| `illo-gate-still-life.jpg` | Access page still life (vertical) |
| `illo-hero-scene.jpg` | Course landing hero — the bar as a stage set (vertical) |
| `illo-m01-signals.jpg` … `illo-m08-venture.jpg` | Module covers 01–08 (3:2) |
| `illo-m09-found.jpg`, `illo-m10-mockup.jpg` | Module covers 09–10 (3:2) |
| `illo-case-benfiddich-kayama.jpg`, `illo-case-black-swan-bobkov.jpg`, `illo-case-shapes-savage.jpg`, `illo-case-sips-caporale.jpg`, `illo-case-el-copitas-zernov.jpg`, `illo-case-city-space-narzi.jpg`, `illo-case-sensory-talalay.jpg`, `illo-case-jiro-ono.jpg`, `illo-case-krasota-zarkov.jpg`, `illo-case-dave-arnold.jpg` | Case-card covers, drawn per case (3:2). The card is a cover; the case file keeps the documentary photograph |

## Thematic Horeca photography

The deck deliberately uses subject-led hospitality imagery rather than photographs of the institute, campus, classrooms, or students.

| Files | Theme |
| --- | --- |
| `horeca-chefs-counter.jpg`, `horeca-kitchen-plating.jpg`, `horeca-open-fire.jpg` | Contemporary kitchens, chef's counters, and live-fire cooking |
| `horeca-craft-bar.jpg`, `horeca-cocktail-shaker.jpg`, `horeca-backbar-bottles.jpg` | Bar craft, cocktails, and backbar design |
| `horeca-hotel-bar-trolley.jpg`, `horeca-wine-service.jpg` | Hotel-bar rituals and beverage service |
| `horeca-interior-design.jpg`, `horeca-interior-sconces.jpg`, `horeca-atmosphere-candle.jpg` | Restaurant architecture, materials, lighting, and atmosphere |
| `horeca-ceramic-serve.jpg`, `horeca-sensory-tasting-lab.jpg`, `horeca-neurogastronomy-serve.jpg` | Tableware, sensory testing, and neurogastronomy |
| `horeca-sustainable-terroir.jpg` | Fermentation, terroir, and mindful gastronomy |
| `horeca-tech-operations.jpg`, `horeca-ai-mixology-lab.jpg` | Hospitality technology, operations, and AI-assisted beverage R&D |
| `horeca-concept-pitch.jpg` | Concept development, moodboards, and venue planning |

## Project photography (author's own practice)

The `project-*.jpg|png` files document the author's own venues, identities and design work. The app uses photographs from this archive for the access-page visual, course landing hero, selected module covers, Projects of the Author, and matching case files. Joi and Pacific are visual references for the film-inspired macro direction: close tactile details, a narrow plane of focus and the tonal character of professional analogue film.

| Prefix | Project | Photographs |
| --- | --- | --- |
| `project-joi-*` | Joi Espresso Bar (opened 2025 by OGONEK TEAM) — espresso bar assembled from the street | 9 |
| `project-passie-*` | Passie Cakes Co. — cake room where props and graphics carry the identity | 7 |
| `project-coocoo-*` | CooCoo Coffee (coffee · croffles · cookies) — street concept on one product trio | 5 |
| `project-chicken-connection-*` | Chicken Connection, Moscow — pilot episode filmed with Dmitry Konnikov | 2 |
| `project-pacific-*` | Pacific (bar solutions) — bar stations, consoles and equipment drawings | 5 |
| `project-tam-*` | TAM / TYT — flavour cubes, tool set, bar blade, folding stool and textiles | 7 |
| `project-detail-*` | Found objects and small details collected across the venues | 8 |

These files are generated from the original camera files kept in the repository root by `presentation/build/build_project_assets.py` (maximum edge 1400 px, EXIF stripped, JPEG quality 82). Do not edit them by hand — re-run the script instead. The Chicken Connection sources are screenshots of the published episodes; the script crops away the video interface and keeps the frame only.

The presentation set combines the author's project archive, curated editorial references and deck-specific thematic hospitality imagery, optimised to a maximum dimension of 1400 px for compact, reproducible PDFs. The course app's gate and module covers do not use the rejected generic generated series. No institute photographs are included.

## Provenance and in-app credits

| Files | Provenance | App usage |
| --- | --- | --- |
| `project-*`, `author-*` | © Egor Tarasenko — author’s personal archive (derived from the camera files in the repository root) | Primary imagery of the course app: modules, lessons, cases about the author’s own venues, projects, gate and landing visuals |
| `case-*`, `figure-*` | Editorial reference photographs of industry figures and venues, © the respective photographers and venues, curated from public press materials | Person cards and case files only; each rendered image carries a micro-credit and appears on the in-app `#/credits` page with a takedown contact |
| `him-logo-white.png` | © Swiss Education Group / HIM Business School | Identification only |
| `web-insider-hall.jpg`, `web-insider-station.jpg`, `web-insider-lab.webp` | Insider Bar Lab (Sretenka 22/1, Moscow) — © Insider Bar / @insider.bar.lab; publicly available venue photographs via the venue’s TripAdvisor page and the Cocktail Pilgrim feature | Preserved editorial references in the asset archive; each source and takedown contact are recorded in `course-data.js`. They are not used as access-page or module-cover images. |
| `project-joi-bar-ai.jpg`, `project-detail-nine-lives-bar-ai.jpg` | Subtle AI exposure/shadow-detail recovery from the author’s own originals (`project-joi-bar.jpg`, `project-detail-nine-lives-bar.jpg`); composition, subjects and text unchanged | Rendered in place of the under-exposed originals; disclosed in-app as “AI-processed” under the image and on `#/credits` |
| `horeca-*` | Curated thematic references for the proposal deck | Deck only — **not rendered by the course app** since the October 2026 provenance review |

Three author-archive photographs (`project-detail-nine-lives-bar.jpg`, `project-chicken-connection-kitchen.jpg`, `project-tam-flatlay.jpg`) are used as **illustrative** images inside third-party case files and are labelled “illustrative · author’s archive · not the venue” both under the image and on the credits page.

Asset set reviewed on 30 September 2026; provenance policy revised on 4 October 2026. The HIM logo remains the property of its respective rights holder. Project photography remains the property of Egor Tarasenko.
