# Illustration prompt library

The `illo-*.jpg` series consists of AI-generated course illustrations. Use the existing image for the particular scene as the subject/composition reference and `style-ref-1.jpeg`, `style-ref-2.jpeg` or an already-approved course illustration as the style reference. Preserve the existing subject; never substitute an unrelated generic scene. The JPEGs in `presentation/assets/` are the published files. `build_illustrations.py` is an optional exporter, not a generator, and overwrites those files when supplied with PNG masters.

## Shared art direction — prepend to every scene

> Friendly, hand-drawn Korean cafe-poster / editorial doodle aesthetic. Confident,
> slightly irregular black ink outlines; flat matte gouache-like fills in soft blue,
> green and warm golden-brown. Pure white background, generous white space and a
> simplified subject. Exactly one small signal-red `#e42313` accent. No text,
> lettering, invented logos, signature, watermark, frame or photorealistic texture.
> Preserve the main elements and layout of the source image while simplifying it.

Use the target aspect ratio and existing dimensions for the file. The red accent is
singular so the series stays coherent and the brand colour remains meaningful.

The case cards follow the source hierarchy in `course-data.js`: draw each one from that case's own
documentary photograph (`presentation/assets/originals/case-<slug>.jpg`, retained there as the credited
source), not from another illustration. Redraw the room, counter and objects that are actually in the
photograph — the venue stays recognisable — and simplify rather than invent. Published files stay at
1264 × 848 with white paper edges, and each cover carries an exact-file credit that links its photograph.

## Direction note — module covers, October 2026

The ten module covers keep the series' drawing style (one thin wobbly ink contour, flat gouache fills, white
paper, one signal-red accent) but move their subjects to the present: glass-front pavilions, blank touchscreen
kiosks, floating blank panels, sensor bases, service arms and study-doll dimension lines instead of awnings,
chalkboards and craft clutter. Ergonomic frames are drawn as futuristic workstations — a wafer-thin cantilevered
console, an articulated service arm, a translucent study figure with joint rings and unnumbered dimension lines.
Nothing in these frames carries lettering, numbers, logos or interface copy: screens, notes, tags and panels stay
blank or carry ruled lines only.

## Surface plan

