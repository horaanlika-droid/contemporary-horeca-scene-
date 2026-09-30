#!/usr/bin/env python3
"""Build the author-project photo set used by the course app.

Source photographs are the originals uploaded to the repository root (IMG_*.jpeg /
IMG_8809.png). This script produces optimised, metadata-free copies in
presentation/assets/ so the web app and the deck can reference stable, portable
file names instead of camera file names.

    python3 presentation/build/build_project_assets.py

Requirements: Pillow (see presentation/build/requirements.txt).
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "presentation" / "assets"
MAX_EDGE = 1400
JPEG_QUALITY = 82

# source file, output name, crop box (left, top, right, bottom) or None
PLAN: list[tuple[str, str, tuple[int, int, int, int] | None]] = [
    # --- Joi Espresso Bar (JOC) -------------------------------------------------
    ("IMG_6683.jpeg", "project-joi-arcade.jpg", None),
    ("IMG_6703.jpeg", "project-joi-arcade-lights.jpg", None),
    ("IMG_6685.jpeg", "project-joi-arcade-arches.jpg", None),
    ("IMG_6684.jpeg", "project-joi-facade.jpg", None),
    ("IMG_7615.jpeg", "project-joi-brand.jpg", None),
    ("IMG_6708.jpeg", "project-joi-cups.jpg", None),
    ("IMG_6706.jpeg", "project-joi-bar.jpg", None),
    ("IMG_7619.jpeg", "project-joi-machine.jpg", None),
    ("IMG_7622.jpeg", "project-joi-grinder.jpg", None),
    # --- Passie Cakes Co. -------------------------------------------------------
    ("IMG_6727.jpeg", "project-passie-wall.jpg", None),
    ("IMG_6724.jpeg", "project-passie-cake.jpg", None),
    ("IMG_6722.jpeg", "project-passie-sakura.jpg", None),
    ("IMG_7624.jpeg", "project-passie-cheesecake.jpg", None),
    ("IMG_7625.jpeg", "project-passie-room.jpg", None),
    ("IMG_6725.jpeg", "project-passie-counter.jpg", None),
    ("IMG_7626.jpeg", "project-passie-window.jpg", None),
    # --- CooCoo Coffee · Croffles · Cookies -------------------------------------
    ("IMG_6719.jpeg", "project-coocoo-pour.jpg", None),
    ("IMG_6721.jpeg", "project-coocoo-room.jpg", None),
    ("IMG_6720.jpeg", "project-coocoo-bulbs.jpg", None),
    ("IMG_7621.jpeg", "project-coocoo-team.jpg", None),
    ("IMG_7623.jpeg", "project-coocoo-menu.jpg", None),
    # --- Chicken Connection (Moscow, with Dmitry Konnikov) ----------------------
    # Both sources are phone screenshots of the published episodes: keep the video
    # frame only, drop the YouTube interface below it.
    ("IMG_1337.jpeg", "project-chicken-connection-pass.jpg", (0, 0, 1488, 834)),
    ("IMG_1338.jpeg", "project-chicken-connection-kitchen.jpg", (0, 0, 1488, 834)),
    # --- Pacific · bar solutions --------------------------------------
    ("IMG_6691.jpeg", "project-pacific-station.jpg", None),
    ("IMG_6689.jpeg", "project-pacific-console.jpg", None),
    ("IMG_6690.jpeg", "project-pacific-render.jpg", None),
    ("IMG_6687.jpeg", "project-pacific-drawing.jpg", None),
    ("IMG_8809.png", "project-pacific-logo.png", None),
    # --- TAM / TYT · bar objects & merchandise ----------------------------------
    ("IMG_9076.jpeg", "project-tam-cubes.jpg", None),
    ("IMG_8949.jpeg", "project-tam-stool.jpg", None),
    ("IMG_8967.jpeg", "project-tam-socks.jpg", None),
    ("IMG_9037.jpeg", "project-tam-mirror.jpg", None),
    ("IMG_9040.jpeg", "project-tam-flatlay.jpg", None),
    ("IMG_8926.jpeg", "project-tam-opener.jpg", None),
    ("IMG_9048.jpeg", "project-tam-tool.jpg", None),
    # --- Found objects, details & street sourcing -------------------------------
    ("IMG_6716.jpeg", "project-detail-nine-lives.jpg", None),
    ("IMG_6717.jpeg", "project-detail-nine-lives-bar.jpg", None),
    ("IMG_6715.jpeg", "project-detail-342.jpg", None),
    ("IMG_6709.jpeg", "project-detail-backbar.jpg", None),
    ("IMG_6705.jpeg", "project-detail-chess.jpg", None),
    ("IMG_6707.jpeg", "project-detail-chess-morning.jpg", None),
    ("IMG_6713.jpeg", "project-detail-street-press.jpg", None),
    ("IMG_6712.jpeg", "project-detail-street-press-2.jpg", None),
]


def build_one(source: str, target: str, box: tuple[int, int, int, int] | None) -> tuple[str, int]:
    src = ROOT / source
    if not src.exists():
        raise SystemExit(f"missing source photograph: {source}")
    image = Image.open(src)
    if box:
        image = image.crop(box)
    image.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)

    destination = ASSETS / target
    if destination.suffix.lower() == ".png":
        image.convert("RGB").save(destination, format="PNG", optimize=True)
    else:
        image.convert("RGB").save(
            destination, format="JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True
        )
    return target, destination.stat().st_size


def main() -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    total = 0
    for source, target, box in PLAN:
        name, size = build_one(source, target, box)
        total += size
        print(f"{source:>16}  ->  {name:<44} {size / 1024:6.1f} kB")
    print(f"\n{len(PLAN)} assets · {total / 1024 / 1024:.2f} MB total")
    return 0


if __name__ == "__main__":
    sys.exit(main())
