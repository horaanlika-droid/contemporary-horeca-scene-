# Illustration audit — reference fidelity, logic and physics

Reviewed 28 October 2026. Scope: the 12 case cards, the 11 practitioner portraits plus the
drawn Jiro figure card, the 5 author illustrations, the 10 module covers, the 12 lesson
headers, the landing hero and the access still life.

## How this was checked

Each drawing was put beside the image it claims to be drawn from — the credited source in
`presentation/assets/originals/` or the `figure-*.jpg` / `author-*.jpg` the credit record
links — at equal size, then checked again at full resolution.

Three questions per asset:

1. **Fidelity.** Would a reader who sees the drawing next to the photograph recognise the
   same room, the same person, the same objects? The credit line promises a redraw, so the
   resemblance has to be visible without reading the caption.
2. **Logic.** Does everything in the frame belong to one place, one moment and one light?
   Objects rest on something, hands hold what they touch, vessels obey gravity.
3. **Physics.** Glass, liquids, pours, reflections, shadows, perspective and scale.

The brief in `illustration-prompts.md` is used as the third baseline, because it is the
standard the drawings are supposed to meet.

---

## 1. Headline

| Verdict | Case cards |
| --- | --- |
| **● reads as the same place at a glance** | black-swan-bobkov, jiro-ono, krasota-zarkov, city-space-narzi |
| **◐ recognisable once you know the pairing** | benfiddich-kayama, sips-caporale, el-copitas-zernov, alex-kratena, rene-redzepi |
| **○ reads as a different venue** | sensory-talalay, shapes-savage, dave-arnold |

Side-by-side proof for the five P0 assets: `presentation/build/audit-p0-pairs.jpg` — photograph left,
drawing right, each row at the same size.

Two things are wrong, and they are different problems:

- **The pictures drift from the photograph.** Where that happens the drawing was clearly made
  from the *concept* in the brief instead of from the photograph, so the signature of the venue
  — its palette, its objects, its light — is gone. This is the "similarity is not obvious"
  complaint, and it is fixable by redrawing from the right source.
- **The pictures break their own physics.** A repeated set of drawing faults runs through the
  whole series, including the drawings that match their references well. These are listed in
  §2 and are worth learning as a checklist, because they will reappear in every new generation.

---

## 2. Cross-cutting defects

These recur across case cards, portraits, module covers and lesson headers.

### 2.1 Objects with no support

The single most common fault. Objects are placed in the composition but nothing holds them up,
and because the series draws on white paper there is no ground plane, no floor line and no
contact shadow to hide it.

- `illo-case-sensory-talalay` — the wooden board sits on a pedestal that touches nothing; the
  black saucer under the cherry floats above the board; the sprig lies on the wood with no plate.
- `illo-case-el-copitas-zernov` — the wall slab has a diagonal cut edge, and the sconces and
  candle-holders that belong on it are drawn *above* the wall, floating in the white; the
  ceiling is missing, so the two lit niches read as picture frames.
- `illo-case-jiro-ono` — the stools stand on white paper; the near stool's four legs cross each
  other in an X.
- `illo-case-city-space-narzi` — the bar stools' legs stop in mid-air behind the counter.
- `illo-figure-kratena` — the tray of two martini glasses is supported by a forearm that ends
  before the tray: there is no hand under it.
- `illo-m06-ai` — the bowl the service robot offers hovers above its gripper; the tablet on the
  table has no stand.
- `illo-m02-atmosphere` — the server's tray floats over her hand; the two spotlight beams do not
  start at the fixtures.

### 2.2 The one-line counter

Objects are lined up on a single hairline with no counter edge, no thickness and no shadow, so the
row reads as objects balanced on a wire.

- `illo-case-dave-arnold` — jigger, strainer, stacked coupes and pitcher all stand on one line.
- `illo-figure-caporale`, `illo-figure-savage`, `illo-figure-narzi` — a glass or a bottle placed
  on a line that is not a surface.
- `illo-lesson-automation` — bottles and the machine sit on a shelf with no thickness; the trolley
  wheels hang under a slanted wedge.

### 2.3 Hands

- Mitten hands: the fingers merge into the object and the thumb disappears. Worst cases:
  `illo-case-benfiddich-kayama` (both hands on the pestle), `illo-case-alex-kratena` (phone),
  `illo-figure-caporale` (martini), `illo-figure-kratena` (tray), `illo-case-dave-arnold` (coupe).
