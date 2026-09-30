# -*- coding: utf-8 -*-
"""
Contemporary HoReCa Scene — HIM-inspired slide rendering library (ReportLab, 16:9).

Visual direction: bright editorial pages, Swiss-blue structure, a restrained red
accent, generous white space, and real people / Montreux photography.
"""
import os
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as canvas_module
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT

HERE = os.path.dirname(os.path.abspath(__file__))
ASSET_DIR = os.path.normpath(os.path.join(HERE, "..", "assets"))
LOGO_PATH = os.path.join(ASSET_DIR, "him-logo-white.png")
CAMPUS_PHOTO = os.path.join(ASSET_DIR, "him-campus.jpg")
STUDENTS_PHOTO = os.path.join(ASSET_DIR, "him-students-lake.png")
OPEN_DAY_PHOTO = os.path.join(ASSET_DIR, "him-student-open-day.jpg")
CLASSROOM_PHOTO = os.path.join(ASSET_DIR, "him-classroom.jpg")

# Inter is used when available; the DejaVu fallback is bundled with Debian/Ubuntu
# and supports both Latin and Cyrillic. Keep the familiar internal font names so
# the existing content files can be built unchanged.
FONT_DIRS = [
    os.environ.get("HIM_FONT_DIR", ""),
    os.path.normpath(os.path.join(HERE, "..", "..", "..", ".pdftools", "fonts")),
    "/home/user/.pdftools/fonts",
    "/usr/share/fonts/truetype/dejavu",
]
FONT_FILES = {
    "Inter": ("Inter-Regular.ttf", "DejaVuSans.ttf"),
    "Inter-Medium": ("Inter-Medium.ttf", "DejaVuSans.ttf"),
    "Inter-Bold": ("Inter-Bold.ttf", "DejaVuSans-Bold.ttf"),
    "Inter-XB": ("Inter-ExtraBold.ttf", "DejaVuSans-Bold.ttf"),
    # The serif fallback gives quotations the editorial contrast used on HIM's site.
    "Inter-Italic": ("Inter-Italic.ttf", "DejaVuSerif.ttf"),
}


def _find_font(candidates):
    for directory in FONT_DIRS:
        if not directory:
            continue
        for filename in candidates:
            path = os.path.join(directory, filename)
            if os.path.isfile(path):
                return path
    raise FileNotFoundError(
        "Could not find a slide font. Install DejaVu Sans or set HIM_FONT_DIR."
    )


for font_name, candidates in FONT_FILES.items():
    pdfmetrics.registerFont(TTFont(font_name, _find_font(candidates)))
pdfmetrics.registerFontFamily(
    "Inter", normal="Inter", bold="Inter-Bold", italic="Inter-Italic", boldItalic="Inter-Bold"
)

# ---------- HIM-inspired palette ----------
BG = HexColor("#FFFFFF")
PANEL = HexColor("#F1F6F9")
PANEL2 = HexColor("#E5F0F6")
NAVY = HexColor("#102F49")
BLUE = HexColor("#087CA8")
BLUE_MID = HexColor("#3996B8")
RED = HexColor("#D83945")
TEXT = HexColor("#18364C")
MUTED = HexColor("#5E788A")
LINE = HexColor("#D6E2E9")
WHITE = HexColor("#FFFFFF")

# Legacy names retained for the slide-content modules; both now map to HIM blues.
GOLD = BLUE
GOLD_SOFT = BLUE_MID

MODULE_COLORS = {
    1: HexColor("#087CA8"),  # contemporary blue
    2: HexColor("#1C8FB6"),  # lake blue
    3: HexColor("#3A9CC0"),  # clear sky
    4: HexColor("#276F98"),  # deep blue
    5: HexColor("#D83945"),  # Swiss red, reserved for the global-scene module
}

PAGE_W, PAGE_H = 960.0, 540.0
M = 56.0  # margin


# ---------- text and image helpers ----------
def _style(size, color=TEXT, font="Inter", leading=None, align=TA_LEFT, space_after=0):
    return ParagraphStyle(
        "s", fontName=font, fontSize=size, leading=leading or size * 1.32,
        textColor=color, alignment=align, spaceAfter=space_after
    )


def spaced(text, sep=" "):
    return sep.join(list(text.upper()))


def para(c, text, x, y, w, size, color=TEXT, font="Inter", leading=None, align=TA_LEFT):
    """Draw a paragraph; returns height consumed (approx)."""
    st = _style(size, color, font, leading, align)
    p = Paragraph(text.replace("\n", "<br/>"), st)
    _, ph = p.wrap(w, 10000)
    p.drawOn(c, x, y - ph)
    return ph