| Master | Asset | Surface | Scene | Red accent |
| --- | --- | --- | --- | --- |
| `hero.png` | `illo-hero-scene.jpg` | 1080 × 1620 | A bar counter as a theatre stage: a rounded arch frames a back-bar shelf with bottles and a plant; two guests on tall stools with a coupe and a tumbler; a bartender shakes a shaker; one pendant lamp | the lamp shade |
| `gate.png` | `illo-gate-still-life.jpg` | 1080 × 1620 | A round cafe table seen at an angle: takeaway cup, coupe with a cherry, candle in a brass holder, slim vase with one branch, folded napkin, bar spoon, two stacked saucers | the candle flame |
| `m01-signals.png` | `illo-m01-signals.jpg` | 1264 × 843 | A modern glass-front cafe pavilion in three-quarter view — flat cantilevered canopy, curved single pane, two stools inside, one plant; a blank touchscreen kiosk on a slim stand in front; three blank floating panels above the roof with hairline signal lines and square nodes; one thin cyan scanning line crosses the facade | the cafe door frame |
| `m02-atmosphere.png` | `illo-m02-atmosphere.jpg` | 1264 × 843 | A modern dining room with a suspended lighting rail: three flat spotlight heads casting clean pale-yellow pools on the floor, one spotlight in red; a projected peach circle on the back wall; a guest at a round table with a glass, a server walking in with a tray, a low planter | the spotlight head |
| `m03-senses.png` | `illo-m03-senses.jpg` | 1264 × 843 | A guest at a table with eyes closed lifting a futuristic slim tasting vessel with a curved asymmetric bowl and a pale-blue rim; a low plate with three neat shapes sitting on a slim sensor base with a thin cyan ring and tick marks; a blank floating panel; no steam curls, no notes | one shape on the plate |
| `m04-menu.png` | `illo-m04-menu.jpg` | 1264 × 843 | A pedestal table with a sculptural matte-stone menu slab leaning on a minimal metal stand, its face split into blank ruled panels, a red ribbon bookmark; a blank card, a slim ring-bound stack, a low chair, a cloth over the edge, a measured arc above | the ribbon bookmark |
| `m05-automation.png` | `illo-m05-automation.jpg` | 1264 × 843 | Futuristic ergonomics: an anatomical study doll with joint circles and dimension lines beside a cantilevered bar station — wafer-thin overhanging worktop on one tapered wedge leg, glass end panel, recessed sink well, three hanging bottles, a slim three-joint service arm holding a glass; one blank floating panel | a button on the station |
| `m06-ai.png` | `illo-m06-ai.jpg` | 1264 × 843 | A woman in an apron with a blank upright tablet beside a friendly wheeled service robot with a blank visor band and a telescopic arm offering a bowl; three blank diagram panels in a row above, a pale blue sheet on the table, a plain cup and a folded cloth | a light on the robot's shoulder |
| `m07-fnb.png` | `illo-m07-fnb.jpg` | 1264 × 843 | Farm-to-glass as a testing bench: a black hanging rail with three suspended bunches (herb sprig, thin stems, root with tendrils); on a white bench a mortar and pestle, a beaker of pale green liquid, stacked petri dishes with three leaves, a straight-sided highball with ice, and an empty glass cloche on a black base | one small berry |
| `m08-venture.png` | `illo-m08-venture.jpg` | 1264 × 843 | Three people at a long pale table: one standing and pointing at an unrolled blank technical sheet, two seated with a cup and folded hands; in the centre a white cut-card model of a bar counter with two stools and a thin screen, a rolled plan, a tray of three cups, an upright blank tablet, three blank panels above | the flag on the model |
| `m09-found.png` | `illo-m09-found.jpg` | 1264 × 843 | Found objects archived like a museum sheet on a white bench: a pale wooden crate, a floral plate standing on edge, a brass bell, a green bottle with a candle stub, a folded linen napkin and a stoneware cup, each with a blank paper tag on a thread and hairline connectors | a tiny berry beside the bell |
| `m10-mockup.png` | `illo-m10-mockup.jpg` | 1264 × 843 | A designer's bench: a person in a hoodie placing the last wall panel onto a cut-card model of a bar on a slim round turntable; a cutting mat with a plain ruler, a scalpel, a steel rule, a glue stick, a blank tablet with an empty plan outline, a clip-on task light and a plant — every surface blank, no lettering | the tiny pendant lamp in the model |
| `case-benfiddich-kayama.png` | `illo-case-benfiddich-kayama.jpg` | 1264 × 848 | The barkeep at work behind a dark mahogany counter: white jacket over a white shirt with a dark red tie, a red serving mat carrying a glass mixing glass, glass jars of dried botanicals and two small bowls along the counter; dark timber shelving full of amber bottles on both sides, a framed painting and a bundle of dried herbs behind him | the red tie and mat | one small bottle cap |
| `case-black-swan-bobkov.png` | `illo-case-black-swan-bobkov.jpg` | 1264 × 848 | Ornate door at left, framed art, an armchair, beer taps and a table with a teapot and candelabrum | the armchair cushion |
| `case-shapes-savage.png` | `illo-case-shapes-savage.jpg` | 1264 × 848 | The room from the source photograph: black steel bottle shelving standing on a green laminate table, bottles carrying colour-coded bands; a framed poster with a blue circle and a yellow triangle standing on the table; two red stools on the floor in front; the rust-brown wall panel at the right | the two red stools |
| `case-sips-caporale.png` | `illo-case-sips-caporale.jpg` | 1264 × 848 | The room from the photograph: a black ceiling band over bottle-green walls, two long lit back-bar shelves of bottles with an espresso machine beneath them, the black island bar with a pale stone top standing in the middle of the room, two green-seated stools with gold legs in front of it, a tall street window with trees at the right, dark plank floor | the red light on the espresso machine | one cocktail garnish |
| `case-el-copitas-zernov.png` | `illo-case-el-copitas-zernov.jpg` | 1264 × 848 | Courtyard with central arched doorway and curtain, paper bunting, potted plants, clay cups and cactus | one bunting flag |
| `case-city-space-narzi.png` | `illo-case-city-space-narzi.jpg` | 1264 × 848 | The lounge from the photograph: the curved wall of slanted glazing over a deep blue night band, the red ceiling sweep, the magenta-and-blue striped floor, brown armchairs with cream cushions and round tables carrying a candle and a coupe, the long bar with tall stools and a bartender at work, the slim gold guardrail passing in front of the chairs | the nearest candle | a stopwatch button |
| `case-sensory-talalay.png` | `illo-case-sensory-talalay.jpg` | 1264 × 848 | The source photograph's board: a thick wooden serving board with a carved rim on a low foot, its rim traced by one thin pale-cyan neon line; a tall tumbler of iced water with a straw standing on it, a dark canapé at the left and a leaf-wrapped canapé at the right; one smaller paler board behind, both on the same surface | the red band at the top of the straw |
| `case-jiro-ono.png` | `illo-case-jiro-ono.jpg` | 1264 × 848 | The room from the photograph: the long counter running diagonally under a hanging beam, dark navy noren panels across it, a shelf of bowls and a wall cabinet behind, the two chefs in white on the far side, leather-topped stools along the near side, the ceiling of square light fittings | the tray on the counter | the fish on the nigiri |
| `case-krasota-zarkov.png` | `illo-case-krasota-zarkov.jpg` | 1264 × 848 | The circular projection table seen from a raised angle: a dark seascape with a pale shoreline spread over the tabletop, a solid black void at its centre, plates, glasses and cutlery round the rim, the ring of guests seen from behind, the curved screen of sea and blossom behind them, two waiters in pale outline at the far edge | the cushion beside the right-hand guest | the cushion beside the right-hand guest |
| `case-dave-arnold.png` | `illo-case-dave-arnold.jpg` | 1264 × 848 | The bartender in a charcoal sweater over a checked collar, pouring from a raised shaker tin through a julep strainer into a coupe held low in the other hand, a thin stream joining the two, one curl of vapour rising off the glass; a counter with a real front edge carrying a jigger, a fine strainer, two stacked coupes and a mixing pitcher, each group with one flat shadow | the ring on his finger |
| `case-rene-redzepi.png` | `illo-case-rene-redzepi.jpg` | 1264 × 848 | The chef laughing with both hands on his hips, navy tee and grey canvas apron, herbs rising from the chest pocket, warm wall panel and a shelf of plain bowls behind him | the apron tie |
| `case-alex-kratena.png` | `illo-case-alex-kratena.jpg` | 1264 × 848 | The owner in a black cap with a thin red brim, clear glasses and a short beard, a black utility gilet over a grey tee, a phone in his right hand, a dense ornamental tattoo over his right forearm, the second man in a black beanie drawn in pale outline behind him, a plain warm-grey wall and one doorway outline | the red brim of the cap | the stirrer standing in the glass on the counter |

