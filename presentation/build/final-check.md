# Final check — 29 October 2026

The course was checked end to end before it is called finished: the numbers the app and the gate print,
the source it is built from, the fifty-two drawings it shows, the text a student reads and the protection
around all of it. Everything below was run against the working tree, not remembered.

## What was broken, and is fixed

**The last two lesson headers were never wired to their lessons.** `illo-lesson-scenography.jpg` and
`illo-lesson-final-brief.jpg` were published, counted by the test suite and promised by the README, but
the `thumbnail` key had been inserted twice into the Joi project record in `presentation.projects` — a
second copy of a key that the project never reads — and not into the two lessons. Both lessons silently
fell back to their module cover, so Module 09 taught two units with one picture and the two drawings were
displayed nowhere in the app. Fixed: each lesson now names its own header, and the duplicated keys are gone.
A regression test walks all twelve lesson screens and fails if any of them shows the module cover.

**The gate sold thirteen units.** `access.js` printed `<strong>13</strong> Learning units` on the public
start page while the app, the syllabus, the lectures and the README all said twelve. The cause was upstream:
`lessons.txt` numbered the final unit `LESSON 13`, `Assignment 13`, and the build tool worked around it with
`number: '12', source: '13'`. The source is renumbered to 12 and the workaround is removed, so there is one
number for the last unit wherever it appears. A test now reads the counts out of the course data and requires
the gate to print them.

**The published course was one edit away from being stale.** `course-data.js` is generated from
`lessons.txt`, and the tool only emitted the twelve challenge strings from its own curated metadata — so a
challenge edited in the app could never be reproduced by a rebuild, which is the drift that let the "13"
survive. The tool now emits the reviewed challenge text and each lesson's header, and a rebuild is
byte-identical to the published file. A test builds the course in a temporary directory and fails if the
result differs by a single character.

**README carried three contradictions.** The old gouache paragraph for the lesson headers described a set
that no longer exists; the bookkeeping list still said ten headers were published; the closing line still
counted forty illustrations where fifty-two are published; and "Module 09 — Budget Realisation & Scenography"
appeared twice. All four are corrected, and the new paragraphs say plainly that the headers are sketch pages
and that the deck is the *proposal* (six modules, twelve weeks) rather than a description of the shipped app.

## What was checked and stands

| | Result |
| --- | --- |
| `npm run check` | clean |
| `npm test` | 41 pass, 0 fail (was 38; three guards added) |
| Published illustrations | 52 `illo-*` files, pinned count matches the suite |
| Asset references | every image name in `app.js`, `access.js`, `site-copy.js`, `author.js`, `course-data.js` resolves to a file on disk |
| Dimensions | 12 case cards 1264 × 848 · 11 portraits 848 × 1264 · 10 module covers and 12 lesson headers 1264 × 843 · hero and gate 1080 × 1620 · 5 author illustrations at their archive sizes |
| Lesson headers | each one is on its own lesson screen; every page carries one small red mark (5–29 red pixels at 320 px wide) and no lettering |
| Paper | every sketch page is pure white at all four corners, so the stylesheet's multiply blend and 5–6 % feathered mask land inside blank paper and the drawing has no edge |
| Access | `/course-data.js` and `/presentation/dist/` answer 403 without a session; all twelve headers answer 200 with one |
| Numbering | ten modules, twelve units, assignments 03–12 plus the two opening challenges, no unit numbered twice, no "13" anywhere |
| Source of truth | `node tools/build-course-lessons.js` reproduces `course-data.js` byte for byte |

## What is left open on purpose

- **`illo-m03-senses.jpg`** — the audit asked for the tasting glass to be moved off the drinker's nose. At
  200 % the rim's left edge meets the upper lip, not the nose; the glass is at the mouth, which is where a
  glass being raised to taste belongs. Re-checked and left as published; recorded in
  `illustration-audit.md` §11.
- **No `illo-figure-jiro.jpg`** — Jiro Ono appears in two case files through photographs. A portrait was
  never commissioned and the series is closed at fifty-two; he carries no drawn twin.
- **The pitch deck is not rebuilt.** It describes the elective as proposed, which is what the README says it
  is. Nothing in it is a claim about the shipped app.
- **The two tests the drawings are judged by** (obvious resemblance, one hand across the series) are written
  into the README and govern any future drawing; the sketch-page set is the one documented exception to the
  gouache direction, recorded in `illustration-prompts.md`.

## How to check it by hand

```bash
npm run check && npm test
COURSE_PASSWORD=<password> node server.js   # open the gate, sign in, walk the twelve units
```

The twelve lesson headers, in curriculum order:

`signals` · `atmosphere` · `perception` · `point-of-view` · `concept-objects` · `automation` ·
`human-ai` · `new-formats` · `from-idea` · `budget-builds` · `scenography` · `final-brief`
