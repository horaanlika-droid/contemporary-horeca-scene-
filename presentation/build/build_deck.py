# -*- coding: utf-8 -*-
"""Build both EN and RU course pitch decks as PDF."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deck_lib import DeckCanvas
import content_en, content_ru

DIST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist"))
os.makedirs(DIST, exist_ok=True)

targets = [
    ("Contemporary-HoReCa-Scene-Course-Pitch-EN.pdf", content_en, "Hotel Institute Montreux · Course Proposal"),
    ("Contemporary-HoReCa-Scene-Course-Pitch-RU.pdf", content_ru, "Hotel Institute Montreux · Предложение курса"),
]

for fname, mod, label in targets:
    path = os.path.join(DIST, fname)
    c = DeckCanvas(path, footer_label=label)
    c.setTitle("Contemporary HoReCa Scene — Course Proposal")
    c.setAuthor("Egor Tarasenko, HIM Alumnus (Master in Business Management)")
    mod.build(c)
    c.save()
    print("built:", path)