## Redraw pass — October 2026

The case-card rows above were brought back in line with the published files. Three cards and two
portraits were redrawn from their photographs because the resemblance had stopped being obvious; the
review that produced the list, and the reasons for each call, are in `illustration-audit.md`.

Redrawn from the photograph: `illo-case-sensory-talalay.jpg` (the board, the iced glass and the lit
rim, instead of an invented pipette still life), `illo-case-shapes-savage.jpg` (the green table,
colour-coded bottle shelf and red stools), `illo-case-dave-arnold.jpg` (a real pour joined by a
stream, a counter with an edge), `illo-figure-zarkov.jpg` and `illo-figure-talalay.jpg` (both were
drawn as different men in different rooms than their sources).

Second pass, same rule: `illo-case-benfiddich-kayama.jpg` (white jacket, red tie, mahogany counter,
amber bottles), `illo-case-sips-caporale.jpg` (black ceiling, green walls, black island, espresso
machine), `illo-case-city-space-narzi.jpg` (red ceiling, magenta-and-blue floor, blue night band),
`illo-case-krasota-zarkov.jpg` (the dark projection and its black centre, no fire on the table),
`illo-case-alex-kratena.jpg` (ornamental sleeve with no lettering in it, phone in the right hand)
and `illo-case-jiro-ono.jpg`, which keeps its drawing and only takes the noren from pale blue to
dark navy.

When redrawing from a photograph, keep the four anchors the reader uses to recognise a place: the
room's palette, the counter material, the signature object and the subject's garment. Then check the
picture against the list in `illustration-audit.md` §9 — support, hands, liquids, one horizon,
palette, no foreground left in outline — before it is published.

## Lesson headers — the diorama set (October 2026)

The twelve lesson headers are one diorama, drawn as twelve isometric cards on a shared grid. When drawing
or redrawing any of them, hold every rule below: a card that breaks one of them cannot be assembled with
the rest.

**Grid.** Isometric, same block thickness, same floor-to-ceiling height, same camera angle for all twelve.
The block floats on white paper — no ground plane, no horizon, no sky, no drop shadow outside the block.

**Two sides.** Left: the designed interior in the pale palette (cream, sage, dusty blue, warm clay,
off-white), furnished like architecture — fluted timber, bouclé, brass, plaster, stone inlays, one
statement light. Never generic café equipment. Right: the tools of that lesson in strict black and white,
thin outline only, no fill and no tinted shadow, four objects in a loose column with white space between.

**One line.** Median ink stroke 2 px at 1264 × 843; no line anywhere thicker than another; flat gouache
fills; no gradients, no texture, no lettering, no numerals, no logos.

