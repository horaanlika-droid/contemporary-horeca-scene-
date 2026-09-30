# -*- coding: utf-8 -*-
"""Build the English-only course pitch deck as a PDF."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from deck_lib import DeckCanvas
import content_en

DIST = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist"))
os.makedirs(DIST, exist_ok=True)

path = os.path.join(DIST, "Contemporary-Horeca-Scene-Course-Pitch-EN.pdf")
c = DeckCanvas(path, footer_label="Hotel Institute Montreux · Course Proposal")
c.setTitle("Contemporary Horeca Scene — Course Proposal")
c.setAuthor("Egor Tarasenko, HIM Alumnus (Master in Business Management)")
content_en.build(c)
c.save()
print("built:", path)