- Impossible grip: `illo-case-dave-arnold` holds the shaker by its mouth with the fingers coming
  *through* the metal, and `illo-figure-dave-arnold` repeats it.

### 2.4 Action that cannot happen

- `illo-case-dave-arnold` and `illo-figure-dave-arnold` — the shaker is raised overhead, tilted
  towards the face, and nothing comes out. There is no stream between the two vessels, so the pose
  reads as a salute rather than a pour. A decorative squiggle stands in for the vapour and is
  attached to the sweater, not to the glass.
- `illo-case-sensory-talalay` — ice cubes cross the waterline and sit above the liquid; the straw's
  lower end stops in front of the liquid instead of in it, and the straw leans out of the glass at
  an angle the roofline of the glass does not allow.
- `illo-case-krasota-zarkov` — a small fire burns in the middle of a projection table.

### 2.5 Mirrored and swapped detail

When the source is flipped, every asymmetric cue flips with it, and the result contradicts the
photograph.

- `illo-case-alex-kratena` — the tattoo sleeve is on the wrong arm, and the phone has moved to the
  other hand. The reference sleeve is a dense ornamental texture; the drawing turns it into a
  sheet of separate icons (flower, anchor, skull, birds), which no longer reads as the same tattoo.
- `illo-case-benfiddich-kayama` — the white jacket has become a brown waistcoat over a white shirt,
  and the reference's red tie — the only red in the photograph — is gone.
- `illo-figure-narzi` — dark brown hair becomes silver-grey.

### 2.6 Palette drift

The series' own palette is white paper, ink and one red accent — but several drawings also lose the
*venue's* palette, and that palette is most of what makes a place recognisable.

- `illo-case-city-space-narzi`: blue night city and red-pink wash → uniform ochre.
- `illo-case-sips-caporale`: black ceiling, dark green walls, black island → white outlines.
- `illo-case-shapes-savage`: green table, red stools, white wall → brown ledge, no seats, no wall.
- `illo-case-sensory-talalay`: deep blue room with neon rim-light → white nothing, plus pastel
  blue-green confetti that appears nowhere else in the series and breaks the two-colour rule.

### 2.7 Ghost furniture and unfinished areas

`illo-m10-mockup` publishes with a whole corner still in outline, and `illo-case-sips-caporale`
publishes with its near table, stools, espresso machine and fridges left as pencil. The technique
was designed for *background* figures only; when it lands on foreground objects it reads as an
unfinished file.

### 2.8 Scale and perspective

- `illo-case-city-space-narzi` — the bartender behind the counter is drawn at a fraction of the
  stool scale.
- `illo-case-krasota-zarkov` — the seated guests' plates sit on the table rim and several arms
  disappear behind the edge.
- `illo-m01-signals` — the pavilion is in perspective but its red door frame is drawn in flat
  elevation.
- `illo-case-jiro-ono` — six ceiling panels, six different vanishing points; the noren hangs in
  front of the beam it is attached to.

### 2.9 Pastel washes behind the subject

The art direction asks for pure white paper. Several portraits and cards instead put a soft pastel
blob behind the figure — pale blue behind `illo-figure-zarkov` and `illo-figure-talalay`, pale green
behind `illo-figure-redzepi`, and a blue-green cloud behind `illo-figure-savage` that reaches the top
edge of the file, which measures 224/238/247 instead of white.

This is not only an art-direction drift: because the app multiplies every drawing into the page, a
coloured wash multiplies with it, so the picture arrives with a pale halo where the paper should have
disappeared. Any redraw should return these grounds to white.

---

## 3. Case cards against their photographs

