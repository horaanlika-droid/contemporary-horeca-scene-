# Illustration prompt library

The `illo-*.jpg` set is drawn in one style. This file keeps the shared art direction
and the scene brief for every drawing so a replacement can be made without drifting.

Bake finished masters with `python3 presentation/build/build_illustrations.py`
(masters live outside the repository, in `tmp/illustrations/`).

## Shared art direction — prepend to every scene

> Loose hand-drawn sketch illustration, ink doodle aesthetic. Thin, wobbly, uneven
> black fineliner outlines with visible hand tremor, slightly broken lines,
> deliberately imperfect curves — hand-inked, never clean vector. Flat matte pastel
> fills applied loosely and slightly off-register, like marker or gouache, leaving
> patches of white. Plain white background. A soft pale ice-blue watercolour wash
> blob behind the subject plus soft sage-green and warm sand-beige shapes only; no
> grey. Friendly naive faces: dot eyes, tiny curved smile, rosy cheeks. Small,
> balanced central cluster with wide empty white margins on every side, clear of the
> edges — the drawing fills about half the canvas. Calm, airy editorial cafe-zine
> mood. Exactly one small detail in bright signal red `#e42313`. Absolutely no text,
> no lettering, no signature, no watermark, no frame.

Then add the format line: `Vertical portrait composition, scene in the middle, lots
of white space above and below.` or `Horizontal landscape 3:2 composition, generous
white space.`

Red accents are deliberately singular: one red element per drawing keeps the series
consistent and the brand colour meaningful.

## Surface plan

| Master | Asset | Surface | Scene | Red accent |
| --- | --- | --- | --- | --- |
| `hero.png` | `illo-hero-scene.jpg` | 1080 × 1620 | A bar counter as a theatre stage: a rounded arch frames a back-bar shelf with bottles and a plant; two guests on tall stools with a coupe and a tumbler; a bartender shakes a shaker; one pendant lamp | the lamp shade |
| `gate.png` | `illo-gate-still-life.jpg` | 1080 × 1620 | A round cafe table seen at an angle: takeaway cup, coupe with a cherry, candle in a brass holder, slim vase with one branch, folded napkin, bar spoon, two stacked saucers | the candle flame |
| `m01-signals.png` | `illo-m01-signals.jpg` | 1536 × 1024 | A small restaurant facade with a scalloped striped awning, two windows, a door, a bush; a modest trophy on a low plinth in front; three stars and confetti | the trophy ribbon |
| `m02-atmosphere.png` | `illo-m02-atmosphere.jpg` | 1536 × 1024 | An intimate dining-room corner: a small table with a candle, two chairs, a pendant lamp casting a cone of light, a doorway, a plant, a sconce; a guest seated, a waiter with a tray | the cushion of the empty chair |
| `m03-senses.png` | `illo-m03-senses.jpg` | 1536 × 1024 | A guest at a small table, eyes closed, tasting from a spoon; plate, wine glass, small jug; musical notes, a sound-wave squiggle, a scent swirl above the plate | the cherry on the plate |
| `m04-menu.png` | `illo-m04-menu.jpg` | 1536 × 1024 | A tall blank menu card with a folded corner and a ribbon bookmark; a coupe, a small plate with a garnish, a folded napkin, a slim chair, a bottle | the ribbon bookmark |
| `m05-automation.png` | `illo-m05-automation.jpg` | 1536 × 1024 | A compact espresso machine on a simple counter with two cups; a friendly articulated arm places a cup; two gears, a spark, a leaning tablet | the round button on the machine |
| `m06-ai.png` | `illo-m06-ai.jpg` | 1536 × 1024 | A person in an apron at a laptop, smiling; a small round-headed robot beside the table holding a coupe and a plate; a sparkle and a thought bubble with a plate and a glass | the antenna light on the robot |
| `m07-fnb.png` | `illo-m07-fnb.jpg` | 1536 × 1024 | Farm-to-glass still life: a herbal branch and a small bundle of roots hang from a wooden rack; beneath, a mortar and pestle, two plain apothecary bottles, a citrus half, a tall clear drink; a few falling leaves | one berry on the branch |
| `m08-venture.png` | `illo-m08-venture.jpg` | 1536 × 1024 | Three people around a table with plans, a coffee pot, two cups and a small model of a bar counter; one stands and points, two sit; a three-step staircase with a flag beside them | the flag |
| `m09-found.png` | `illo-m09-found.jpg` | 1536 × 1024 | A tabletop mockup from found objects: an antique plate, a handleless teacup, a wooden crate riser, two candles in old bottles, a vintage glass, a folded cloth, a brass bell, a dried flower, loose screws | one candle flame |
| `m10-mockup.png` | `illo-m10-mockup.jpg` | 1536 × 1024 | A student at a table assembling a 1:20 scale mockup: card, scissors, glue, a ruler, a shoebox, offcuts; a finished tiny bar model on a plinth; a desk lamp | the tiny bar-stool cushions in the model |
| `case-benfiddich-kayama.png` | `illo-case-benfiddich-kayama.jpg` | 1264 × 848 | An apothecary bar: a candle-lit counter of botanical jars, a mortar, herbs hanging, one glass of a herb-infused drink being stirred with a twig | the candle flame |
| `case-black-swan-bobkov.png` | `illo-case-black-swan-bobkov.jpg` | 1264 × 848 | A salvage-world back bar: mismatched shelves of odd bottles, an old mirror, a brass tap, cables, a swan figurine | the swan figurine |
| `case-shapes-savage.png` | `illo-case-shapes-savage.jpg` | 1264 × 848 | A Bauhaus-geometry bar: a square, a circle and a triangle as decor; one perfect coupe on a small marble table; a geometric menu card, a red-and-black abstract print | the triangle panel |
| `case-sips-caporale.png` | `illo-case-sips-caporale.jpg` | 1264 × 848 | A counterless drinkery: a guest's hands around a sculptural glass vessel on a marble ledge, a shaker and a straw nearby, a spiral of movement | the cocktail inside the vessel |
| `case-el-copitas-zernov.png` | `illo-case-el-copitas-zernov.jpg` | 1264 × 848 | A hidden courtyard bar: an arched doorway, clay copitas, a chalkboard with no words, a lantern, a plants-and-candles corner, a guitar leaning | the chalkboard ribbon |
| `case-city-space-narzi.png` | `illo-case-city-space-narzi.jpg` | 1264 × 848 | An ergonomic bar station: a well-organised counter with a speed rail, a jigger, a station with pumps, a checklist clipboard, a bartender's hands at work | one lever/handle |
| `case-sensory-talalay.png` | `illo-case-sensory-talalay.jpg` | 1264 × 848 | A sensory mixology bench: three glasses, pipettes, a small aroma jar, a tasting spoon, a note pad, a blindfold | the blindfold |
| `case-jiro-ono.png` | `illo-case-jiro-ono.jpg` | 1264 × 848 | A minimal sushi counter: a wooden board with three pieces of nigiri, chopsticks, a small dish, a chef's hands at work, a noren curtain | the noren stripe |
| `case-krasota-zarkov.png` | `illo-case-krasota-zarkov.jpg` | 1264 × 848 | A gastro-theatre room: a small stage, a projector beam, a table with a covered dish, a curtain | the curtain tie |
| `case-dave-arnold.png` | `illo-case-dave-arnold.jpg` | 1264 × 848 | A bar lab bench: a centrifuge, beakers, a scale, a thermometer, a cocktail glass being measured, a notebook | the liquid in one beaker |
