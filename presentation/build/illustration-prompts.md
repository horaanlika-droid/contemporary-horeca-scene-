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
| `case-krasota-zarkov.png` | `illo-case-krasota-zarkov.jpg` | 1264 × 848 | Gastro-theatre stage, curtains, dining table, hand lifting a cloche, abstract projection and audience | one curtain tie |
| `case-dave-arnold.png` | `illo-case-dave-arnold.jpg` | 1264 × 848 | Beverage-science bench with centrifuge, distillation apparatus, beakers, siphon, scale and ice bucket | the siphon |

## Industry-figure portraits

The eleven `figure-*.jpg` portraits keep their own published dimensions and are
redrawn from their own reference photograph, preserving the person's recognisable
features, clothing and pose. The original photograph is preserved in
`presentation/assets/originals/` and linked from the in-app credits.

| Master | Asset | Scene | Red accent |
| --- | --- | --- | --- |
| `figure-redzepi.png` | `figure-redzepi.jpg` | Chef in a navy tee and grey work apron, hands on hips, wide smile; a plain doorway line behind him | one stitch mark on the apron pocket |
| `figure-caporale.png` | `figure-caporale.jpg` | Bartender with swept-back hair and beard, seated behind crossed forearms on a bar, grey tee under a dark zip waistcoat, tattoos simplified to ink motifs, two pendant lamps | one red motif in the forearm tattoo |
| `figure-kratena.png` | `figure-kratena.jpg` | Man in a low navy cap and aviator glasses with a phone in hand, grey tee under a black utility vest, one wall panel behind | a dash on the cap front |
| `figure-talalay.png` | `figure-talalay.jpg` | Bald bartender with glasses dripping bitters from a dropper into a coupe, cream jacket over a white tee, outlined bottles on a shelf | the cherry in the coupe |
| `figure-dave-arnold.png` | `figure-dave-arnold.jpg` | Bartender in a dark green crewneck over a plaid collar, shaker raised high, chilled coupe low, dry-ice vapour curls | one plaid line at the neck |
| `figure-savage.png` | `figure-savage.jpg` | Smiling man in a sage jacket with embroidered collar and pockets, white tank top and jeans, two cacti behind | a flower bud on the tallest cactus |
| `figure-narzi.png` | `figure-narzi.jpg` | Man in a striped white shirt leaning on a bar in profile, bitters bottles, a tumbler and stacked coupes in front, bottle shelf behind | one bottle cap |
| `figure-kayama.png` | `figure-kayama.jpg` | Bartender with a side-swept fringe pointing at the viewer, cream blazer, white shirt and red tie, shelf with bottles and speakers | the necktie |
| `figure-zernov.png` | `figure-zernov.jpg` | Man with a red-streaked fringe and round glasses holding a takeaway coffee, black tee and trousers, brick wall, hanging lamp, bamboo steamers | the blank sign's flame icon |
| `figure-zarkov.png` | `figure-zarkov.jpg` | Restaurateur relaxed in a white boxy armchair, white sweatshirt, navy trousers, lavalier mic, water bottle on the floor, blue light screen | the mic's light dot |
| `figure-bobkov.png` | `figure-bobkov.jpg` | *not yet redrawn* — man with bleached hair, round glasses and moustache at a cafe table, white tee under a brown kimono robe, slatted bench behind | a ring's enamel heart |
