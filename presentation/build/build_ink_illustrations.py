#!/usr/bin/env python3
"""Build the navy-ink case illustrations used as case-card covers.

The drawings are made as one-colour ink caricatures (see
`presentation/assets/INK-SERIES.md` for the prompts, the portrait and venue
references behind every drawing, and the provenance notes). This script takes
the raw renders, forces them onto the single course ink colour, trims the white
paper margin, letterboxes them onto the published 3:2 canvas and writes the
final JPEGs into `presentation/assets/`.

    python3 presentation/build/build_ink_illustrations.py --src /path/to/renders

Requirements: Pillow (see presentation/build/requirements.txt).
"""

from __future__ import annotations

import argparse
import pathlib

from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "presentation" / "assets"

# Single course ink: sampled from the art direction reference (navy poster ink).
INK = (0x15, 0x3C, 0x8C)
PAPER = (255, 255, 255)

# cover canvas of the existing case illustrations
LANDSCAPE = (1264, 848)
PORTRAIT = (972, 1619)

# raw render name -> published asset name, canvas
PLAN: list[tuple[str, str, tuple[int, int]]] = [
    ("benfiddich", "illo-case-benfiddich-kayama.jpg", LANDSCAPE),
    ("blackswan", "illo-case-black-swan-bobkov.jpg", LANDSCAPE),
    ("shapes", "illo-case-shapes-savage.jpg", LANDSCAPE),
    ("sips", "illo-case-sips-caporale.jpg", LANDSCAPE),
    ("copitas", "illo-case-el-copitas-zernov.jpg", LANDSCAPE),
    ("narzi", "illo-case-city-space-narzi.jpg", LANDSCAPE),
    ("talalay", "illo-case-sensory-talalay.jpg", LANDSCAPE),
    ("jiro", "illo-case-jiro-ono.jpg", LANDSCAPE),
    ("krasota", "illo-case-krasota-zarkov.jpg", LANDSCAPE),
    ("davearnold", "illo-case-dave-arnold.jpg", LANDSCAPE),
    ("redzepi", "illo-case-noma-redzepi.jpg", LANDSCAPE),
    ("kratena", "illo-case-tayer-kratena.jpg", LANDSCAPE),
    ("poster", "illo-hero-breakfast-club.jpg", PORTRAIT),
]

MARGIN = 16  # white paper margin kept around the drawing, in px


def duotone(image: Image.Image) -> Image.Image:
    """Force a one-colour ink drawing onto PAPER / INK, keeping the line art."""
    rgb = image.convert("RGB")
    # alpha of the ink: the darkest channel carries the drawn line, so any warm
    # or grey fringe in the render collapses back onto the single course ink
    channels = rgb.split()
    darkest = channels[0]
    for band in channels[1:]:
        darkest = ImageChops.darker(darkest, band)
    # a touch of contrast keeps the solid ink masses black in the small card size
    alpha = darkest.point(lambda v: min(255, int(round((255 - v) * 1.06))))
    ink = Image.new("RGB", rgb.size, INK)
    paper = Image.new("RGB", rgb.size, PAPER)
    return Image.composite(ink, paper, alpha)


def trim_and_fit(image: Image.Image, canvas: tuple[int, int]) -> Image.Image:
    """Trim the white paper margin, then centre the drawing on the canvas."""
    grey = image.convert("L")
    bbox = grey.point(lambda v: 0 if v > 247 else 255).getbbox()
    if bbox:
        left, top, right, bottom = bbox
        image = image.crop((max(0, left - MARGIN), max(0, top - MARGIN),
                            min(image.width, right + MARGIN), min(image.height, bottom + MARGIN)))

    target = Image.new("RGB", canvas, PAPER)
    scale = min(canvas[0] / image.width, canvas[1] / image.height)
    size = (max(1, round(image.width * scale)), max(1, round(image.height * scale)))
    image = image.resize(size, Image.LANCZOS)
    target.paste(image, ((canvas[0] - size[0]) // 2, (canvas[1] - size[1]) // 2))
    return target


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", required=True, type=pathlib.Path,
                        help="folder with the raw renders named after the PLAN keys")
    parser.add_argument("--quality", type=int, default=88)
    args = parser.parse_args()

    missing = [name for name, _, _ in PLAN if not (args.src / f"{name}.png").exists()]
    for name, out, canvas in PLAN:
        source = args.src / f"{name}.png"
        if not source.exists():
            continue
        art = trim_and_fit(duotone(Image.open(source)), canvas)
        art.save(ASSETS / out, "JPEG", quality=args.quality, optimize=True, progressive=True)
        print(f"{source.name} -> {out} {canvas[0]}x{canvas[1]}")
    if missing:
        print("not rendered yet: " + ", ".join(missing))


if __name__ == "__main__":
    main()
