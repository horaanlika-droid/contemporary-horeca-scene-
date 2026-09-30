# -*- coding: utf-8 -*-
"""
Contemporary HoReCa Scene — slide rendering library (reportlab, 16:9).
"""
import os
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvas_module
from reportlab.platypus import Paragraph, Frame, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

FONT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".pdftools", "fonts")
FONT_DIR = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".pdftools", "fonts"))
if not os.path.isdir(FONT_DIR):
    FONT_DIR = "/home/user/.pdftools/fonts"

for name, fname in [
    ("Inter", "Inter-Regular.ttf"),
    ("Inter-Medium", "Inter-Medium.ttf"),
    ("Inter-Bold", "Inter-Bold.ttf"),
    ("Inter-XB", "Inter-ExtraBold.ttf"),
    ("Inter-Italic", "Inter-Italic.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, fname)))

# ---------- palette ----------
BG       = HexColor("#101419")
PANEL    = HexColor("#181E26")
PANEL2   = HexColor("#1E2530")
GOLD     = HexColor("#C8A24A")
GOLD_SOFT= HexColor("#E5C87E")
TEXT     = HexColor("#F2EEE6")
MUTED    = HexColor("#97A0AC")
LINE     = HexColor("#2A323E")
WHITE    = HexColor("#FFFFFF")

MODULE_COLORS = {
    1: HexColor("#C8A24A"),  # trends — gold
    2: HexColor("#E2725B"),  # design — terracotta
    3: HexColor("#9B8BE0"),  # neurogastronomy — violet
    4: HexColor("#4FA3A5"),  # tech — steel teal
    5: HexColor("#B04A5A"),  # world leaders — burgundy
}

PAGE_W, PAGE_H = 960.0, 540.0
M = 56.0  # margin

# ---------- text helpers ----------
def _style(size, color=TEXT, font="Inter", leading=None, align=TA_LEFT, space_after=0):
    return ParagraphStyle("s", fontName=font, fontSize=size, leading=leading or size * 1.32,
                          textColor=color, alignment=align, spaceAfter=space_after)

def spaced(text, sep=" "):
    return sep.join(list(text.upper()))

def para(c, text, x, y, w, size, color=TEXT, font="Inter", leading=None, align=TA_LEFT):
    """Draw a paragraph; returns height consumed (approx)."""
    st = _style(size, color, font, leading, align)
    p = Paragraph(text.replace("\n", "<br/>"), st)
    pw, ph = p.wrap(w, 10000)
    p.drawOn(c, x, y - ph)
    return ph

def textw(c, text, font, size):
    return pdfmetrics.stringWidth(text, font, size)

# ---------- canvas ----------
class DeckCanvas(canvas_module.Canvas):
    def __init__(self, filename, footer_label):
        super().__init__(filename, pagesize=(PAGE_W, PAGE_H))
        self._footer_label = footer_label
        self._pageno = 0

    def showPage(self):
        self._pageno += 1
        super().showPage()

    def bg(self):
        self.setFillColor(BG)
        self.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    def panel(self, x, y, w, h, color=PANEL, r=6):
        self.setFillColor(color)
        self.roundRect(x, y, w, h, r, stroke=0, fill=1)

    def hline(self, x, y, w, color=LINE, width=0.8):
        self.setStrokeColor(color)
        self.setLineWidth(width)
        self.line(x, y, x + w, y)

    def vrect(self, x, y, w, h, color):
        self.setFillColor(color)
        self.rect(x, y, w, h, stroke=0, fill=1)

    def chip(self, x, y, label, color, text_color=BG, size=8, pad=7):
        self.setFont("Inter-Bold", size)
        w = textw(self, label.upper(), "Inter-Bold", size) + pad * 2
        self.setFillColor(color)
        self.roundRect(x, y, w, size + 9, (size + 9) / 2.0, stroke=0, fill=1)
        self.setFillColor(text_color)
        self.drawString(x + pad, y + 4.2, label.upper())
        return w

    def header(self, kicker, page_label=True):
        self.setFont("Inter-Bold", 7.5)
        self.setFillColor(GOLD)
        self.drawString(M, PAGE_H - 34, spaced("Contemporary HoReCa Scene", "  "))
        self.setFont("Inter", 7.5)
        self.setFillColor(MUTED)
        self.drawRightString(PAGE_W - M, PAGE_H - 34, self._footer_label)
        self.hline(M, PAGE_H - 42, PAGE_W - 2 * M)

    def footer(self):
        self.hline(M, 34, PAGE_W - 2 * M)
        self.setFont("Inter", 7)
        self.setFillColor(MUTED)
        self.drawString(M, 22, "Hotel Institute Montreux  ·  Course Proposal 2026–27")
        self.drawRightString(PAGE_W - M, 22, "Egor Tarasenko — Master in Business Management, HIM Alumnus")

    def start_slide(self, with_header=True, with_footer=True):
        self.bg()
        if with_header:
            self.header("")
        return CONTENT_TOP

CONTENT_TOP = PAGE_H - 66.0

# ---------- slide builders ----------
def slide_title_block(c, title, subtitle=None, accent=GOLD, y=None):
    y = y or CONTENT_TOP
    c.vrect(M, y - 30, 4, 34, accent)
    c.setFont("Inter-XB", 23)
    c.setFillColor(TEXT)
    c.drawString(M + 16, y - 22, title)
    yy = y - 22
    if subtitle:
        c.setFont("Inter", 10.5)
        c.setFillColor(MUTED)
        c.drawString(M + 16, yy - 20, subtitle)
        yy -= 20
    return yy - 16

def bullets_block(c, items, x, y, w, size=10.5, gap=9, color=TEXT, bullet_color=GOLD, leading=1.35):
    yy = y
    for it in items:
        if isinstance(it, tuple):
            head, body = it
            c.setFillColor(bullet_color)
            c.setFont("Inter-Bold", size)
            c.drawString(x, yy - size, "—")
            c.setFillColor(color)
            c.setFont("Inter-Bold", size)
            c.drawString(x + 16, yy - size, head)
            yy -= size * 1.5
            if body:
                h = para(c, body, x + 16, yy, w - 16, size - 1.2, MUTED, leading=leading * (size - 1.2))
                yy -= h + gap - 4
        else:
            c.setFillColor(bullet_color)
            c.setFont("Inter-Bold", size)
            c.drawString(x, yy - size, "—")
            h = para(c, it, x + 16, yy, w - 16, size, color, leading=leading * size)
            yy -= h + gap
    return yy

def make_table(c, data, x, y, col_w, row_h=24, header_h=26, font_size=9.2, header_size=8,
               align=None, zebra=True, accent=GOLD):
    """data: list of rows; row 0 is header. Returns bottom y."""
    styles = [
        ParagraphStyle("h", fontName="Inter-Bold", fontSize=header_size, leading=header_size * 1.25,
                       textColor=BG, alignment=TA_LEFT),
        ParagraphStyle("b", fontName="Inter", fontSize=font_size, leading=font_size * 1.3,
                       textColor=TEXT, alignment=TA_LEFT),
    ]
    pdata = []
    for ri, row in enumerate(data):
        prow = []
        for cell in row:
            prow.append(Paragraph(str(cell), styles[0 if ri == 0 else 1]))
        pdata.append(prow)
    t = Table(pdata, colWidths=col_w, rowHeights=[header_h] + [row_h] * (len(data) - 1), repeatRows=0)
    style = [
        ("BACKGROUND", (0, 0), (-1, 0), accent),
        ("TEXTCOLOR", (0, 0), (-1, 0), BG),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, BG),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), PANEL))
    style.append(("GRID", (0, 0), (-1, -1), 0.5, LINE))
    t.setStyle(TableStyle(style))
    total_h = header_h + row_h * (len(data) - 1)
    t.wrap(sum(col_w), 10000)
    t.drawOn(c, x, y - total_h)
    return y - total_h

def cards_grid(c, cards, x, y, w, card_w=None, card_h=92, cols=3, gap=14):
    """cards: list of (value, label, sub)"""
    cw = card_w or ((w - gap * (cols - 1)) / cols)
    cx, cy = x, y
    for i, card in enumerate(cards):
        value, label, sub = card
        c.setFillColor(PANEL)
        c.roundRect(cx, cy - card_h, cw, card_h, 6, stroke=0, fill=1)
        c.vrect(cx, cy - card_h, 3, card_h, GOLD)
        c.setFont("Inter-XB", 19)
        c.setFillColor(GOLD_SOFT)
        c.drawString(cx + 14, cy - 32, value)
        c.setFont("Inter-Bold", 9.5)
        c.setFillColor(TEXT)
        # label may wrap
        lh = para(c, label.upper(), cx + 14, cy - 42, cw - 28, 9.5, TEXT, "Inter-Bold", leading=12.5)
        if sub:
            para(c, sub, cx + 14, cy - 42 - lh - 3, cw - 28, 8, MUTED, leading=10.5)
        cx += cw + gap
        if (i + 1) % cols == 0:
            cx = x
            cy -= card_h + gap
    return cy
