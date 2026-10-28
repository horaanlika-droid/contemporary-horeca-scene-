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

## Surface plan

| Master | Asset | Surface | Scene | Red accent |
| --- | --- | --- | --- | --- |
| `hero.png` | `illo-hero-scene.jpg` | 1080 × 1620 | A bar counter as a theatre stage: a rounded arch frames a back-bar shelf with bottles and a plant; two guests on tall stools with a coupe and a tumbler; a bartender shakes a shaker; one pendant lamp | the lamp shade |
| `gate.png` | `illo-gate-still-life.jpg` | 1080 × 1620 | A round cafe table seen at an angle: takeaway cup, coupe with a cherry, candle in a brass holder, slim vase with one branch, folded napkin, bar spoon, two stacked saucers | the candle flame |
| `m01-signals.png` | `illo-m01-signals.jpg` | 1264 × 843 | A small restaurant facade with a scalloped striped awning, two windows, a door, a bush; a modest trophy on a low plinth in front; three stars and confetti | the trophy ribbon |
| `m02-atmosphere.png` | `illo-m02-atmosphere.jpg` | 1264 × 843 | An intimate dining-room corner: a small table with a candle, two chairs, a pendant lamp casting a cone of light, a doorway, a plant, a sconce; a guest seated, a waiter with a tray | the cushion of the empty chair |
| `m03-senses.png` | `illo-m03-senses.jpg` | 1264 × 843 | A guest at a small table, eyes closed, tasting from a spoon; plate, wine glass, small jug; musical notes, a sound-wave squiggle, a scent swirl above the plate | the cherry on the plate |
| `m04-menu.png` | `illo-m04-menu.jpg` | 1264 × 843 | A tall blank menu card with a folded corner and a ribbon bookmark; a coupe, a small plate with a garnish, a folded napkin, a slim chair, a bottle | the ribbon bookmark |
| `m05-automation.png` | `illo-m05-automation.jpg` | 1264 × 843 | A compact espresso machine on a simple counter with two cups; a friendly articulated arm places a cup; two gears, a spark, a leaning tablet | the round button on the machine |
| `m06-ai.png` | `illo-m06-ai.jpg` | 1264 × 843 | A person in an apron at a laptop, smiling; a small round-headed robot beside the table holding a coupe and a plate; a sparkle and a thought bubble with a plate and a glass | the antenna light on the robot |
| `m07-fnb.png` | `illo-m07-fnb.jpg` | 1264 × 843 | Farm-to-glass still life: a herbal branch and a small bundle of roots hang from a wooden rack; beneath, a mortar and pestle, two plain apothecary bottles, a citrus half, a tall clear drink; a few falling leaves | one berry on the branch |
| `m08-venture.png` | `illo-m08-venture.jpg` | 1264 × 843 | Three people around a table with plans, a coffee pot, two cups and a small model of a bar counter; one stands and points, two sit; a three-step staircase with a flag beside them | the flag |
| `m09-found.png` | `illo-m09-found.jpg` | 1264 × 843 | A tabletop mockup from found objects: an antique plate, a handleless teacup, a wooden crate riser, two candles in old bottles, a vintage glass, a folded cloth, a brass bell, a dried flower, loose screws | one candle flame |
| `m10-mockup.png` | `illo-m10-mockup.jpg` | 1264 × 843 | A student at a table assembling a 1:20 scale mockup: card, scissors, glue, a ruler, a shoebox, offcuts; a finished tiny bar model on a plinth; a desk lamp | the tiny bar-stool cushions in the model |
| `case-benfiddich-kayama.png` | `illo-case-benfiddich-kayama.jpg` | 1264 × 848 | Hanging herbs, botanical jars and shelves, a mortar and a hand pouring a green drink into a glass | one small bottle cap |
| `case-black-swan-bobkov.png` | `illo-case-black-swan-bobkov.jpg` | 1264 × 848 | Ornate door at left, framed art, an armchair, beer taps and a table with a teapot and candelabrum | the armchair cushion |
| `case-shapes-savage.png` | `illo-case-shapes-savage.jpg` | 1264 × 848 | Three cocktails, a geometric menu and a hand with pencil; circle, square and triangle on the bar front | one cocktail garnish |
| `case-sips-caporale.png` | `illo-case-sips-caporale.jpg` | 1264 × 848 | Bartender shaking a drink inside an open round counter, guests’ hands and sculptural cocktail vessels | one cocktail garnish |
| `case-el-copitas-zernov.png` | `illo-case-el-copitas-zernov.jpg` | 1264 × 848 | Courtyard with central arched doorway and curtain, paper bunting, potted plants, clay cups and cactus | one bunting flag |
| `case-city-space-narzi.png` | `illo-case-city-space-narzi.jpg` | 1264 × 848 | Top-down L-shaped bar plan with stools, ice well, workflow arrows, bar tools and a stopwatch | a stopwatch button |
| `case-sensory-talalay.png` | `illo-case-sensory-talalay.jpg` | 1264 × 848 | Pipette bottles and tasting glasses, an aroma glass with scent swirls, a hand with a test tube and a scale | one pipette cap |
| `case-jiro-ono.png` | `illo-case-jiro-ono.jpg` | 1264 × 848 | Diagonal sushi counter with one nigiri, rice tub, bamboo mats, knife, dipping dish and brush | the fish on the nigiri |
| `case-krasota-zarkov.png` | `illo-case-krasota-zarkov.jpg` | 1264 × 848 | The circular projection table of Krasota seen from a raised angle: seascape and shoreline spread across the tabletop, a burning ship, a black central void, plates and glasses, the ring of guests, the curved screen of sea and blossom, two waiters standing at the far edge | the cushion beside the right-hand guest |
| `case-dave-arnold.png` | `illo-case-dave-arnold.jpg` | 1264 × 848 | The bartender behind a plain white counter, shaker raised overhead, coupe glass in the lower hand with a curl of vapour, a jigger, fine strainer, stacked coupes and a mixing pitcher laid out along the counter | the ring on his finger |
| `case-rene-redzepi.png` | `illo-case-rene-redzepi.jpg` | 1264 × 848 | The chef laughing with both hands on his hips, navy tee and grey canvas apron, herbs rising from the chest pocket, warm wall panel and a shelf of plain bowls behind him | the apron tie |
| `case-alex-kratena.png` | `illo-case-alex-kratena.jpg` | 1264 × 848 | The bar owner in a black cap, clear glasses and a black utility gilet over a grey tee, phone in hand, tattooed left forearm, the second figure drawn in pale outline behind him, a sage-green bar front with a wooden top at the left | the stirrer standing in the glass on the counter |