def textw(c, text, font, size):
    return pdfmetrics.stringWidth(text, font, size)


def draw_photo(c, path, x, y, w, h, focus_x=0.5, focus_y=0.5):
    """Place a photo cropped to a rectangle without distorting it."""
    if not os.path.isfile(path):
        return False
    image = ImageReader(path)
    iw, ih = image.getSize()
    scale = max(w / float(iw), h / float(ih))
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) * min(max(focus_x, 0.0), 1.0)
    dy = y + (h - dh) * min(max(focus_y, 0.0), 1.0)
    clip = c.beginPath()
    clip.rect(x, y, w, h)
    c.saveState()
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(image, dx, dy, width=dw, height=dh, mask="auto")
    c.restoreState()
    return True


def draw_logo(c, x, y, w, h):
    """Draw the official white HIM mark over a dark field."""
    if os.path.isfile(LOGO_PATH):
        c.drawImage(ImageReader(LOGO_PATH), x, y, width=w, height=h, mask="auto", preserveAspectRatio=True)


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

    def swiss_cross(self, x, y, size=11):
        """A small Swiss-cross cue, used in the recurring wordmark lock-up."""
        self.setFillColor(RED)
        self.roundRect(x, y, size, size, 2, stroke=0, fill=1)
        self.setFillColor(WHITE)
        self.rect(x + size * 0.42, y + size * 0.18, size * 0.16, size * 0.64, stroke=0, fill=1)
        self.rect(x + size * 0.18, y + size * 0.42, size * 0.64, size * 0.16, stroke=0, fill=1)

    def chip(self, x, y, label, color, text_color=WHITE, size=8, pad=7):
        self.setFont("Inter-Bold", size)
        w = textw(self, label.upper(), "Inter-Bold", size) + pad * 2
        self.setFillColor(color)
        self.roundRect(x, y, w, size + 9, (size + 9) / 2.0, stroke=0, fill=1)
        self.setFillColor(text_color)
        self.drawString(x + pad, y + 4.2, label.upper())
        return w

    def header(self, kicker="", page_label=True):
        self.swiss_cross(M, PAGE_H - 33, 11)
        self.setFillColor(NAVY)
        self.setFont("Inter-Bold", 7.5)
        self.drawString(M + 18, PAGE_H - 29, "HIM BUSINESS SCHOOL")
        self.setFillColor(MUTED)
        self.setFont("Inter", 6.6)
        self.drawString(M + 18, PAGE_H - 38, "HOTEL INSTITUTE MONTREUX")
        self.setFont("Inter", 7.5)
        self.setFillColor(MUTED)
        self.drawRightString(PAGE_W - M, PAGE_H - 31, self._footer_label)
        self.hline(M, PAGE_H - 48, PAGE_W - 2 * M, LINE, 0.65)

    def footer(self):
        self.hline(M, 34, PAGE_W - 2 * M, LINE, 0.65)
        self.setFont("Inter-Bold", 6.8)
        self.setFillColor(BLUE)
        self.drawString(M, 22, "BE WORLD READY  ·  COURSE PROPOSAL 2026–27")
        self.setFont("Inter", 6.8)
        self.setFillColor(MUTED)
        self.drawRightString(PAGE_W - M - 30, 22, "EGOR TARASENKO  ·  HIM ALUMNUS")
        self.setFont("Inter-Bold", 7)
        self.setFillColor(RED)
        self.drawRightString(PAGE_W - M, 22, f"{self._pageno + 1:02d}")

    def start_slide(self, with_header=True, with_footer=True):
        self.bg()
        if with_header:
            self.header("")
        if with_footer:
            self.footer()
        return CONTENT_TOP


CONTENT_TOP = PAGE_H - 66.0


# ---------- slide builders ----------
def slide_title_block(c, title, subtitle=None, accent=GOLD, y=None):
    y = y or CONTENT_TOP
    c.vrect(M, y - 30, 4, 34, accent)
    c.setFont("Inter-XB", 23)
    c.setFillColor(NAVY)
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
                       textColor=WHITE, alignment=TA_LEFT),
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
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("LINEBELOW", (0, 0), (-1, 0), 1.2, BLUE),
    ]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), PANEL))
            else:
                style.append(("BACKGROUND", (0, i), (-1, i), BG))
    style.append(("GRID", (0, 0), (-1, -1), 0.45, LINE))
    t.setStyle(TableStyle(style))
    total_h = header_h + row_h * (len(data) - 1)
    t.wrap(sum(col_w), 10000)
    t.drawOn(c, x, y - total_h)
    return y - total_h