| Case | What survives | What is wrong | Verdict |
| --- | --- | --- | --- |
| **Black Swan · Bobkov** | lantern ceiling, ornate bar, round tables, stools, the room's warm wood | the back-bar mirror, which reflects the street, becomes a painted landscape panel; a few stools tuck into the bar front with no floor | ● |
| **Sukiyabashi Jiro** | counter, blue noren, two chefs in white, shelf of bowls, leather stools | stool legs cross; dishes hover; both chefs' hands are missing; ceiling lights are individually mis-perspectived | ● |
| **Krasota · Zarkov** | round projection table, central void, ring of guests, sea screen, blossom | the projected image is flattened into a flat blue disc with sand ring; fire on the table; ghost waiters; plates on the rim | ● |
| **City Space · Narzi** | glazed curved wall, high-rise view, banquettes, bar with stools | the night-blue and red neon identity is replaced by ochre; bartender out of scale; stools float | ● |
| **Bar Benfiddich · Kayama** | hanging botanicals, bottle shelves, the barkeep at work | white jacket + red tie → white shirt + brown waistcoat, no tie; dark mahogany and amber glass → pale mint; invented brick arch; pestle instead of the mixing glass; carafe handle detached | ◐ |
| **Sips · Caporale** | green walls, bottle shelving, bar island, street window | half the picture is unfinished outline; the black ceiling and black island — the venue's signature — are gone; espresso machine and fridges float | ◐ |
| **El Copitas · Zernov** | two lit arched niches, cave walls, long counter, candle ritual | no ceiling; sconces and candles above the wall edge; chairs in a row with no floor; the wall slab has a hard diagonal cut | ◐ |
| **Tayēr · Kratena** | cap, glasses, black gilet over grey tee, phone, second figure behind | tattoo and phone mirrored; tattoo reduced to icons; the gilet gains buttoned flap pockets | ◐ |
| **Noma · Redzepi** | the man himself: face, beard, navy tee, grey apron, hands on hips | room is invented (bowl shelf); hair fuller than the reference; apron pocket full of herbs not in the photograph | ◐ |
| **Sensory · Talalay** | a board with a glass and a garnish | the neon-lit dark room becomes white; ice and straw break the water logic; canapés become a cherry and a sprig; pastel confetti is off-series | ○ |
| **Shapes · Savage** | the black steel shelving and the colour-coded bottle rows | green table, red stools and white wall — the whole colour system — are absent; menu card floats; vertical window-frame fragment at the left edge | ○ |
| **Dave Arnold** | dark sweater over a checked collar, shaker overhead, coupe | no pour; impossible grip; dark drama → white; hair and face shape off; props rearranged | ○ |

---

## 4. Practitioner portraits against their photographs

| Portrait | Issue | Verdict |
| --- | --- | --- |
| **Zarkov** | drawn as a blonde man with no beard reading a menu in a café; the reference is a dark-haired bearded man in a white tee in a white armchair | ○ different person and place |
| **Talalay** | seated at a counter with a coupe and a window; the reference is him in a dark bar with his arm raised | ○ different scene |
| **Dave Arnold** | curly hair, round face; reference is straight-haired with a long face and receding hairline | ◐ |
| **Narzi** | silver-grey hair; reference is dark brown | ◐ |
| **Kratena** | tray floats without a hand; phone gone; background figure removed | ◐ |
| **Bobkov** | a tie is added (the reference wears an open shirt); jacket black → brown; the burger reads as a brooch | ◐ |
| **Caporale** | a martini glass is added to a hand that is empty in the reference, and the grip is a mitten | ◐ |
| **Savage** | a martini glass is added; the reference has both hands in pockets | ◐ |
| **Kayama** | good likeness, but the cocktail glass at his chest is invented, and he is dressed differently from his own case card | ◐ |
| **Zernov** | close: outfit, drink, brick pass, bamboo steamers, blank LED board | ● |
| **Redzepi** | likeness good; herb pocket is an invention | ◐ |
| **Jiro (drawn as `figure-jiro.jpg`)** | likeness good; the white coat's collar and sleeves are competent | ● |

Systematic fault: **invented props held by hands that cannot hold them**. In four of the twelve the
subject gained a cocktail he is not holding in the photograph, and in three of those the hand does
not close round it.

---

## 5. Author illustrations

The strongest set in the library — every one reads as its source at a glance, and the props,
palette and red accent are traceable to the photograph.

- `illo-author-passie-2022`, `illo-author-coocoo-2024`, `illo-author-pacific-2024`,
  `illo-author-joi-2025`, `illo-author-chc-2024` — keep.
- Only notes: the CooCoo pour stream is a hard-edged wedge rather than a falling thread, and the
  Passie wall picture is an empty frame. Neither is worth a re-render.

These prove the method works when the drawing is made *from the photograph*, which is the argument
for §7.

---

## 6. Module covers and lesson headers

No photograph to match, but the same physics rules apply.

- `illo-m01-signals` — door frame in flat elevation inside a perspective pavilion; internal stools
  without legs.
