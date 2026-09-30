# -*- coding: utf-8 -*-
"""
Contemporary HoReCa Scene — slide rendering library (ReportLab, 16:9).

Visual direction: bright editorial pages, Swiss-blue structure, a restrained red
accent, generous white space, and thematic HoReCa photography (fine dining,
craft bars, architecture & atmosphere, neurogastronomy, hospitality technology).
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

# ---------- Thematic HoReCa photography ----------
PHOTO_CHEFS_COUNTER = os.path.join(ASSET_DIR, "horeca-chefs-counter.jpg")
PHOTO_CRAFT_BAR = os.path.join(ASSET_DIR, "horeca-craft-bar.jpg")
PHOTO_COCKTAIL_SHAKER = os.path.join(ASSET_DIR, "horeca-cocktail-shaker.jpg")
PHOTO_SUSTAINABLE_TERROIR = os.path.join(ASSET_DIR, "horeca-sustainable-terroir.jpg")
PHOTO_INTERIOR_DESIGN = os.path.join(ASSET_DIR, "horeca-interior-design.jpg")
PHOTO_INTERIOR_SCONCES = os.path.join(ASSET_DIR, "horeca-interior-sconces.jpg")
PHOTO_CERAMIC_SERVE = os.path.join(ASSET_DIR, "horeca-ceramic-serve.jpg")
PHOTO_KITCHEN_PLATING = os.path.join(ASSET_DIR, "horeca-kitchen-plating.jpg")
PHOTO_ATMOSPHERE_CANDLE = os.path.join(ASSET_DIR, "horeca-atmosphere-candle.jpg")
PHOTO_SENSORY_LAB = os.path.join(ASSET_DIR, "horeca-sensory-tasting-lab.jpg")
PHOTO_NEURO_SERVE = os.path.join(ASSET_DIR, "horeca-neurogastronomy-serve.jpg")
PHOTO_TECH_OPS = os.path.join(ASSET_DIR, "horeca-tech-operations.jpg")
PHOTO_AI_MIXOLOGY = os.path.join(ASSET_DIR, "horeca-ai-mixology-lab.jpg")
PHOTO_OPEN_FIRE = os.path.join(ASSET_DIR, "horeca-open-fire.jpg")
PHOTO_HOTEL_BAR = os.path.join(ASSET_DIR, "horeca-hotel-bar-trolley.jpg")
PHOTO_WINE_SERVICE = os.path.join(ASSET_DIR, "horeca-wine-service.jpg")
PHOTO_BACKBAR = os.path.join(ASSET_DIR, "horeca-backbar-bottles.jpg")
PHOTO_CONCEPT_PITCH = os.path.join(ASSET_DIR, "horeca-concept-pitch.jpg")

# Inter is used when available; the DejaVu fallback is bundled with Debian/Ubuntu
# and supports both Latin and Cyrillic.
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

# ---------- Palette ----------
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


def draw_photo(c, path, x, y, w, h, focus_x=0.5, focus_y=0.5, radius=0):
    """Place a photo cropped to a rectangle (or rounded rect) without distorting it."""
    if not path or not os.path.isfile(path):
        return False
    image = ImageReader(path)
    iw, ih = image.getSize()
    scale = max(w / float(iw), h / float(ih))
    dw, dh = iw * scale, ih * scale
    dx = x + (w - dw) * min(max(focus_x, 0.0), 1.0)
    dy = y + (h - dh) * min(max(focus_y, 0.0), 1.0)
    clip = c.beginPath()
    if radius > 0:
        clip.roundRect(x, y, w, h, radius)
    else:
        clip.rect(x, y, w, h)
    c.saveState()
    c.clipPath(clip, stroke=0, fill=0)
    c.drawImage(image, dx, dy, width=dw, height=dh, mask="auto")
    c.restoreState()
    return True


def draw_photo_card(c, path, x, y, w, h, label="", caption="", accent=BLUE, focus_x=0.5, focus_y=0.5):
    """Draw a photo with a clean caption strip at the bottom of the box (top-anchored at y)."""
    cap_h = 46 if (label or caption) else 0
    photo_h = h - cap_h
    c.setFillColor(NAVY)
    c.roundRect(x, y - h, w, h, 6, stroke=0, fill=1)
    draw_photo(c, path, x, y - photo_h, w, photo_h, focus_x=focus_x, focus_y=focus_y, radius=0)
    if cap_h > 0:
        c.setFillColor(NAVY)
        c.rect(x, y - h, w, cap_h, stroke=0, fill=1)
        c.vrect(x, y - photo_h, w, 3, accent)
        if label:
            c.setFont("Inter-Bold", 7.2)
            c.setFillColor(HexColor("#91CAE1"))
            c.drawString(x + 12, y - photo_h - 14, label.upper())
        if caption:
            para(c, caption, x + 12, y - photo_h - 18, w - 24, 7.8, WHITE, "Inter", leading=10.2)


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
        self.drawString(M + 18, PAGE_H - 29, "CONTEMPORARY HORECA SCENE")
        self.setFillColor(MUTED)
        self.setFont("Inter", 6.6)
        self.drawString(M + 18, PAGE_H - 38, kicker if kicker else "HOTEL INSTITUTE MONTREUX · COURSE & LECTURES")
        self.setFont("Inter", 7.5)
        self.setFillColor(MUTED)
        self.drawRightString(PAGE_W - M, PAGE_H - 31, self._footer_label)
        self.hline(M, PAGE_H - 48, PAGE_W - 2 * M, LINE, 0.65)

    def footer(self):
        self.hline(M, 34, PAGE_W - 2 * M, LINE, 0.65)
        self.setFont("Inter-Bold", 6.8)
        self.setFillColor(BLUE)
        self.drawString(M, 22, "CONTEMPORARY HORECA SCENE  ·  2026–27")
        self.setFont("Inter", 6.8)
        self.setFillColor(MUTED)
        self.drawRightString(PAGE_W - M - 30, 22, "EGOR TARASENKO  ·  HIM ALUMNUS")
        self.setFont("Inter-Bold", 7)
        self.setFillColor(RED)
        self.drawRightString(PAGE_W - M, 22, f"{self._pageno + 1:02d}")

    def start_slide(self, kicker="", with_header=True, with_footer=True):
        self.bg()
        if with_header:
            self.header(kicker)
        if with_footer:
            self.footer()
        return CONTENT_TOP


CONTENT_TOP = PAGE_H - 66.0


# ---------- slide builders ----------
def slide_title_block(c, title, subtitle=None, accent=GOLD, y=None):
    y = y or CONTENT_TOP
    c.vrect(M, y - 30, 4, 34, accent)
    c.setFont("Inter-XB", 21.5)
    c.setFillColor(NAVY)
    c.drawString(M + 16, y - 21, title)
    yy = y - 21
    if subtitle:
        c.setFont("Inter", 10.0)
        c.setFillColor(MUTED)
        c.drawString(M + 16, yy - 19, subtitle)
        yy -= 19
    return yy - 14


def bullets_block(c, items, x, y, w, size=10.2, gap=8, color=TEXT, bullet_color=GOLD, leading=1.32):
    yy = y
    for it in items:
        if isinstance(it, tuple):
            head, body = it
            c.setFillColor(bullet_color)
            c.setFont("Inter-Bold", size)
            c.drawString(x, yy - size, "—")
            th = para(c, head, x + 16, yy, w - 16, size, color, "Inter-Bold", leading=leading * size)
            yy -= th + 2
            if body:
                h = para(c, body, x + 16, yy, w - 16, size - 1.1, MUTED, leading=leading * (size - 1.1))
                yy -= h + gap - 3
        else:
            c.setFillColor(bullet_color)
            c.setFont("Inter-Bold", size)
            c.drawString(x, yy - size, "—")
            h = para(c, it, x + 16, yy, w - 16, size, color, leading=leading * size)
            yy -= h + gap
    return yy


def prose_paragraphs(c, paragraphs, x, y, w, size=9.6, gap=9, color=TEXT, leading=13.4):
    """Render a list of narrative prose paragraphs cleanly; returns bottom y."""
    yy = y
    for p_text in paragraphs:
        if isinstance(p_text, tuple):
            subhead, body = p_text
            sh = para(c, subhead, x, yy, w, size + 0.4, NAVY, "Inter-Bold", leading=(size + 0.4) * 1.28)
            yy -= sh + 3
            bh = para(c, body, x, yy, w, size, color, "Inter", leading=leading)
            yy -= bh + gap
        else:
            bh = para(c, p_text, x, yy, w, size, color, "Inter", leading=leading)
            yy -= bh + gap
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
                 credential, location_label, format_label, cover_photo=PHOTO_CHEFS_COUNTER):
    """Split cover with thematic contemporary HoReCa photography."""
    c.bg()
    photo_x = 540
    draw_photo(c, cover_photo, photo_x, 0, PAGE_W - photo_x, PAGE_H, focus_x=0.5, focus_y=0.5)
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
    para(c, descriptor, M + 6, PAGE_H - 291, 430, 10.2, HexColor("#D6E7F0"), "Inter-Medium", leading=14)
    para(c, positioning, M + 6, PAGE_H - 338, 432, 9.1, HexColor("#B9D2E2"), "Inter", leading=13)

    c.hline(M + 6, 112, 428, HexColor("#46647A"), 0.65)
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


def closing_page(c, headline, author_name, credential, source_line, location_label,
                 closing_photo=PHOTO_HOTEL_BAR):
    """Photo-led closing page with thematic hospitality photography."""
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
    draw_photo(c, closing_photo, 0, 235, PAGE_W, PAGE_H - 235, focus_x=0.5, focus_y=0.45)
    c.vrect(0, 229, PAGE_W, 6, RED)
    c.setFillColor(NAVY)
    c.rect(0, 0, PAGE_W, 230, stroke=0, fill=1)
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M, 205, spaced("CONTEMPORARY HORECA SCENE", "  "))
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


# ---------- Lesson Presentation Slide Builders ----------
def render_lesson_cover(c, lesson_num, week_label, module_label, title, subtitle,
                        intro_prose, session_rhythm, reading_prep, photo, photo_caption,
                        module_num=1, lang="ru"):
    """Slide 1 of a lesson: Hero cover + narrative introduction prose + thematic photo."""
    accent = MODULE_COLORS.get(module_num, BLUE)
    c.bg()
    # Left dark editorial column (536 pt), right full-bleed photo (424 pt)
    split_x = 546
    draw_photo(c, photo, split_x, 0, PAGE_W - split_x, PAGE_H, focus_x=0.5, focus_y=0.5)
    # Caption overlay at bottom of photo
    c.setFillColor(NAVY)
    c.rect(split_x, 0, PAGE_W - split_x, 54, stroke=0, fill=1)
    c.vrect(split_x, 54, PAGE_W - split_x, 3, accent)
    para(c, photo_caption, split_x + 18, 42, PAGE_W - split_x - 32, 7.8, HexColor("#D6E7F0"), "Inter", leading=10.5)

    c.setFillColor(NAVY)
    c.rect(0, 0, split_x, PAGE_H, stroke=0, fill=1)
    c.vrect(split_x - 5, 0, 5, PAGE_H, accent)

    # Top badges
    c.swiss_cross(M, PAGE_H - 42, 11)
    c.setFont("Inter-Bold", 7.5)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M + 18, PAGE_H - 38, f"{week_label.upper()}  ·  {module_label.upper()}")

    # Title & subtitle
    para(c, title, M, PAGE_H - 64, split_x - M - 28, 22, WHITE, "Inter-XB", leading=27)
    para(c, subtitle, M, PAGE_H - 130, split_x - M - 28, 10.2, HexColor("#91CAE1"), "Inter-Medium", leading=13.8)
    c.vrect(M, PAGE_H - 168, 48, 3, RED)

    # Narrative prose introduction
    yy = PAGE_H - 180
    for p_text in intro_prose:
        ph = para(c, p_text, M, yy, split_x - M - 28, 9.2, HexColor("#E5F0F6"), "Inter", leading=13.2)
        yy -= ph + 9

    # Bottom info bar (rhythm + prep)
    c.hline(M, 104, split_x - M - 28, HexColor("#355670"), 0.65)
    rhythm_lbl = "РИТМ ЗАНЯТИЯ (3 ЧАСА)" if lang == "ru" else "SESSION RHYTHM (3 HOURS)"
    prep_lbl = "ПОДГОТОВКА И ИСТОЧНИКИ" if lang == "ru" else "PREPARATION & SOURCES"
    c.setFont("Inter-Bold", 7.0)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M, 90, rhythm_lbl)
    para(c, session_rhythm, M, 80, split_x - M - 28, 8.0, WHITE, "Inter", leading=10.5)
    c.setFont("Inter-Bold", 7.0)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M, 52, prep_lbl)
    para(c, reading_prep, M, 42, split_x - M - 28, 7.8, HexColor("#B9D2E2"), "Inter", leading=10.2)
    c.showPage()


def render_lesson_prose_slide(c, kicker, title, subtitle, prose_blocks, takeaway_title,
                              takeaway_text, photo, photo_label, photo_caption,
                              side_points_title, side_points, module_num=1):
    """Slide 2 & 3 of a lesson: Two-column layout with rich narrative lecture prose + thematic photo & analytical points."""
    accent = MODULE_COLORS.get(module_num, BLUE)
    top = c.start_slide(kicker=kicker)
    y = slide_title_block(c, title, subtitle, accent=accent, y=top)

    left_w = 486
    right_x = M + left_w + 24
    right_w = PAGE_W - M - right_x  # 338 pt

    # Left column: Narrative prose blocks
    yy = prose_paragraphs(c, prose_blocks, M, y - 2, left_w, size=9.2, gap=8, color=TEXT, leading=12.8)

    # Bottom-left takeaway box (anchored cleanly above footer)
    box_top = min(yy - 2, 118)
    box_bottom = 46
    box_h = max(box_top - box_bottom, 54)
    c.setFillColor(PANEL2)
    c.roundRect(M, box_bottom, left_w, box_h, 6, stroke=0, fill=1)
    c.vrect(M, box_bottom, 3.5, box_h, accent)
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(accent)
    c.drawString(M + 14, box_bottom + box_h - 14, takeaway_title.upper())
    para(c, takeaway_text, M + 14, box_bottom + box_h - 18, left_w - 26, 8.5, TEXT, "Inter-Italic", leading=11.5)

    # Right column: Thematic photo card on top + structured analytical points card below
    photo_card_h = 192
    draw_photo_card(c, photo, right_x, y - 2, right_w, photo_card_h,
                    label=photo_label, caption=photo_caption, accent=accent)

    card_top = y - 2 - photo_card_h - 10
    card_bottom = 46
    card_h = card_top - card_bottom
    c.setFillColor(PANEL)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    c.roundRect(right_x, card_bottom, right_w, card_h, 6, stroke=1, fill=1)
    c.vrect(right_x, card_bottom, 3, card_h, accent)
    c.setFont("Inter-Bold", 8.0)
    c.setFillColor(accent)
    c.drawString(right_x + 14, card_top - 16, side_points_title.upper())
    bullets_block(c, side_points, right_x + 14, card_top - 24, right_w - 26,
                  size=8.3, gap=5, color=TEXT, bullet_color=accent, leading=1.24)
    c.showPage()


def render_lesson_cases_slide(c, kicker, title, subtitle, cases_prose, photo,
                              photo_label, photo_caption, metrics_cards, module_num=1):
    """Slide 4 of a lesson: Deep dive into 2-3 flagship cases in narrative prose + thematic photo + key metrics."""
    accent = MODULE_COLORS.get(module_num, BLUE)
    top = c.start_slide(kicker=kicker)
    y = slide_title_block(c, title, subtitle, accent=accent, y=top)

    left_w = 496
    right_x = M + left_w + 22
    right_w = PAGE_W - M - right_x  # 330 pt

    # Left column: 2-3 case narrative cards
    yy = y - 2
    for case_title, case_meta, case_body in cases_prose:
        # Estimate height
        st_b = _style(8.7, TEXT, "Inter", 11.8)
        pb = Paragraph(case_body.replace("\n", "<br/>"), st_b)
        _, bh = pb.wrap(left_w - 28, 1000)
        card_h = bh + 36
        c.setFillColor(PANEL)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.roundRect(M, yy - card_h, left_w, card_h, 6, stroke=1, fill=1)
        c.vrect(M, yy - card_h, 3.5, card_h, accent)
        c.setFont("Inter-Bold", 9.5)
        c.setFillColor(NAVY)
        c.drawString(M + 14, yy - 16, case_title)
        c.setFont("Inter-Bold", 7.3)
        c.setFillColor(accent)
        c.drawRightString(M + left_w - 12, yy - 15, case_meta.upper())
        pb.drawOn(c, M + 14, yy - 24 - bh)
        yy -= card_h + 8

    # Right column: Thematic photo card + 2 metric highlight boxes
    photo_h = 210
    draw_photo_card(c, photo, right_x, y - 2, right_w, photo_h,
                    label=photo_label, caption=photo_caption, accent=accent)

    my = y - 2 - photo_h - 10
    for val, lbl, desc in metrics_cards:
        mh = 68
        c.setFillColor(PANEL2)
        c.roundRect(right_x, my - mh, right_w, mh, 6, stroke=0, fill=1)
        c.vrect(right_x, my - mh, 3, mh, RED if module_num == 5 else BLUE)
        c.setFont("Inter-XB", 16)
        c.setFillColor(NAVY)
        c.drawString(right_x + 12, my - 24, val)
        c.setFont("Inter-Bold", 8.3)
        c.setFillColor(accent)
        c.drawString(right_x + 12, my - 37, lbl.upper())
        para(c, desc, right_x + 12, my - 41, right_w - 24, 7.8, MUTED, "Inter", leading=10.0)
        my -= mh + 8

    c.showPage()


def render_lesson_seminar_slide(c, kicker, title, subtitle, question_title,
                                question_prose, rhythm_note, lab_title, lab_prose,
                                lab_steps, photo, photo_label, photo_caption, module_num=1):
    """Slide 5 of a lesson: Audience reflection question (5-min silent think) + Lab/Seminar exercise in prose + photo."""
    accent = MODULE_COLORS.get(module_num, BLUE)
    top = c.start_slide(kicker=kicker)
    y = slide_title_block(c, title, subtitle, accent=accent, y=top)

    left_w = 490
    right_x = M + left_w + 24
    right_w = PAGE_W - M - right_x

    # Top-left: Audience Reflection Question Box
    q_h = 136
    c.setFillColor(NAVY)
    c.roundRect(M, y - q_h, left_w, q_h, 7, stroke=0, fill=1)
    c.vrect(M, y - q_h, 4, q_h, RED)
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M + 16, y - 18, question_title.upper())
    qh = para(c, question_prose, M + 16, y - 24, left_w - 30, 9.2, WHITE, "Inter-Italic", leading=12.8)
    para(c, rhythm_note, M + 16, y - 30 - qh, left_w - 30, 7.9, HexColor("#B9D2E2"), "Inter", leading=10.6)

    # Bottom-left: Lab / Seminar Protocol in Prose
    lab_top = y - q_h - 12
    lab_bottom = 46
    lab_h = lab_top - lab_bottom
    c.setFillColor(PANEL)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    c.roundRect(M, lab_bottom, left_w, lab_h, 7, stroke=1, fill=1)
    c.vrect(M, lab_bottom, 3.5, lab_h, accent)
    c.setFont("Inter-Bold", 8.5)
    c.setFillColor(accent)
    c.drawString(M + 16, lab_top - 18, lab_title.upper())
    lph = para(c, lab_prose, M + 16, lab_top - 24, left_w - 30, 8.8, TEXT, "Inter", leading=12.0)
    bullets_block(c, lab_steps, M + 16, lab_top - 30 - lph, left_w - 30,
                  size=8.4, gap=4.5, color=TEXT, bullet_color=accent, leading=1.22)

    # Right column: Large thematic photo card
    draw_photo_card(c, photo, right_x, y, right_w, y - 46,
                    label=photo_label, caption=photo_caption, accent=accent)
    c.showPage()


def render_lesson_practice_slide(c, kicker, title, subtitle, milestone_badge,
                                 milestone_prose, deliverables, peer_review_prose,
                                 field_notes_prose, photo, photo_label, photo_caption,
                                 module_num=1, lang="ru"):
    """Slide 6 of a lesson: Practical assignment «My Venue» (milestone prose + deliverables) + Field Notes + photo."""
    accent = MODULE_COLORS.get(module_num, BLUE)
    top = c.start_slide(kicker=kicker)
    y = slide_title_block(c, title, subtitle, accent=accent, y=top)

    left_w = 496
    right_x = M + left_w + 22
    right_w = PAGE_W - M - right_x

    # Left top: Milestone narrative prose + checklist
    c.setFillColor(PANEL)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.55)
    main_h = 236
    c.roundRect(M, y - main_h, left_w, main_h, 7, stroke=1, fill=1)
    c.vrect(M, y - main_h, 4, main_h, accent)
    c.setFont("Inter-Bold", 8.2)
    c.setFillColor(accent)
    c.drawString(M + 16, y - 18, milestone_badge.upper())
    mph = para(c, milestone_prose, M + 16, y - 24, left_w - 30, 8.9, TEXT, "Inter", leading=12.2)
    deliv_lbl = "ЧТО ДОЛЖНО БЫТЬ НА СТРАНИЦЕ КОНЦЕПТА:" if lang == "ru" else "WHAT THE CONCEPT PAGE MUST INCLUDE:"
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(NAVY)
    c.drawString(M + 16, y - 34 - mph, deliv_lbl)
    bullets_block(c, deliverables, M + 16, y - 40 - mph, left_w - 30,
                  size=8.4, gap=4.5, color=TEXT, bullet_color=accent, leading=1.22)

    # Left bottom: Peer review + Field Notes box
    bot_top = y - main_h - 10
    bot_bottom = 46
    bot_h = bot_top - bot_bottom
    c.setFillColor(PANEL2)
    c.roundRect(M, bot_bottom, left_w, bot_h, 7, stroke=0, fill=1)
    c.vrect(M, bot_bottom, 3.5, bot_h, RED)
    pr_lbl = "ВЗАИМНАЯ РЕЦЕНЗИЯ И FIELD NOTES НЕДЕЛИ" if lang == "ru" else "PEER REVIEW & WEEKLY FIELD NOTES"
    c.setFont("Inter-Bold", 7.8)
    c.setFillColor(NAVY)
    c.drawString(M + 16, bot_top - 15, pr_lbl)
    prh = para(c, peer_review_prose, M + 16, bot_top - 20, left_w - 30, 8.3, TEXT, "Inter", leading=11.2)
    para(c, field_notes_prose, M + 16, bot_top - 24 - prh, left_w - 30, 8.1, MUTED, "Inter-Italic", leading=11.0)

    # Right column: Thematic photo card
    draw_photo_card(c, photo, right_x, y, right_w, y - 46,
                    label=photo_label, caption=photo_caption, accent=accent)
    c.showPage()