**One red.** A single `#e42313` dot; on these cards it sits on the tool that is the lesson's control.

| Card | Lesson | Left — the room | Right — the tools (black and white) |
| --- | --- | --- | --- |
| `illo-lesson-signals.jpg` | 01 Look Beyond the Surface | espresso bar: fluted counter, bouclé banquette, brass shelves, dome pendant | phone, folded plan, loupe, spirit level |
| `illo-lesson-atmosphere.jpg` | 02 Designing atmosphere | dining room at dusk: clay plaster, stepped floor, water channel, bouclé bench | colour fan, fabric swatch, light meter, 1:20 model |
| `illo-lesson-perception.jpg` | 03 The senses at the table | tasting room: one stone disc on an off-axis column, rim trough | pipette, precision scale, three glasses, weighed spoons |
| `illo-lesson-point-of-view.jpg` | 04 Concept manifestos | concept bar: cast concrete block, dry-stone wall, three unlike stools | menu book, loose sheet, rubber stamp, ring of cards |
| `illo-lesson-concept-objects.jpg` | 05 Concept objects | object gallery: pale plinth, shadow gap, hairline callouts | object maquettes on a tray |
| `illo-lesson-automation.jpg` | 06 Automation | service station: floating monolith, hidden lift, ribbed pillar, thin arm | calipers, torque driver, sealed capsule, stopwatch |
| `illo-lesson-human-ai.jpg` | 07 AI as a tool | back-of-house prep room: stainless bench, pass hatch, cool room door | tablet, stylus, printed brief, small robot arm |
| `illo-lesson-new-formats.jpg` | 08 The next table | origin table: growing wall, prep bench, finished serve | secateurs, cutting board, glass cloche, tasting spoon |
| `illo-lesson-from-idea.jpg` | 09 From idea to operating model | plan block: zones as furniture, capacity implied by the seats | rolled plan, ring binder, calculator, site rule |
| `illo-lesson-budget-builds.jpg` | 10 Soul before budget | salvage corner: three anchor objects, raw material language | tape measure, chalk, invoice book, key ring |
| `illo-lesson-scenography.jpg` | 11 Theatrical techniques | table vignette: found objects lit from one side | candle, napkin ring, small bell, blank menu card |
| `illo-lesson-final-brief.jpg` | 12 The final brief | **the assembled diorama** — the twelve blocks joined | the twelve tools gathered at small scale |

Card 12 is the diagram of the whole set: it is drawn last and must literally show the joined blocks.

## Lesson headers

Every lesson file opens with its own header image instead of borrowing the module cover, so two lessons in
one module no longer show the same picture. Published at 1264 × 843 in the same art direction as the module
covers: thin wobbly ink contour, flat gouache fills, white paper, one signal-red accent, and no lettering,
numerals, logos or interface copy — screens, plans, tags and panels stay blank or ruled only.

| Asset | Lesson | Scene | Red accent |
| --- | --- | --- | --- |
| `illo-lesson-signals.jpg` | 01 · Look Beyond the Surface | A guest holds a slim phone at a glass-front cafe; three blank overlay panels draw the same room as a plan with square nodes; one thin cyan scan line down the facade | a strip on the counter inside |
| `illo-lesson-atmosphere.jpg` | 02 · Designing atmosphere | A small dining room, the back wall covered by a projected pattern of large flat shapes from a ceiling projector; a guest at a round table, a server with a tray, a suspended spotlight rail | the projector lens |
| `illo-lesson-perception.jpg` | 03 · The senses at the table | A guest tasting from a futuristic vessel; three shapes on a sensor base with a cyan ring; a camera on a tripod and a blank slab; an abstract rising bar panel without numbers | one shape on the plate |
| `illo-lesson-point-of-view.jpg` | 04 · Concept manifestos | A person presenting at a blank two-rule screen with a slim remote; a cut-card bar model, blank cards and a blank tablet on the bench; one listener in a chair | a line on the screen frame |
| `illo-lesson-concept-objects.jpg` | 05 · Concept objects | Five designed objects in a line-up on a bench — stone menu slab, steel cube, folding stool, bar blade, folded sock — with hairline callout circles | one rivet on the blade |
| `illo-lesson-automation.jpg` | 06 · Automation, ergonomics & the Horeca Code | **Futuristic ergonomics**: a translucent study figure with joint circles beside a wafer-thin cantilevered console, glass end panel, recessed well, hanging bottles, pump tower, unnumbered dimension lines and a reach arc | the pump button |
| `illo-lesson-human-ai.jpg` | 07 · AI as a creative tool | A designer with a blank tablet and a three-segment robotic arm placing a component on a cut-card model; a floating abstract grid panel | a light on the arm base |
| `illo-lesson-new-formats.jpg` | 08 · The next table | A counter with a wall-mounted vertical growing rack under a grow-light, trays of shoots, and a bartender garnishing a highball | one berry in the tray |
| `illo-lesson-from-idea.jpg` | 09 · From idea to operating model | Three people over a wide table with a cut-card bar model, rolled plan, ring binder, tray of cups and a plant; three blank panels above | a band on the binder |
| `illo-lesson-budget-builds.jpg` | 10 · Soul before budget | A compact espresso bar in a vaulted brick arcade: machine, red grinder, four stacks of blank cups, crate seats, festoon bulbs, a blank taped sign panel | the grinder body |
| `illo-lesson-scenography.jpg` | 11 · Theatrical techniques & the live mockup | A found-object set on a cloth-covered table — crate riser, antique plate, candlestick, glass, napkin, bell, dried flower — with a blank backdrop and a hand framing it on a blank tablet | the candle flame |
| `illo-lesson-final-brief.jpg` | 12 · Design the concept of tomorrow | A finished cut-card bar model on a round plinth under one flat spotlight, plans, folder, tray of cups, blank tablet; two people studying it, one with a blank clipboard | the tiny pendant lamp |