- `illo-m02-atmosphere` — beam/fixture mismatch, tray not held.
- `illo-m03-senses` — the tasting plate hovers above the table; the glass meets the drinker's nose.
- `illo-m05-automation` — the cantilevered counter has an unresolved black wedge under it.
- `illo-m06-ai` — robot bowl floats above the gripper; blank panels are attached to nothing.
- `illo-m10-mockup` — the model's roof passes through the assembler's fingers; foreground still in
  outline.
- `illo-m09-found` — the object tags are attached to nothing.
- `illo-lesson-automation` — dashed sensor line ends in empty space; wheels under a slanted wedge.

---

## 7. The brief no longer describes the shipped case cards

`illustration-prompts.md` specifies a different scene for 8 of the 12 case cards than the one that
is published. Examples: the sensory card is specified as *pipettes, tasting glasses, a scale and a
hand with a test tube*; the published file is a board with one drink. City Space is specified as a
*top-down L-shaped bar plan with workflow arrows*; the published file is the lounge itself.

Consequences:

- The brief cannot be used to regenerate a card, because it describes the older concept.
- Two published cards still follow the brief instead of the photograph — **Kayama** (mortar, jars,
  herbs, invented arch) and **Redzepi** (herbs in the apron pocket). That is exactly where the
  resemblance is weakest.

Fix: rewrite the case-card section of the brief so each row states the one thing that must be
recognisable from the photograph — the garment, the counter material, the signature object, the
room's palette — and mark the two cards above for a redraw from the photograph.

---

## 8. Fix plan

**Progress, 28 October 2026.** The five P0 assets below were redrawn from their photographs and
published: `illo-case-sensory-talalay.jpg`, `illo-case-shapes-savage.jpg`,
`illo-case-dave-arnold.jpg`, `illo-figure-zarkov.jpg`, `illo-figure-talalay.jpg`. Each was checked
against the §9 list before publishing. What is still wrong in them, honestly: the ink contour sits
slightly thinner than the older drawings, the pour hand in the Dave Arnold card still closes over the
tin rather than round its body, and the Sensory card keeps a single invented second board for depth.
The remaining P1 and P2 items are carried in the README under *Image audit — October 2026*.

**Progress, 29 October 2026.** P1 items 6 to 10 were redrawn the same way: `illo-case-benfiddich-kayama`
(white jacket, red tie, mahogany counter, amber bottles, no arch), `illo-case-sips-caporale` (black ceiling,
green walls, black island, espresso machine), `illo-case-city-space-narzi` (red ceiling sweep, magenta and
blue floor, blue night band, bartender at stool scale) and `illo-case-krasota-zarkov` (the dark projected
seascape and its black centre, no fire on the table). `illo-case-alex-kratena` was redrawn as P2 item 11
asks: the ornamental sleeve carries no lettering, the phone is in the right hand and the second figure wears
the black beanie. `illo-case-jiro-ono` keeps its drawing and takes only the noren from pale blue to dark navy,
which was the one colour claim in the whole set that could be settled without a re-render.

Still open when this was written: the El Copitas ceiling (B1), the two practitioner portraits in P1 item 10,
the Redzepi wardrobe (A8), the invented room in `illo-case-rene-redzepi`, the module-cover support lines and
`illo-m10-mockup` (P2 item 12), and the statement pass over the Jiro stools and dishes. One more note from
this pass: a case card drawn to the edge of its canvas has no paper margin, so on a white plate it reads as a
dark rectangle; `illo-case-benfiddich-kayama` is the one file here that wants a margin added.

**P0 — reads as the wrong place, redraw from the photograph**

1. `illo-case-sensory-talalay` — dark room, neon rim-lit board, two canapés, one tall tumbler with
   ice and water at the correct level. Remove the pastel confetti entirely (series palette).
2. `illo-case-shapes-savage` — white wall, black steel shelf with colour-coded bottles, green table,
   two red stools. Keep the black counter; put the menu card on it, standing.
3. `illo-case-dave-arnold` — keep the dark stage and the overhead shaker, but add the falling stream
   into the coupe, correct the grip, and give the props a counter with an edge.
4. `illo-figure-zarkov` — redraw from `figure-zarkov.jpg`: long dark hair, beard, white tee, white
   armchair, dark stage.
5. `illo-figure-talalay` — redraw from `figure-talalay.jpg`: dark bar, raised arm with the glass.

**P1 — recognisable only with the caption**