## Project-file covers

Each project file keeps its photographs and gains a drawn card. Draw the card from the file's own lead
photograph — the pour, the room, the machine, the object — at that photograph's published dimensions, and
leave brand lettering blank rather than retyping it. `illo-project-joi-facade.jpg` is the exception: it is
an extra gallery frame shown beside its source photograph rather than a card that stands in for it.

| Asset | Source | Scene | Red accent |
| --- | --- | --- | --- |
| `illo-project-joi-bar.jpg` | `project-joi-bar.jpg` | Six stacks of blank paper cups on a night espresso machine, a bare tungsten lamp, an orange tile wall, a forearm reaching in | the clock rim |
| `illo-project-passie-wall.jpg` | `project-passie-wall.jpg` | Pink fluted banquette, white lever machine with three mugs, gingham-lidded dispenser, pastel card stack and a rose-and-lisianthus vase | one fallen petal |
| `illo-project-coocoo-pour.jpg` | `project-coocoo-pour.jpg` | A glass kettle pouring into a cobalt cup with two googly eyes, a blue wall band and a tiled tray | the tray sticker |
| `illo-project-chicken-connection-kitchen.jpg` | `project-chicken-connection-kitchen.jpg` | A bearded cook mid-gesture beside a chicken-mascot head, subway tiles, a blue cone lamp, a stock pot and a cutting board | the mascot comb |
| `illo-project-pacific-station.jpg` | `project-pacific-station.jpg` | Two-view sheet of the Mirain station: ice wells, four pumps, drip tray, five hanging bottles, dimension lines without numerals | one pump button |
| `illo-project-tam-cubes.jpg` | `project-tam-cubes.jpg` | Three blank steel cubes leaning in a stack on white paper | the top cube's edge |
| `illo-project-detail-nine-lives.jpg` | `project-detail-nine-lives.jpg` | Brick column with a blank taped poster, a typewriter and two old televisions on shelves, a pink monitor, a lava lamp and straws | the lava lamp glow |
| `illo-project-joi-facade.jpg` | `project-joi-facade.jpg` | The Joi facade: blank sign panel, dark glass doors, two taped tattoo posters, a geometric door emblem, a cream pilaster, a chain on the pavement | the door sticker |

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
| `illo-author-passie-2022.jpg` | `author-passie-2022.jpg` | Blush-pink cake room: garlanded L-counter, white vintage espresso machine, crystal chandelier, pink retro TV, blank menu panels, folding chairs, round table | the rose bouquet in the vase |
| `illo-author-coocoo-2024.jpg` | `author-coocoo-2024.jpg` | Hand pouring a glass coffee pot into a cobalt cup with two googly eyes on a tray, blue patterned tabletop, blue wall with cream band | the wall stripe at the top |
| `illo-author-pacific-2024.jpg` | `author-pacific-2024.jpg` | Two-view sheet of the wedge-shaped blackened-steel Mirain station: ice wells, four built-in pumps, drip tray, hanging glasses, casters | one pump button |
| `illo-author-joi-2025.jpg` | `author-joi-2025.jpg` | Vaulted arcade queue: cream pillars, hanging lanterns, guests on black crates, standing host in a beige jacket, potted plant, bicycle wheel | the translucent door glass |
| `illo-author-chc-2024.jpg` | `author-chc-2024.jpg` | Wide tiny-kitchen episode frame: chicken mascot head at left, bearded cook at an induction hob with a steel pot, subway tiles, blank poster, blue pendant | the mascot comb and wattle |