## Project files — no drawn twins

The author's own project files are photographed evidence and carry **no** illustrations. The 23
`illo-project-*` covers and gallery frames described in earlier revisions of this file were withdrawn on
28 October 2026 at the author's instruction: every `project-*` file opens with its own lead photograph and
contains only photographs, captions and credits. Do not draft a project cover or a project gallery frame
again, and do not reuse the retired prompt rows; the case covers, module covers, hero, gate, practitioner
portraits and author-dialog illustrations are unaffected.

## Practitioner and author portrait illustrations

The portrait series redraws each person or project from its own retained source
image instead of inventing a scene. Practitioner portraits are published at
848 × 1264; the author project illustrations keep the pixel dimensions of their
archive sources. The shared art direction applies; the single red accent is a
small element already present in the source (Zernov's LED tally board, the
Pacific pump button, the Joi arcade door glass, the chicken mascot's comb, the
Passie rose bouquet, the CooCoo wall stripe). Brand lettering in the sources —
machine badges, menu boards, posters, crate prints, wordmarks — is omitted or
replaced with blank panels, never retyped.

| Asset | Source | Scene | Red accent |
| --- | --- | --- | --- |
| `illo-figure-zernov.jpg` | `figure-zernov.jpg` | Smiling man with round amber glasses and short beard, oversized black tee, takeaway cup with straw, brick basement pass with bamboo steamers, rice cooker and pendant lamp | the blank LED tally board |
| `illo-figure-zarkov.jpg` | `figure-zarkov.jpg` | Long dark-brown hair and beard, white crew-neck tee, dark trousers, sitting relaxed in a white armchair with one ankle over the opposite knee, a clear water bottle on the paper floor beside the chair | the bottle cap |
| `illo-figure-talalay.jpg` | `figure-talalay.jpg` | Bald man with round glasses and a short grey beard standing behind a bar counter, stone linen overshirt over a white tee, one arm raised with a small tumbler, the other hand flat on the counter; two arches, a bottle shelf and a pendant lamp behind | the round orange-red graphic on the tee |
| `illo-author-passie-2022.jpg` | `author-passie-2022.jpg` | Blush-pink cake room: garlanded L-counter, white vintage espresso machine, crystal chandelier, pink retro TV, blank menu panels, folding chairs, round table | the rose bouquet in the vase |
| `illo-author-coocoo-2024.jpg` | `author-coocoo-2024.jpg` | Hand pouring a glass coffee pot into a cobalt cup with two googly eyes on a tray, blue patterned tabletop, blue wall with cream band | the wall stripe at the top |
| `illo-author-pacific-2024.jpg` | `author-pacific-2024.jpg` | Two-view sheet of the wedge-shaped blackened-steel Mirain station: ice wells, four built-in pumps, drip tray, hanging glasses, casters | one pump button |
| `illo-author-joi-2025.jpg` | `author-joi-2025.jpg` | Vaulted arcade queue: cream pillars, hanging lanterns, guests on black crates, standing host in a beige jacket, potted plant, bicycle wheel | the translucent door glass |
| `illo-author-chc-2024.jpg` | `author-chc-2024.jpg` | Wide tiny-kitchen episode frame: chicken mascot head at left, bearded cook at an induction hob with a steel pot, subway tiles, blank poster, blue pendant | the mascot comb and wattle |