6. `illo-case-benfiddich-kayama` — white jacket, red tie, dark mahogany, amber bottles, mixing glass.
7. `illo-case-sips-caporale` — black ceiling, green walls, black island, espresso machine on its
   counter; finish every foreground object.
8. `illo-case-el-copitas-zernov` — add the ceiling, attach sconces to the wall, give the floor a line.
9. `illo-case-city-space-narzi` — restore the blue night and the red-pink wash; scale the bartender.
10. `illo-figure-narzi`, `illo-figure-dave-arnold` — hair and face shape from the photograph.

**P2 — same place, fix the drawing only**

11. Stools, dishes and hands in `illo-case-jiro-ono`; mirroring and the tattoo texture in
    `illo-case-alex-kratena`; the invented room in `illo-case-rene-redzepi`.
12. Foreground outlines in `illo-m10-mockup`; support lines in the four module covers listed in §6.

**Definition of done for any redraw**

- The pair (photograph | drawing) at 50 % is shown to someone who has not seen the caption, and they
  name the same venue or the same person.
- Nothing rests on a line, everything rests on a surface.
- Every hand that holds something has a thumb and four fingers round the object.
- One light logic per picture; one red accent; no pastel colours outside the palette.
- No foreground object left in outline.

---

## 9. Checklist to attach to every future generation

1. **Source first.** The photograph is the subject reference; the brief is secondary. If they
   disagree, the photograph wins and the brief is corrected.
2. **Name the three anchors** before generating: the most identifiable garment/object, the material
   of the counter, the palette of the room. The drawing must keep all three.
3. **Support test.** Trace a vertical from every object to the nearest surface. If it crosses white,
   add the surface.
4. **Hand test.** Count thumbs and fingers; confirm the object is inside the grip, not through it.
5. **Liquid test.** Waterline is horizontal, ice is below it, straws end below it, streams connect
   vessel to vessel.
6. **Perspective test.** One floor line, one horizon, one vanishing direction per wall plane.
7. **Palette test.** White, ink, one red accent — plus only the colours that exist in the photograph.
8. **Finish test.** No foreground object in outline; no fragment of the background floating in white.

---

## 10. Second review — 29 October 2026

The first review asked whether a drawing showed the right place. This one asks the two questions the
author actually judges by: **is the resemblance obvious at a glance**, and **is it the same hand as the
rest of the series**. The honest answer to both is "not everywhere", and the reason is the same in both
cases: the library contains two different drawing hands, and recent work has been landing in the wrong
one.

### 10.1 Two hands in one library

| | **Hand A — thin and light** | **Hand B — heavy and saturated** |
| --- | --- | --- |
| Contour | 2–3 px, even, gently wobbly | 5–6 px, even, bolder |
| Fills | pale, chalky, often left as paper | deep gouache, full strength |
| Paper | the picture floats on white, no floor lines | the picture often fills the frame |
| Palette | sage, cream, apricot, dusty blue, one red | maroon, amber, black, one red |
| Where it is used | the 12 practitioner portraits, the 10 module covers, the 12 lesson headers | the 12 case cards, hero, gate |

Both hands are good. The fault is mixing them: seven of the twelve portraits are Hand A and read as
friendly poster portraits; the two portraits redrawn on 29 October are Hand B and read as a different
artist's work next to them. The same is true of the lesson headers.

### 10.2 Files in the wrong hand — fixed 29 October 2026

| File | Belongs with | Problem | Now |
| --- | --- | --- | --- |
| `illo-figure-narzi.jpg` | Hand A | redrawn with a 6 px contour and saturated fills; the neighbours are thin-line | redrawn thin: 3 px contour, pale sage and cream, dark hair as a mid-brown shape with interior lines, arms resting on a pale bar top |
| `illo-figure-dave-arnold.jpg` | Hand A | same, plus the hair is a single black mass with no interior line | redrawn thin: dusty-grey sweater instead of black, mid grey-brown hair with the receding hairline visible, checked collar and cuffs |
| `illo-lesson-scenography.jpg` | Hand A | heavy ink, a grey wall and a hard white light wedge; the other headers are pale line drawings | redrawn thin: pale table corner, five objects, white page, the candle flame as the only red |
| `illo-lesson-final-brief.jpg` | Hand A | a solid brown table filling two thirds of the frame | redrawn thin: a pale card model on a pale plinth, white page, the block in the hand as the only red |

