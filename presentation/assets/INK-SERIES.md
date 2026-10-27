# The navy-ink illustration series

Single-colour case-card drawings: deep navy ink `#153c8c` on white paper, bold
pen outlines, hand-hatched shadows and a comic exaggeration of the face — the
style of the mid-century Japanese poster / woodblock caricature that the course
team chose as the case-card art direction.

Unlike the earlier concept covers, every drawing in this series is built from
**two archived sources**: the practitioner's own editorial portrait
(`figure-*.jpg`) and the venue photograph already stored next to it
(`case-*.jpg`). The drawing is a caricature of a documented person standing in a
documented room — never a generic scene, never a photograph claim. Each case
card opens onto the full case file, where the documentary photograph of the
venue is shown with its own credit line; the in-app *Image sources & rights*
page lists the whole series under `ILLUSTRATION · ORIGINAL COURSE GRAPHIC`.

## Drawings

| Drawing | Practitioner drawn from | Venue drawn from | What the drawing shows |
| --- | --- | --- | --- |
| `illo-case-jiro-ono.jpg` | `figure-jiro.jpg` | `case-jiro-ono.jpg` | Jiro Ono — bald, thin, glasses, white jacket — shaping nigiri behind the narrow wooden counter; a geta of three nigiri, a bamboo mat and a pottery cup |
| `illo-case-benfiddich-kayama.jpg` | `figure-kayama.jpg` | `case-benfiddich-kayama.jpg` | Hiroyasu Kayama — long hair, apron — crushing botanicals in a mortar at the candlelit apothecary counter; antique jars, dried herbs, homemade absinthe bottles, a guest's copita in the foreground |
| `illo-case-sips-caporale.jpg` | `figure-caporale.jpg` | `case-sips-caporale.jpg` | Simone Caporale — short hair, beard, rolled sleeves — working the central open island with no counter barrier; seated guests around it, cloche, tweezers, bottles, the cast-metal hand vessel |
| `illo-case-el-copitas-zernov.jpg` | `figure-zernov.jpg` (+ press portrait of Igor Zernov) | `case-el-copitas-zernov.jpg` | Igor Zernov — beret, beard, hoodie — raising a copita of mezcal over the communal table; chalkboard menu, candle, taco, dried flowers, shelves of bottles |
| `illo-case-black-swan-bobkov.jpg` | `figure-bobkov.jpg` | `case-black-swan-bobkov.jpg` | Denis Bobkov — beard, waistcoat, rolled sleeves — among dripping candles, candelabra, antique porcelain, a confessional door and salvaged panelling |
| `illo-case-shapes-savage.jpg` | `figure-savage.jpg` | `case-shapes-savage.jpg` | Rémy Savage — moustache, dark shirt, apron — in the Bauhaus room: cylinder, cube, sphere lamp, triangle frame, and a wordless shape-pictogram menu |
| `illo-case-city-space-narzi.jpg` | `figure-narzi.jpg` | `case-city-space-narzi.jpg` | Bek Narzi — dark suit, open shirt — on the glazed skyline floor: backbar wall of bottles, speed rails, aligned tools, a clipboard and a tray of fruit-chip garnishes |
| `illo-case-sensory-talalay.jpg` | `figure-talalay.jpg` (+ press photograph) | `case-sensory-talalay.jpg` | Artem Talalay — quiff, waistcoat, rolled sleeves — mid-pour on a competition station: trays of crushed-ice coupes, jigger, atomiser, smoke under a cloche |
| `illo-case-krasota-zarkov.jpg` | `figure-zarkov.jpg` | `case-krasota-zarkov.jpg` | Boris Zarkov — bald, dark suit, arms open like a stage director — beside the twenty-seat circular table under projections and stage lights |
| `illo-case-dave-arnold.jpg` | `figure-dave-arnold.jpg` | `case-dave-arnold.jpg` | Dave Arnold — apron, glasses, thermometer — at a laboratory bench: centrifuge, beakers, vacuum chamber, clarified cocktail and spilling nitro vapour |
| `illo-case-noma-redzepi.jpg` | `figure-redzepi.jpg` | `case-rené-redzepi.jpg` | René Redzepi — apron, short dark hair — at the Noma pass with fermentation jars, foraging baskets and a wild-herb plate |
| `illo-case-tayer-kratena.jpg` | `figure-kratena.jpg` | `case-alex-kratena.jpg` | Alex Kratena — apron, beard — between the daylight front bar of Elementary and the U-shaped Taylor counter |
| `illo-hero-breakfast-club.jpg` | the twelve practitioners above | the twelve venues above | The series poster: the practitioners gathered at one long counter in the poster idiom — the "club" the course reads the scene through |

## Rebuilding

Raw renders are not committed; the published files are produced from them with

```bash
python3 presentation/build/build_ink_illustrations.py --src /path/to/renders
```

The script collapses each render onto the single course ink, trims the paper
margin, letterboxes it onto the published canvas (1264 × 848 for case cards,
972 × 1619 for the vertical poster) and writes JPEG quality 88 into this folder.
Do not edit the published files by hand — re-run the script instead.

## Provenance and rights

The drawings are original graphics art-directed for the course. The faces and
rooms they caricature come from editorial reference photographs already archived
in this folder (`figure-*`, `case-*`), whose copyright stays with the respective
photographers and venues; those photographs are used inside a password-protected
educational elective and each is shown with its own credit line in the case file
and on the credits page. A drawing never replaces that credit, and a rights
holder can ask for the drawing, the photograph or both to be removed.
