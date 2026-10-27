#!/usr/bin/env python3
"""Build the hand-drawn illustration set used by the course app.

The illustration masters are loose ink-and-pastel drawings kept as PNG files outside
the repository (they are heavy and not needed at runtime). This script turns them
into the compact, portable JPEGs the app references: it trims the empty paper around
the drawing, restores a deliberate margin, places the drawing on the surface the
interface needs, and writes metadata-free files into presentation/assets/.

    python3 presentation/build/build_illustrations.py
    python3 presentation/build/build_illustrations.py --src ~/illustrations --only m06

The art direction is a hand-inked doodle: a thin, wobbly black fineliner line, flat
pastel fills (pale ice blue, sage, warm sand) on white paper, wide air around the
subject and exactly one small signal-red accent. Illustrations are declared in
course-data.js under imageCredits with the prefix `illo-`, and the app labels them
ILLUSTRATION · ORIGINAL COURSE GRAPHIC rather than showing them as venue photographs.
Scene briefs live next to this script in illustration-prompts.md.

Requirements: Pillow (see presentation/build/requirements.txt).
"""

from __future__ import annotations

import argparse
import pathlib
import sys

from PIL import Image, ImageChops

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "presentation" / "assets"
DEFAULT_SRC = ROOT / "tmp" / "illustrations"

PAPER = (255, 255, 255)
TRIM_TOLERANCE = 8        # ink and pastel are far from paper; JPEG noise is not
PADDING = 0.07            # breathing room around the drawing, share of its long edge
JPEG_QUALITY = 88

# master name, asset name, target surface (width, height)
PLAN: list[tuple[str, str, tuple[int, int]]] = [
    # --- the two vertical surfaces: access panel and course landing hero ----------
    ("hero.png", "illo-hero-scene.jpg", (1080, 1620)),
    ("gate.png", "illo-gate-still-life.jpg", (1080, 1620)),
    # --- module covers (3:2) ------------------------------------------------------
    ("m01-signals.png", "illo-m01-signals.jpg", (1536, 1024)),
    ("m02-atmosphere.png", "illo-m02-atmosphere.jpg", (1536, 1024)),
    ("m03-senses.png", "illo-m03-senses.jpg", (1536, 1024)),
    ("m04-menu.png", "illo-m04-menu.jpg", (1536, 1024)),
    ("m05-automation.png", "illo-m05-automation.jpg", (1536, 1024)),
    ("m06-ai.png", "illo-m06-ai.jpg", (1536, 1024)),
    ("m07-fnb.png", "illo-m07-fnb.jpg", (1536, 1024)),
    ("m08-venture.png", "illo-m08-venture.jpg", (1536, 1024)),
    ("m09-found.png", "illo-m09-found.jpg", (1536, 1024)),
    ("m10-mockup.png", "illo-m10-mockup.jpg", (1536, 1024)),
    # --- case-card covers (3:2) ---------------------------------------------------
    ("case-benfiddich-kayama.png", "illo-case-benfiddich-kayama.jpg", (1264, 848)),
    ("case-black-swan-bobkov.png", "illo-case-black-swan-bobkov.jpg", (1264, 848)),
    ("case-shapes-savage.png", "illo-case-shapes-savage.jpg", (1264, 848)),
    ("case-sips-caporale.png", "illo-case-sips-caporale.jpg", (1264, 848)),
    ("case-el-copitas-zernov.png", "illo-case-el-copitas-zernov.jpg", (1264, 848)),
    ("case-city-space-narzi.png", "illo-case-city-space-narzi.jpg", (1264, 848)),
    ("case-sensory-talalay.png", "illo-case-sensory-talalay.jpg", (1264, 848)),
    ("case-jiro-ono.png", "illo-case-jiro-ono.jpg", (1264, 848)),
    ("case-krasota-zarkov.png", "illo-case-krasota-zarkov.jpg", (1264, 848)),
    ("case-dave-arnold.png", "illo-case-dave-arnold.jpg", (1264, 848)),
]


def flatten(image: Image.Image) -> Image.Image:
    """Drop transparency and any stray off-white paper tone onto pure white."""
    if image.mode in ("RGBA", "LA", "P"):
        image = image.convert("RGBA")
        canvas = Image.new("RGB", image.size, PAPER)
        canvas.paste(image, mask=image.split()[-1])
        return canvas
    return image.convert("RGB")


def trim_paper(image: Image.Image) -> Image.Image:
    """Crop the empty paper around the drawing, keeping a deliberate margin."""
    white = Image.new("RGB", image.size, PAPER)
    diff = ImageChops.difference(image, white).convert("L")
    box = diff.point(lambda value: 255 if value > TRIM_TOLERANCE else 0).getbbox()
    if not box:
        return image
    left, top, right, bottom = box
    margin = int(max(right - left, bottom - top) * PADDING)
    return image.crop((
        max(left - margin, 0),
        max(top - margin, 0),
        min(right + margin, image.width),
        min(bottom + margin, image.height),
    ))


def fit(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Scale the trimmed drawing down, then centre it on the surface the app needs."""
    width, height = size
    scale = min(width / image.width, height / image.height)
    drawing = image.resize(
        (max(int(image.width * scale), 1), max(int(image.height * scale), 1)),
        Image.LANCZOS,
    )
    surface = Image.new("RGB", size, PAPER)
    surface.paste(drawing, ((width - drawing.width) // 2, (height - drawing.height) // 2))
    return surface


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--src", type=pathlib.Path, default=DEFAULT_SRC,
                        help=f"folder with the illustration masters (default: {DEFAULT_SRC})")
    parser.add_argument("--only", action="append", default=None,
                        help="build a single asset by master name prefix, e.g. --only m06")
    args = parser.parse_args()

    if not args.src.is_dir():
        print(f"illustration masters not found: {args.src}", file=sys.stderr)
        return 1

    built = 0
    for master, asset, size in PLAN:
        if args.only and not any(master.startswith(prefix) for prefix in args.only):
            continue
        source = args.src / master
        if not source.exists():
            continue
        image = fit(trim_paper(flatten(Image.open(source))), size)
        target = ASSETS / asset
        image.save(target, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        print(f"{asset:<38} {image.width}x{image.height}  {target.stat().st_size / 1024:.0f} kB")
        built += 1

    if not built:
        print("nothing built — check the master file names", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