One more file was outside its own set for a different reason: `illo-figure-kratena.jpg` was published at
768 × 1376 while every other portrait is 848 × 1264, so it sat taller and narrower than its neighbours in
the grid. It is re-framed to 848 × 1264 with the drawing untouched.

Fix applied: redrawn in Hand A — thin contour, pale fills, white page, no dark fields — keeping the content
that is now right (El Copitas in the cases, Redzepi's wardrobe, Narzi's dark hair, Dave's long face).

### 10.3 Resemblance, file by file

● obvious at a glance · ◐ needs the caption · ○ reads as another place or person

| Case card | | Why |
| --- | --- | --- |
| Black Swan | ● | the lantern ceiling and the ornate bar are unmistakable |
| Sips | ◐ | right room, but a third of the foreground is still pencil outline |
| Shapes | ◐ | the shelving is right; the green table and red stools that identify the shop are missing |
| Kayama | ● | white jacket, red tie, mahogany, amber bottles |
| El Copitas | ● | black vault, sconces, two lit niches |
| City Space | ● | red ceiling sweep, magenta-and-blue floor, blue night |
| Jiro | ◐ | the noren and the counter read; the stool legs and the missing hands do not |
| Krasota | ◐ | the table reads; the projection is a flat blue disc instead of a seascape |
| Tayēr | ● | gilet, cap, glasses, sleeve |
| Noma | ● | the man, hands on hips, is now the portrait's man |
| Sensory | ○ | a white-room still life where the photograph is a dark neon room |
| Dave Arnold | ○ | no pour, impossible grip, no counter, black studio turned white |

| Portrait | | Why |
| --- | --- | --- |
| Zernov | ● | outfit, drink, brick pass, steamers |
| Redzepi | ● | face, beard, hands on hips, herb pocket |
| Kratena | ◐ | tray and glass are invented; he holds a phone in the photograph |
| Kayama | ◐ | the cocktail at his chest is invented |
| Caporale | ◐ | a martini added to an empty hand |
| Savage | ◐ | a martini added; the reference has both hands in his pockets |
| Bobkov | ◐ | a tie added, jacket black → brown |
| Zarkov | ○ | drawn as a blonde man without a beard, in a café, reading a menu |
| Talalay | ○ | drawn seated with a coupe; the reference is him standing in a dark bar with his arm raised |
| Narzi | ● | dark hair, clean shaven, striped shirt — but drawn in the wrong hand |
| Dave Arnold | ◐ | long face and straight hair now, but the black hair mass reads as a helmet |
| Jiro | ● | likeness good (drawn file, published as `figure-jiro.jpg`) |

### 10.4 Physics and logic still open

- `illo-case-sensory-talalay` — no table surface under the board; the straw stops above the waterline;
  blue-green confetti outside the palette.
- `illo-case-dave-arnold` — the lower hand's fingers pass through the coupe instead of round its foot;
  tools stand on nothing.
- `illo-case-jiro-ono` — three stool legs cross in an X; the nearest stool is twice the scale of the
  others; dishes hover above the counter; neither chef has a visible hand.
- `illo-case-city-space-narzi` — the mirrored wall repeats the bar rather than reflecting it.
- `illo-m03-senses` — the tasting glass floats unsupported beside the drinker's face.
- `illo-m07-fnb` — the mortars, carafe and cloche sit on no drawn surface.
- `illo-m08-venture` — the tray of cups overhangs the table into empty air.
- `illo-m09-found` — every tag is tied with a string that ends in nothing.
- `illo-m10-mockup` — the model's roof passes through the assembler's fingers.
- `illo-m06-ai` — the bowl sits a hand's width above the robot's tray.
- `illo-lesson-concept-objects` and `illo-lesson-signals` — panels and objects hang from lines that end
  in mid-air (accepted as a series convention, recorded so it is a decision and not an accident).

### 10.5 Order of work

1. Redraw the four wrong-hand files in Hand A (§10.2) — this is the drift the author sees first.
2. Fix the two ○ case cards (Sensory, Dave Arnold) from their photographs, keeping the Hand B case
   style.
3. Redraw the two ○ portraits (Zarkov, Talalay) from their photographs in Hand A.
4. Repair the physics list in §10.4 file by file; `illo-m03`, `illo-m07`, `illo-m08`, `illo-m09` and
   `illo-m10` need only a support line, a table edge or one hand redrawn.