def cards_grid(c, cards, x, y, w, card_w=None, card_h=92, cols=3, gap=14):
    """cards: list of (value, label, sub)."""
    cw = card_w or ((w - gap * (cols - 1)) / cols)
    cx, cy = x, y
    for i, card in enumerate(cards):
        value, label, sub = card
        c.setFillColor(PANEL)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.55)
        c.roundRect(cx, cy - card_h, cw, card_h, 5, stroke=1, fill=1)
        c.vrect(cx, cy - card_h, 3, card_h, BLUE)
        c.setFont("Inter-XB", 19)
        c.setFillColor(BLUE)
        c.drawString(cx + 14, cy - 32, value)
        c.setFont("Inter-Bold", 9.5)
        c.setFillColor(NAVY)
        lh = para(c, label.upper(), cx + 14, cy - 42, cw - 28, 9.5, NAVY, "Inter-Bold", leading=12.5)
        if sub:
            para(c, sub, cx + 14, cy - 42 - lh - 3, cw - 28, 8, MUTED, leading=10.5)
        cx += cw + gap
        if (i + 1) % cols == 0:
            cx = x
            cy -= card_h + gap
    return cy


def course_cover(c, deck_label, descriptor, positioning, author_label, author_name,
                 credential, location_label, format_label):
    """HIM-inspired split cover with Montreux student photography."""
    c.bg()
    photo_x = 552
    draw_photo(c, STUDENTS_PHOTO, photo_x, 0, PAGE_W - photo_x, PAGE_H, focus_x=0.52, focus_y=0.78)
    c.setFillColor(NAVY)
    c.rect(0, 0, photo_x, PAGE_H, stroke=0, fill=1)
    c.vrect(photo_x - 6, 0, 6, PAGE_H, RED)

    draw_logo(c, M + 2, PAGE_H - 121, 74, 74)
    c.setFont("Inter-Bold", 9)
    c.setFillColor(WHITE)
    c.drawString(M + 89, PAGE_H - 67, "HIM BUSINESS SCHOOL")
    c.setFont("Inter", 7.5)
    c.setFillColor(HexColor("#B9D2E2"))
    c.drawString(M + 89, PAGE_H - 82, "HOTEL INSTITUTE MONTREUX")

    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M + 6, PAGE_H - 160, spaced(deck_label, "  "))
    c.setFont("Inter-XB", 36)
    c.setFillColor(WHITE)
    c.drawString(M + 6, PAGE_H - 212, "CONTEMPORARY")
    c.drawString(M + 6, PAGE_H - 256, "HORECA SCENE")
    c.vrect(M + 6, PAGE_H - 275, 54, 3, RED)
    para(c, descriptor, M + 6, PAGE_H - 291, 440, 10.2, HexColor("#D6E7F0"), "Inter-Medium", leading=14)
    para(c, positioning, M + 6, PAGE_H - 338, 442, 9.1, HexColor("#B9D2E2"), "Inter", leading=13)

    c.hline(M + 6, 112, 438, HexColor("#46647A"), 0.65)
    c.setFont("Inter-Bold", 7.2)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M + 6, 92, author_label.upper())
    c.setFont("Inter-XB", 14)
    c.setFillColor(WHITE)
    c.drawString(M + 6, 71, author_name)
    c.setFont("Inter", 7.9)
    c.setFillColor(HexColor("#B9D2E2"))
    c.drawString(M + 6, 54, credential)
    c.drawRightString(photo_x - 20, 92, location_label)
    c.drawRightString(photo_x - 20, 76, format_label)
    c.showPage()


def closing_page(c, headline, author_name, credential, source_line, location_label):
    """Photo-led closing page echoing HIM's Montreux campus storytelling."""
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_photo(c, CAMPUS_PHOTO, 0, 235, PAGE_W, PAGE_H - 235, focus_x=0.5, focus_y=0.54)
    c.vrect(0, 229, PAGE_W, 6, RED)
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, 230, stroke=0, fill=1)
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M, 205, spaced("BE WORLD READY", "  "))
    para(c, headline, M, 191, PAGE_W - 2 * M, 25, WHITE, "Inter-XB", leading=31)
    c.setFont("Inter-XB", 12.5)
    c.setFillColor(WHITE)
    c.drawString(M, 104, author_name)
    c.setFont("Inter", 8.4)
    c.setFillColor(HexColor("#B9D2E2"))
    c.drawString(M, 88, credential)
    c.setFont("Inter", 7.5)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M, 54, location_label)
    c.setFont("Inter", 6.7)
    c.setFillColor(HexColor("#B9D2E2"))
    c.drawString(M, 35, source_line)
    draw_logo(c, PAGE_W - M - 63, 42, 56, 56)
    c.showPage()
