# Presentation assets

These assets support the English-language Contemporary Horeca Scene course deck. They are included for reproducible builds; the presentation is a course proposal, not an official HIM Business School publication.

## Brand asset

| File | Source |
| --- | --- |
| `him-logo-white.png` | Official HIM logo asset linked from the [Swiss Education Group HIM Business School page](https://www.swisseducation.com/en/him-business-school/). |

## Polychrome cartoon illustrations

The `illo-*.jpg` files are AI-generated course illustrations art-directed to resemble loose hand-inked cafe doodles: slightly irregular black outlines, flat gouache-like fills on white and one small signal-red `#e42313` accent. They illustrate concepts rather than document specific venues, and are labelled *illustration · original course graphic · AI-generated* in the app. All twelve case-card covers (`illo-case-benfiddich-kayama.jpg`, `-black-swan-bobkov.jpg`, `-shapes-savage.jpg`, `-sips-caporale.jpg`, `-el-copitas-zernov.jpg`, `-city-space-narzi.jpg`, `-sensory-talalay.jpg`, `-jiro-ono.jpg`, `-krasota-zarkov.jpg`, `-dave-arnold.jpg`, `-rene-redzepi.jpg`, `-alex-kratena.jpg`) are redrawn from each case's own reference photograph. The case-file photographs themselves remain unchanged, their untouched originals are retained as `originals/case-*.jpg` and every redrawn cover links that source in the in-app credits.

| Surface | Size | Files |
| --- | --- | --- |
| Access page (vertical) | 1080 × 1620 | `illo-gate-still-life.jpg` |
| Landing hero (vertical) | 1080 × 1620 | `illo-hero-scene.jpg` |
| Module covers (3:2) | 1264 × 843 | `illo-m01-signals.jpg` … `illo-m10-mockup.jpg` |
| Case-card covers (3:2) | 1264 × 848 | `illo-case-*.jpg` |

The committed JPEGs are the current published assets; source PNGs and generations in `tmp/` are not retained in the repository. `presentation/build/build_illustrations.py` is an optional layout/export tool, not an image generator. It reads user-supplied PNG masters and **overwrites** the corresponding JPEGs, so use only masters that match the current direction and review the result before publishing. The scene references and art direction are recorded in `presentation/build/illustration-prompts.md`.

The app marks every `illo-` file with the `illo-photo` class, so drawn covers are shown whole on white paper instead of being cropped like a camera frame, and the access panel switches to a light sheet with ink-coloured type (`.gate-visual.is-illustration`).

| File | Use |
| --- | --- |
| `illo-gate-still-life.jpg` | Access page still life (vertical) |
| `illo-hero-scene.jpg` | Course landing hero — the bar as a stage set (vertical) |
| `illo-m01-signals.jpg` … `illo-m08-venture.jpg` | Module covers 01–08 (3:2) |
| `illo-m09-found.jpg`, `illo-m10-mockup.jpg` | Module covers 09–10 (3:2) |
| `illo-case-benfiddich-kayama.jpg`, `illo-case-black-swan-bobkov.jpg`, `illo-case-shapes-savage.jpg`, `illo-case-sips-caporale.jpg`, `illo-case-el-copitas-zernov.jpg`, `illo-case-city-space-narzi.jpg`, `illo-case-sensory-talalay.jpg`, `illo-case-jiro-ono.jpg`, `illo-case-krasota-zarkov.jpg`, `illo-case-dave-arnold.jpg`, `illo-case-rene-redzepi.jpg`, `illo-case-alex-kratena.jpg` | Case-card covers, drawn per case (3:2). Each case file keeps its separately credited source image |

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

The `project-*.jpg|png` files primarily document the author's own venues, identities and design work. `project-passie-room.jpg` is an AI-generated illustration based on an author-archive photograph, not a documentary photograph. The app uses this archive for Projects of the Author and matching case files; the About-the-author dialog thumbnails use the `illo-author-*` illustration series, and the access page, landing hero and module covers use the `illo-*` illustration series.

| Prefix | Project | Images |
| --- | --- | --- |
| `project-joi-*` | Joi Espresso Bar (opened 2025 by OGONEK TEAM) — espresso bar assembled from the street | 9 |
| `project-passie-*` | Passie Cakes Co. — cake room where props and graphics carry the identity | 7 |
| `project-coocoo-*` | CooCoo Coffee (coffee · croffles · cookies) — street concept on one product trio | 5 |
| `project-chicken-connection-*` | Chicken Connection, Moscow — pilot episode filmed with Dmitry Konnikov | 2 |
| `project-pacific-*` | Pacific (bar solutions) — bar stations, consoles and equipment drawings | 5 |
| `project-tam-*` | TAM / TYT — flavour cubes, tool set, bar blade, folding stool and textiles | 7 |
| `project-detail-*` | Found objects and small details collected across the venues | 8 |

Most of these photographs were prepared from original camera files by `presentation/build/build_project_assets.py` (maximum edge 1400 px, EXIF stripped, JPEG quality 82). The script is a photo exporter, not an illustration generator; re-running it can overwrite a restyled asset with a photograph. The source of `project-passie-room.jpg` is retained as `passiecakes_7625.jpeg` in the repository root. The Chicken Connection sources are screenshots of the published episodes; the script crops away the video interface and keeps the frame only.

The presentation set combines the author's project archive, curated editorial references and deck-specific thematic hospitality imagery, optimised to a maximum dimension of 1400 px for compact, reproducible PDFs. The course app's gate and module covers do not use the rejected generic generated series. No institute photographs are included.

## Provenance and in-app credits

| Files | Provenance | App usage |
| --- | --- | --- |
| `project-*` except `project-passie-room.jpg` | © Egor Tarasenko — author’s personal archive (derived from the camera files in the repository root) | Project and course photographs |
| `author-*` | © Egor Tarasenko — author’s personal archive | Retained as the credited sources of the `illo-author-*` illustrations; no longer rendered directly |
| `illo-author-*` | AI-generated illustrations based on the `author-*.jpg` archive photographs © Egor Tarasenko | About-the-author dialog and author figure card, labelled as illustrations with sources linked |
| `project-passie-room.jpg` | AI-generated illustration based on `passiecakes_7625.jpeg` © Egor Tarasenko | Labelled as an illustration in the project gallery and image credits |
| `illo-*` | AI-generated course graphics | Labelled as illustrations, never as venue photographs |
| `originals/case-*.jpg` | The credited case-file photographs, kept as the reference sources of the redrawn case cards | Not rendered; linked from each `illo-case-*.jpg` credit |
| `case-*`, `figure-*` except `figure-jiro.jpg` | Editorial reference photographs of industry figures and venues, © the respective photographers and venues, curated from public press materials | Person cards and case files only; each rendered image carries a micro-credit and appears on the in-app `#/credits` page with a takedown contact |
| `figure-jiro.jpg` | AI-generated illustration based on the editorial reference portrait preserved at `originals/figure-jiro.jpg`; © respective photographer | Labelled as an illustration in the person card and image credits |
| `him-logo-white.png` | © Swiss Education Group / HIM Business School | Identification only |
| `web-insider-hall.jpg`, `web-insider-station.jpg`, `web-insider-lab.webp` | Insider Bar Lab (Sretenka 22/1, Moscow) — © Insider Bar / @insider.bar.lab; publicly available venue photographs via the venue’s TripAdvisor page and the Cocktail Pilgrim feature | Preserved editorial references in the asset archive; each source and takedown contact are recorded in `course-data.js`. They are not used as access-page or module-cover images. |
| `project-joi-bar-ai.jpg`, `project-detail-nine-lives-bar-ai.jpg` | Subtle AI exposure/shadow-detail recovery from the author’s own originals (`project-joi-bar.jpg`, `project-detail-nine-lives-bar.jpg`); composition, subjects and text unchanged | Rendered in place of the under-exposed originals; disclosed in-app as “AI-processed” under the image and on `#/credits` |
| `horeca-*` | Curated thematic references for the proposal deck | Deck only — **not rendered by the course app** since the October 2026 provenance review |

Three author-archive photographs (`project-detail-nine-lives-bar.jpg`, `project-chicken-connection-kitchen.jpg`, `project-tam-flatlay.jpg`) are used as **illustrative** images inside third-party case files and are labelled “illustrative · author’s archive · not the venue” both under the image and on the credits page.

Asset set reviewed on 30 September 2026; provenance policy revised on 4 October 2026. The HIM logo remains the property of its respective rights holder. Project photography remains the property of Egor Tarasenko.

## Practitioner portrait illustrations

Eleven `illo-figure-*.jpg` portraits are AI-generated interpretations of the corresponding `figure-*.jpg` editorial photographs retained in this directory. They follow the hand-inked, pastel city-life direction supplied by the course author. The app labels each as an illustration and links its source photograph in image credits; they are not documentary photographs. Jiro’s existing illustrated portrait remains in place; with Igor Zernov’s portrait the set is complete, and every `figure-*.jpg` editorial photograph is now retained as a credited source rather than rendered directly.

## Author project illustrations

Five `illo-author-*.jpg` images are AI-generated interpretations of the corresponding `author-*.jpg` archive photographs of the author’s own projects, kept at the published dimensions of their sources: `illo-author-passie-2022.jpg` (600 × 900), `illo-author-coocoo-2024.jpg` (900 × 900), `illo-author-pacific-2024.jpg` (675 × 900), `illo-author-joi-2025.jpg` (675 × 900) and `illo-author-chc-2024.jpg` (900 × 466). They are shown in the About-the-author dialog and on the author figure card, where a note states that the project images are illustrations; brand lettering present in the sources (machine badges, posters, crate prints, wordmarks) is omitted or replaced with blank panels, and each carries one small signal-red accent. The archive photographs remain in this directory as the credited sources.
