# -*- coding: utf-8 -*-
"""EN slide deck: Contemporary HoReCa Scene — course proposal for Hotel Institute Montreux."""
from deck_lib import *

def std(c):
    c.bg(); c.header(""); c.footer()
    return CONTENT_TOP

def build(c):
    # ================= 1. COVER =================
    c.bg()
    # frame
    c.setStrokeColor(GOLD); c.setLineWidth(1.1)
    c.rect(18, 18, PAGE_W - 36, PAGE_H - 36, stroke=1, fill=0)
    c.setStrokeColor(LINE); c.setLineWidth(0.6)
    c.rect(24, 24, PAGE_W - 48, PAGE_H - 48, stroke=1, fill=0)
    c.setFont("Inter-Bold", 8.5)
    c.setFillColor(GOLD)
    c.drawString(M + 6, PAGE_H - 78, spaced("Course Proposal · Hotel Institute Montreux · Academic Year 2026–27"))
    c.setFont("Inter-XB", 46)
    c.setFillColor(TEXT)
    c.drawString(M + 6, PAGE_H - 172, "CONTEMPORARY")
    c.drawString(M + 6, PAGE_H - 224, "HORECA SCENE")
    c.vrect(M + 8, PAGE_H - 258, 92, 4, GOLD)
    para(c, "Trends  ·  Design & Atmosphere  ·  Neurogastronomy  ·  Technology  ·  World's Best Restaurants & Bars",
         M + 6, PAGE_H - 272, PAGE_W - 2 * M, 13.5, GOLD_SOFT, "Inter-Medium", leading=19)
    para(c, "A 12-week elective module that reads the global hospitality industry through its rankings, venues,\npeople and technologies — built for the next generation of hospitality leaders.",
         M + 6, PAGE_H - 302, 640, 10.5, MUTED, leading=15)
    c.hline(M + 6, 128, PAGE_W - 2 * M - 12)
    c.setFont("Inter-Bold", 9)
    c.setFillColor(TEXT)
    c.drawString(M + 6, 104, "AUTHOR & COURSE LEADER")
    c.setFont("Inter-XB", 15)
    c.drawString(M + 6, 84, "Egor Tarasenko")
    c.setFont("Inter", 9.5)
    c.setFillColor(MUTED)
    c.drawString(M + 6, 68, "Master in Business Management — Hotel Institute Montreux Alumnus")
    c.setFont("Inter", 9.5)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_W - M - 6, 84, "Montreux · 2026")
    c.drawRightString(PAGE_W - M - 6, 68, "12 weeks · 36 contact hours · English")
    c.showPage()

    # ================= 2. WHY NOW =================
    top = std(c)
    y = slide_title_block(c, "Why this course — and why now", "The global scene is moving faster than the curriculum")
    para(c, "“The world's best hospitality is being redefined right now — in Lima, Hong Kong, Dubai, Oslo and São Paulo.\nThis course brings the frontier into the classroom.”",
         M, y - 8, PAGE_W - 2 * M, 16.5, GOLD_SOFT, "Inter-Italic", leading=24)
    cards_grid(c, [
        ("№ 1", "Bar Leone, Hong Kong", "First Asian bar ever crowned The World's Best Bar (2025)"),
        ("№ 1", "Maido, Lima", "World's Best Restaurant 2025 — Latin America leads the table"),
        ("51", "countries at World Class", "Global bartending finals 2025, Toronto — won by Norway"),
        ("$2M", "projected impact", "50 Best week in Lima, Nov 2026 — rankings drive tourism"),
    ], M, y - 86, PAGE_W - 2 * M, card_h=96, cols=4, gap=13)
    bullets_block(c, [
        "Rankings (Michelin, The 50 Best, GreatList) have become industry infrastructure: they move tourism, investment and careers.",
        "Technology — from AI-generated serves to revenue management — is reshaping operations and creativity at the same time.",
        "Students need a live map of the industry: this course updates every year with the latest lists, ceremonies and case venues.",
    ], M, y - 214, PAGE_W - 2 * M, size=10.5, gap=11)
    c.showPage()

    # ================= 3. ABOUT THE AUTHOR =================
    top = std(c)
    y = slide_title_block(c, "About the author", "An alumnus proposal — giving back to the institute")
    c.setFillColor(PANEL)
    c.roundRect(M, y - 292, 300, 292, 8, stroke=0, fill=1)
    c.setStrokeColor(GOLD); c.setLineWidth(1.2)
    c.roundRect(M, y - 292, 300, 292, 8, stroke=1, fill=0)
    c.setFillColor(PANEL2)
    c.roundRect(M + 78, y - 56 - 132, 144, 132, 70, stroke=0, fill=1)
    c.setFillColor(GOLD)
    c.setFont("Inter-XB", 34)
    c.drawCentredString(M + 150, y - 148, "ET")
    c.setFillColor(TEXT)
    c.setFont("Inter-XB", 17)
    c.drawCentredString(M + 150, y - 212, "Egor Tarasenko")
    c.setFillColor(GOLD)
    c.setFont("Inter-Bold", 8.5)
    c.drawCentredString(M + 150, y - 230, spaced("Author & Course Leader"))
    c.setFillColor(MUTED)
    c.setFont("Inter", 9)
    c.drawCentredString(M + 150, y - 250, "Master in Business Management")
    c.drawCentredString(M + 150, y - 264, "Hotel Institute Montreux · Alumnus")
    X = M + 340
    bullets_block(c, [
        ("Graduate of the Master in Business Management programme at Hotel Institute Montreux.",
         "The course is designed as an alumnus contribution: a bridge between HIM's Swiss hospitality tradition and today's global scene."),
        ("Focus: strategy, brand and economics of contemporary restaurants and bars.",
         "From concept and atmosphere engineering to unit economics and ranking strategy."),
        ("Built on primary industry sources, refreshed annually.",
         "MICHELIN Guide ceremonies, The 50 Best rankings and stories, GreatList expert reviews, Diageo World Class programmes."),
        ("Delivery: lectures + case labs + sensory practice + guest speakers.",
         "Industry practitioners join live or online; students work with real lists and real venues."),
    ], X, y, PAGE_W - M - X, size=10.5, gap=14)
    c.showPage()

    # ================= 4. COURSE AT A GLANCE =================
    top = std(c)
    y = slide_title_block(c, "Course at a glance", "One elective — a full tour of the contemporary scene")
    cards_grid(c, [
        ("12", "weeks", "Semester elective, weeks 1–12 of the term"),
        ("36", "contact hours", "12 sessions × 3 hours: lecture + case + lab"),
        ("5+1", "modules", "Five thematic modules and a final pitch day"),
        ("EN", "language", "English; key sources and guest speakers"),
        ("BBA · MIB", "audience", "Bachelor and master students of hospitality & business"),
        ("4", "assessment blocks", "Participation, field notes, module tasks, final pitch"),
    ], M, y - 6, PAGE_W - 2 * M, card_h=98, cols=3, gap=14)
    para(c, "Positioning: a business-perspective tour of the contemporary HoReCa scene — what the world's best venues do,\nwhy guests love them, and how rankings, design, science and technology create competitive advantage.",
         M, y - 252, PAGE_W - 2 * M, 10.5, MUTED, "Inter-Italic", leading=15)
    c.showPage()

    # ================= 5. LEARNING OUTCOMES =================
    top = std(c)
    y = slide_title_block(c, "Learning outcomes", "What students will be able to do after 12 weeks")
    outs = [
        ("Navigate the global ranking ecosystem", "Michelin, The 50 Best, GreatList, World Class — how they work and how to use them in marketing and strategy."),
        ("Analyse HoReCa trends", "Turn macro-trends — experience economy, anti-luxury, mindfulness — into concrete business decisions."),
        ("Design venue concepts", "Interior, light, sound, scent and guest journey (CJM) — atmosphere as a managed product."),
        ("Apply neurogastronomy", "Multisensory design of menus, serves and service: from plate weight to sound pairing."),
        ("Evaluate technology & AI", "Reservations, revenue management, kitchen automation, data personalisation — with an ethics filter."),
        ("Pitch at world level", "Develop and defend a venue concept benchmarked against the world's best bars and restaurants."),
    ]
    colw = (PAGE_W - 2 * M - 24) / 2
    yy = y
    for i, (h, b) in enumerate(outs):
        col = i % 2
        if col == 0 and i > 0:
            yy -= 104
        x = M + col * (colw + 24)
        ypos = yy if col == 0 else yy
        c.setFillColor(PANEL)
        c.roundRect(x, ypos - 92, colw, 92, 6, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.setFont("Inter-XB", 26)
        c.drawString(x + 14, ypos - 40, f"0{i+1}")
        c.setFillColor(TEXT)
        c.setFont("Inter-Bold", 11)
        c.drawString(x + 62, ypos - 30, h)
        para(c, b, x + 62, ypos - 42, colw - 80, 9.3, MUTED, leading=12.5)
    c.showPage()

    # ================= 6. COURSE MAP =================
    top = std(c)
    y = slide_title_block(c, "Course map", "Five modules, one arc: from trends to a world-class concept")
    rows = [
        ["#", "Module", "Weeks", "Core question", "Signature cases"],
        ["1", "Contemporary HoReCa Trends", "1–3", "Where is the industry heading?", "50 Best week in Lima; Californios ★★★; Gerbou"],
        ["2", "Venue Design & Atmosphere", "4–5", "What makes a space unforgettable?", "GreatList criteria; Himkok; Hanu Dubai"],
        ["3", "Neurogastronomy & Guest Experience", "6–7", "How do senses shape taste?", "Spence's gastrophysics; World Class multisensory"],
        ["4", "Technology & Automation", "8–9", "What should be human, what — smart?", "AI-inspired serve (Don Julio 1942); Sesto Senso Academy"],
        ["5", "World's Leading Restaurants & Bars", "10–12", "Who sets the global standard?", "Maido; Bar Leone; Myojaku; Felice Capasso"],
        ["+", "Final Pitch Day", "12", "Can your venue win the world stage?", "Student concepts judged by an expert panel"],
    ]
    make_table(c, rows, M, y - 4, [34, 258, 62, 216, 278], row_h=44, header_h=26, font_size=9.3)
    c.showPage()

    # ================= MODULE SLIDES helper =================
    def module_slide(num, weeks, title, sub, topics, cases, question):
        top = std(c)
        accent = MODULE_COLORS[num]
        y = CONTENT_TOP
        c.vrect(M, y - 34, 4, 40, accent)
        c.setFillColor(accent)
        c.setFont("Inter-XB", 11)
        c.drawString(M + 16, y - 8, spaced(f"Module {num} · Weeks {weeks}"))
        c.setFillColor(TEXT)
        c.setFont("Inter-XB", 23)
        c.drawString(M + 16, y - 32, title)
        c.setFont("Inter", 10)
        c.setFillColor(MUTED)
        c.drawString(M + 16, y - 50, sub)
        c.setFont("Inter-Bold", 9)
        c.setFillColor(accent)
        c.drawString(M, y - 84, "TOPICS")
        bullets_block(c, topics, M, y - 104, 480, size=10, gap=8)
        X2 = M + 520; W2 = PAGE_W - M - X2
        c.setFillColor(PANEL)
        c.roundRect(X2, y - 318, W2, 254, 8, stroke=0, fill=1)
        c.vrect(X2, y - 318, 3, 254, accent)
        c.setFillColor(accent)
        c.setFont("Inter-Bold", 9)
        c.drawString(X2 + 18, y - 84, "CASES & FIELD MATERIAL")
        bullets_block(c, cases, X2 + 18, y - 104, W2 - 36, size=9.3, gap=9, color=TEXT, bullet_color=accent)
        c.setFillColor(PANEL2)
        c.roundRect(X2, y - 396, W2, 66, 8, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.setFont("Inter-Bold", 8.5)
        c.drawString(X2 + 18, y - 344, "KEY QUESTION")
        para(c, question, X2 + 18, y - 358, W2 - 36, 10.5, TEXT, "Inter-Italic", leading=14)
        c.showPage()

    # ================= 7. MODULE 1 =================
    module_slide(1, "1–3", "Contemporary HoReCa Trends",
        "Lecture seminars: reading the industry's present and near future",
        [
            "Experience economy: dining as theatre — chef's tables, counters, storytelling formats.",
            "Anti-luxury & casualization: «cocktail popolari» — refinement without pretension.",
            "From sustainability to mindfulness: the Green Star evolves into Michelin's «Mindful Voices».",
            "Regional cuisines go global: Californios — the world's first three-star Mexican restaurant.",
            "Gastronomy tourism & city branding: 50 Best week brings ~$2M of spending to Lima.",
            "New gravity: Asia, the Middle East and Latin America lead the rankings.",
            "Hotel F&B renaissance: hotel bars and dining rooms back on the world lists.",
        ],
        [
            "The 50 Best Restaurants 2026 ceremony — Lima, 4 Nov 2026: the course follows it live.",
            "Tuju (São Paulo) — Art of Hospitality 2026: fewer guests, menus themed around climate.",
            "Gerbou (Dubai) — Prix Versailles 2025 for architecture; Emirati cuisine as fine dining.",
        ],
        "If a venue opens today, which trends will still matter in 2030?")

    # ================= 8. MODULE 2 =================
    module_slide(2, "4–5", "Venue Design & Atmosphere",
        "Concept, architecture, interiors, senses — atmosphere as an engineered product",
        [
            "Concept & narrative: the venue as a story guests retell.",
            "Space & ergonomics: layout, flow, comfort — a GreatList selection criterion.",
            "Light, acoustics, scent: the invisible layers of hospitality.",
            "Tableware & tactile design: weight, texture, temperature.",
            "Service choreography: rhythm of the evening, «invisible» service.",
            "Design awards as industry signal: Prix Versailles, Best Bar Design.",
            "Practice: atmosphere audit of Montreux venues against expert criteria.",
        ],
        [
            "GreatList criteria: design & ergonomics; atmosphere «from scent to music»; full guest CJM.",
            "Himkok (Oslo) — Best Bar Design: a sustainable reimagining of a 200-year-old space.",
            "Hanu (Dubai) — Seoul aesthetics: charcoal grills, dark wood, bronze doors.",
        ],
        "Can atmosphere be measured — and can it be managed like a P&L line?")

    # ================= 9. MODULE 3 =================
    module_slide(3, "6–7", "Neurogastronomy & Guest Experience",
        "How the brain eats: multisensory science for menus, serves and service",
        [
            "Gastrophysics basics: crossmodal correspondences (Spence, Oxford).",
            "Sound & taste: sonic seasoning; music changes perceived flavour.",
            "Colour, shape and weight of tableware; plating geometry.",
            "Menu psychology: naming, layout, price anchors, choice architecture.",
            "Memory & emotion: hospitality that creates «Proust moments».",
            "Peak-end rule: designing the guest journey's strongest moments.",
            "Sensory lab: a guided tasting with controlled variables.",
        ],
        [
            "World Class 2025: The Singleton multisensory challenge — cocktail «Between Us» with a custom record sleeve for «That's Amore».",
            "Tuju: radical personalisation — reading glasses, children's drawing kit, menus of rain and wind.",
            "Bar Leone: simplicity as a sensory strategy — «cocktails for the people».",
        ],
        "What does your venue taste like — before the first bite is served?")

    # ================= 10. MODULE 4 =================
    module_slide(4, "8–9", "Technology & Automation",
        "What should remain human — and what should be smart",
        [
            "Reservations & waitlist systems; dynamic pricing; revenue management.",
            "Kitchen & floor automation: robotics, KDS, inventory, waste control.",
            "Data & CRM: personalisation at the level of a regular guest.",
            "AI in creativity: concept art, menu R&D, content — and its limits.",
            "Delivery, dark kitchens and omnichannel models.",
            "Education tech: academies of spirits & wine (Sesto Senso).",
            "Ethics & future of work: humane workplaces in a high-pressure industry.",
        ],
        [
            "World Class 2025: Don Julio 1942 challenge — a serve created from an original AI artwork.",
            "Felice Capasso: Sesto Senso Academy — bartender education as a business model.",
            "50 Best «war room»: how rankings themselves use data, voting and media technology.",
        ],
        "Where does technology amplify hospitality — and where does it kill it?")

    # ================= 11. MODULE 5 =================
    module_slide(5, "10–12", "World's Leading Restaurants & Bars",
        "Deep dives into the institutions and venues setting the global standard",
        [
            "MICHELIN anatomy: stars, Bib Gourmand, special awards, inspector method.",
            "The 50 Best Academy: who votes, how lists change markets.",
            "Bar scene: World's 50 Best Bars, hotel bars, speakeasies.",
            "World Class: 16 seasons, 450,000+ bartenders, «drink better, not more».",
            "Regional scenes: Europe · Asia · Americas · Middle East.",
            "GreatList geography: Moscow — Dubai — Doha — Bangkok — Shanghai.",
            "Final pitch: student concepts vs world benchmarks.",
        ],
        [
            "Maido (Lima) — World's №1 Restaurant 2025; four Lima venues in the top 50.",
            "Bar Leone (Hong Kong) — World's Best Bar 2025, first Asian №1, two years after opening.",
            "Myojaku (Tokyo) — promoted to Three MICHELIN Stars in the 2026 guide.",
        ],
        "What do all №1 venues share — and can it be taught?")

    # ================= 12. RANKING ECOSYSTEM =================
    top = std(c)
    y = slide_title_block(c, "The ranking ecosystem", "Four institutions the course is built on — and how they differ")
    rows = [
        ["Institution", "What it evaluates", "Method", "Status 2026"],
        ["MICHELIN Guide", "Cuisine quality & consistency", "Anonymous inspectors; ★–★★★, Bib Gourmand, Green Star, special awards",
         "City & country guides worldwide; 2026 reveals: Tokyo, California, Toronto"],
        ["The 50 Best (The 50)", "Restaurants & bars as experiences", "Anonymous global academy; restaurants — 8 best experiences; bars — 600+ experts, 7 votes each",
         "Restaurant ceremony: Lima, 4 Nov 2026; Bars 2026: 51–100 already revealed"],
        ["GreatList", "Best restaurants of global cities", "100+ experts, anonymous visits, self-paid bills; criteria: food, service CJM, design, atmosphere",
         "Russia, UAE, Qatar, Thailand, China; Singapore & Seoul coming soon"],
        ["Diageo World Class", "Bartending craft & innovation", "National finals → global finals; 51 countries in 2025; expert jury of venue owners",
         "16th season; winner 2025: Felice Capasso (Norway)"],
    ]
    make_table(c, rows, M, y - 2, [128, 188, 300, 232], row_h=64, header_h=24, font_size=8.8)
    c.showPage()

    # ================= 13. CASE: 50 BEST RESTAURANTS =================
    top = std(c)
    y = slide_title_block(c, "Case: The World's 50 Best Restaurants", "Revealed in Turin, June 2025 — next chapter: Lima, 4 November 2026")
    rows = [
        ["#", "Restaurant", "City", "#", "Restaurant", "City"],
        ["1", "Maido", "Lima", "6", "Gaggan", "Bangkok"],
        ["2", "Asador Etxebarri", "Atxondo", "7", "Sézanne", "Tokyo"],
        ["3", "Quintonil", "Mexico City", "8", "Table by Bruno Verjus", "Paris"],
        ["4", "DiverXO", "Madrid", "9", "Kjolle", "Lima"],
        ["5", "Alchemist", "Copenhagen", "10", "Don Julio", "Buenos Aires"],
    ]
    make_table(c, rows, M, y - 2, [34, 250, 150, 34, 250, 130], row_h=26, header_h=22, font_size=9.5)
    bullets_block(c, [
        "Latin America sets the tone: №1 and №3, plus four Lima venues in the top 50.",
        "Voters receive no formal criteria — they name their eight best experiences of the year.",
        "2026 Art of Hospitality Award: Tuju (São Paulo) — service as radical personalisation.",
        "Class use: students predict the 2026 list before the Lima ceremony, then score themselves.",
    ], M, y - 186, PAGE_W - 2 * M, size=10, gap=9)
    c.showPage()

    # ================= 14. CASE: MICHELIN =================
    top = std(c)
    y = slide_title_block(c, "Case: The MICHELIN Guide", "From tyre-maker's guide to the industry's most cited rating")
    X = M; W = 440
    bullets_block(c, [
        ("The star anatomy.", "★ — very good cuisine; ★★ — worth a detour; ★★★ — worth a special journey; plus Bib Gourmand and special awards (Service, Sommelier, Young Chef)."),
        ("Tokyo 2026.", "Myojaku promoted to Three Stars; 18 new stars; Service and Sommelier awards — the world's deepest starred scene."),
        ("California 2026.", "Californios becomes the first Mexican restaurant in the world with Three Stars."),
    ], X, y - 4, W, size=10, gap=11)
    X2 = M + 480; W2 = PAGE_W - M - X2
    bullets_block(c, [
        ("Toronto 2026.", "Restaurant Pearl Morissette retains two stars — Canada's benchmark."),
        ("Sustainability in motion.", "Green Star transitions into the «Mindful Voices» initiative — pioneers of new gastronomy."),
        ("The Moscow page.", "Debut 2021: first stars in Russia & CIS history; guide suspended in 2022 — a case study in rankings and geopolitics."),
    ], X2, y - 4, W2, size=10, gap=11)
    c.showPage()

    # ================= 15. CASE: 50 BEST BARS =================
    top = std(c)
    y = slide_title_block(c, "Case: The World's 50 Best Bars 2025", "Ceremony in Hong Kong: for the first time, №1 goes to Asia")
    rows = [
        ["#", "Bar", "City", "#", "Bar", "City"],
        ["1", "Bar Leone", "Hong Kong", "6", "Connaught Bar", "London"],
        ["2", "Handshake Speakeasy", "Mexico City", "7", "Moebius Milano", "Milan"],
        ["3", "Sips", "Barcelona", "8", "Line", "Athens"],
        ["4", "Paradiso", "Barcelona", "9", "Jigger & Pony", "Singapore"],
        ["5", "Tayēr + Elementary", "London", "10", "Tres Monos", "Buenos Aires"],
    ]
    make_table(c, rows, M, y - 2, [34, 250, 150, 34, 250, 130], row_h=26, header_h=22, font_size=9.5)
    bullets_block(c, [
        "Bar Leone: №1 only two years after opening — «cocktail popolari», classics without pretension.",
        "Best Bar Design: Himkok (Oslo) — sustainable reimagining of a 200-year-old space.",
        "Sustainable Bar: The Cambridge Public House (Paris); first-ever Best Bar in Africa (Hero Bar, Nairobi) and Middle East (Mimi Kakushi, Dubai).",
    ], M, y - 186, PAGE_W - 2 * M, size=10, gap=9)
    c.showPage()

    # ================= 16. CASES: WORLD CLASS + GREATLIST =================
    top = std(c)
    y = slide_title_block(c, "Cases: Diageo World Class & GreatList", "People and expertise behind the headlines")
    X = M; W = (PAGE_W - 2 * M - 26) / 2
    c.setFillColor(PANEL); c.roundRect(X, y - 268, W, 268, 8, stroke=0, fill=1)
    c.vrect(X, y - 268, 3, 268, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X + 16, y - 24, "DIAGEO WORLD CLASS 2025 · TORONTO")
    bullets_block(c, [
        "Winner: Felice Capasso (Norway) — Nedre Løkka Cocktailbar, Oslo; founder of Sesto Senso Academy.",
        "Challenges: reimagined classics with Johnnie Walker Black Label; Don Julio 1942 serve inspired by AI artwork; multisensory Singleton serve.",
        "Jury: Eric Van Beek (Handshake Speakeasy), Monica Berg (Tayēr + Elementary), Ago Perrone (Connaught Bar).",
        "Mission: «drink better, not more» — 450,000+ bartenders trained.",
    ], X + 16, y - 44, W - 34, size=9.2, gap=8)
    X2 = M + W + 26
    c.setFillColor(PANEL); c.roundRect(X2, y - 268, W, 268, 8, stroke=0, fill=1)
    c.vrect(X2, y - 268, 3, 268, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X2 + 16, y - 24, "GREATLIST · INTERNATIONAL RESTAURANT GUIDE")
    bullets_block(c, [
        "Founded 2022; 100+ experts; anonymous visits, self-paid bills, repeat visits at different hours.",
        "Criteria: food & chef imagination; service across the full CJM; design & ergonomics; atmosphere — from scent to music.",
        "Geography: Moscow, St. Petersburg, Yekaterinburg, Kazan, Nizhny Novgorod, Russian Far East, Dubai, Doha, Bangkok, Hong Kong, Shanghai (+ Singapore & Seoul soon).",
        "GreatList Sessions 2025: guest dinners by world chefs — a format for field study.",
    ], X2 + 16, y - 44, W - 34, size=9.2, gap=8)
    c.showPage()

    # ================= 17. METHODOLOGY =================
    top = std(c)
    y = slide_title_block(c, "Teaching methodology", "Every session: 45' lecture · 75' cases · 60' practice — plus the through-project «My Venue»")
    items = [
        ("Case method on live venues", "Maido, Bar Leone, Tuju, Himkok, Hanu — dissected as business systems: concept, economics, guest journey."),
        ("Sensory labs", "Guided tastings testing neurogastronomy hypotheses: light, sound, weight, naming."),
        ("Atmosphere audits", "Field teams evaluate Montreux & Riviera venues against GreatList-style criteria and present findings."),
        ("Guest speakers", "Chefs, bartenders, restaurateurs and ranking experts — live or online, from the course's industry network."),
        ("Rankings war room", "Real-time analysis of new lists — including the Lima ceremony of 4 November 2026."),
        ("Peer review culture", "Week-1 «favourite venue» talk sets the bar; every «My Venue» page is reviewed by a partner before it reaches the lecturer."),
    ]
    colw = (PAGE_W - 2 * M - 24) / 2
    yy = y
    for i, (h, b) in enumerate(items):
        col = i % 2
        if col == 0 and i > 0:
            yy -= 98
        x = M + col * (colw + 24)
        c.setFillColor(PANEL)
        c.roundRect(x, yy - 86, colw, 86, 6, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.circle(x + 26, yy - 30, 13, stroke=0, fill=1)
        c.setFillColor(BG)
        c.setFont("Inter-XB", 12)
        c.drawCentredString(x + 26, yy - 34, str(i + 1))
        c.setFillColor(TEXT)
        c.setFont("Inter-Bold", 10.5)
        c.drawString(x + 50, yy - 26, h)
        para(c, b, x + 50, yy - 38, colw - 66, 9.2, MUTED, leading=12.3)
    c.showPage()

    # ================= 17b. PRACTICAL CORE =================
    top = std(c)
    y = slide_title_block(c, "Practical core: «My Venue»", "Every student builds their own bar or restaurant — from idea to «open & operate»")
    c.setFillColor(PANEL)
    c.roundRect(M, y - 64, PAGE_W - 2 * M, 58, 8, stroke=0, fill=1)
    c.vrect(M, y - 64, 3, 58, GOLD)
    c.setFillColor(GOLD)
    c.setFont("Inter-Bold", 9)
    c.drawString(M + 16, y - 24, "WEEK 1 · ASSIGNMENT 0")
    para(c, "Each student presents their favourite bar or restaurant (5 min) through the course's four lenses — trends, design & atmosphere, senses, rankings. One change they would make as the owner.",
         M + 16, y - 36, PAGE_W - 2 * M - 34, 9.6, TEXT, leading=13)
    rows = [
        ["Wk", "Milestone of the student's own concept", "Wk", "Milestone of the student's own concept"],
        ["2", "Concept & USP; three world benchmarks", "8", "Operations & technology: service model, stack, human line"],
        ["3", "Trend memo: which trends the concept rides", "9", "AI & ethics page of the concept"],
        ["4", "Design & narrative: interior «three scenes», zoning", "10", "Marketing I: guest shifts & residencies, alcohol-brand partnerships, 90-day launch"],
        ["5", "Atmosphere spec + audit of a real Montreux venue", "11", "Marketing II: 3-year roadmap to a chosen guide or list"],
        ["6", "Three signature serves built on sensory effects", "12", "Final pitch «Open & Operate» before an expert panel"],
        ["7", "Menu architecture, pricing, an A/B test", "", ""],
    ]
    make_table(c, rows, M, y - 78, [36, 390, 36, 386], row_h=34, header_h=22, font_size=8.9)
    para(c, "Format: one A4 page or two slides added every week; peer-reviewed in pairs. The folder of 11 pages becomes the final concept deck.",
         M, y - 348, PAGE_W - 2 * M, 9.5, MUTED, "Inter-Italic", leading=13)
    c.showPage()

    # ================= 18. ASSESSMENT =================
    top = std(c)
    y = slide_title_block(c, "Assessment", "Continuous, practice-based, industry-style")
    rows = [
        ["Component", "Weight", "What students do"],
        ["Assignment 0 & participation", "10%", "Week-1 «favourite venue» talk; case discussions, war-room sessions"],
        ["Field Notes (weekly)", "15%", "One-page weekly reviews: a venue visit, a ranking change, an industry article"],
        ["«My Venue» weekly milestones", "35%", "Eleven weekly pages of the student's own concept; peer-reviewed"],
        ["Final pitch «Open & Operate»", "40%", "Full concept deck defended before an expert panel"],
    ]
    make_table(c, rows, M, y - 2, [232, 70, 546], row_h=52, header_h=26, font_size=9.6)
    para(c, "Grading follows HIM regulations. Late work policy and AI-use disclosure follow the institute's academic integrity rules.",
         M, y - 246, PAGE_W - 2 * M, 9, MUTED, "Inter-Italic", leading=12)
    c.showPage()

    # ================= 19. FINAL PROJECT =================
    top = std(c)
    y = slide_title_block(c, "Final pitch: «Open & Operate»", "Each student's own venue: restaurant, bar, hotel F&B, pop-up — ready to open")
    steps = [
        ("01", "USP & story", "One-sentence USP, audience, price point — why the world should care."),
        ("02", "Design & atmosphere", "Concept board: interior, light, sound, scent, tableware — managed senses."),
        ("03", "Menu, beverage & operations", "Neurogastronomy-backed serves; service model, tech stack, unit-economics sketch."),
        ("04", "Marketing engine", "Guest shifts & chef residencies (GreatList Sessions model); alcohol-brand partnerships (World Class formats); 90-day launch plan."),
        ("05", "Roadmap to recognition", "One target guide or list — and a 3-year plan to earn it."),
    ]
    colw = (PAGE_W - 2 * M - 4 * 12) / 5
    for i, (n, h, b) in enumerate(steps):
        x = M + i * (colw + 12)
        c.setFillColor(PANEL)
        c.roundRect(x, y - 172, colw, 172, 6, stroke=0, fill=1)
        c.vrect(x, y - 172, colw, 4, GOLD)
        c.setFillColor(GOLD)
        c.setFont("Inter-XB", 22)
        c.drawString(x + 14, y - 40, n)
        c.setFillColor(TEXT)
        c.setFont("Inter-Bold", 10.5)
        para(c, h.upper(), x + 14, y - 54, colw - 28, 10.5, TEXT, "Inter-Bold", leading=13.5)
        para(c, b, x + 14, y - 86, colw - 28, 9, MUTED, leading=12.2)
    para(c, "The panel includes invited industry professionals. The strongest concept is recommended for HIM student hospitality competitions and accelerator formats.",
         M, y - 208, PAGE_W - 2 * M, 10, GOLD_SOFT, "Inter-Italic", leading=14)
    c.showPage()

    # ================= 20. HIM INTEGRATION & RESOURCES =================
    top = std(c)
    y = slide_title_block(c, "Fit with HIM & resources", "The course extends the institute's ecosystem, not duplicates it")
    X = M; W = (PAGE_W - 2 * M - 26) / 2
    c.setFillColor(PANEL); c.roundRect(X, y - 272, W, 272, 8, stroke=0, fill=1)
    c.vrect(X, y - 272, 3, 272, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X + 16, y - 24, "INTEGRATION WITH HIM")
    bullets_block(c, [
        "Swiss hospitality tradition meets the global scene — the same duality HIM stands for.",
        "Montreux Jazz Festival field module: festival F&B operations (HIM's long-standing partner).",
        "Connects to existing curriculum: marketing, revenue management, innovation, luxury business.",
        "Career bridge: students learn what world-class venues look for in managers and interns.",
    ], X + 16, y - 44, W - 34, size=9.4, gap=9)
    X2 = M + W + 26
    c.setFillColor(PANEL); c.roundRect(X2, y - 272, W, 272, 8, stroke=0, fill=1)
    c.vrect(X2, y - 272, 3, 272, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X2 + 16, y - 24, "COURSE RESOURCES")
    bullets_block(c, [
        "Live data: MICHELIN Guide reveals, The 50 rankings & stories, GreatList encyclopedia, World Class materials.",
        "Reading list: Guidara «Unreasonable Hospitality»; Meyer «Setting the Table»; Spence «Gastrophysics»; Pine & Gilmore «The Experience Economy».",
        "Video: The 50 films and Talks; ceremony livestreams.",
        "Guest network: alumni and industry contacts of the course author.",
    ], X2 + 16, y - 44, W - 34, size=9.4, gap=9)
    c.showPage()

    # ================= 21. WEEK-BY-WEEK =================
    top = std(c)
    y = slide_title_block(c, "Week-by-week plan", "12 sessions · Thursdays 13:15–16:30 format (adjustable to HIM timetable)")
    rows = [
        ["Wk", "Session"],
        ["1", "Introduction. Anatomy of contemporary HoReCa. Rankings as industry infrastructure."],
        ["2", "Macro-trends I: experience economy, anti-luxury, casualization of fine dining."],
        ["3", "Macro-trends II: mindfulness, regional cuisines go global, gastro-tourism & city branding."],
        ["4", "Venue design: concept, architecture, interior, ergonomics (Prix Versailles; GreatList criteria)."],
        ["5", "Engineering atmosphere: light, sound, scent, tableware, service choreography. Field audit briefing."],
        ["6", "Neurogastronomy I: multisensory perception, gastrophysics. Sensory lab."],
        ["7", "Neurogastronomy II: menu psychology, pricing, peak-end design. World Class multisensory case."],
        ["8", "Technology I: reservations, revenue management, kitchen & floor automation, CRM."],
        ["9", "Technology II: AI in creativity and operations; ethics and the future of hospitality work."],
        ["10", "World restaurants: MICHELIN & 50 Best deep dive; Europe · Asia · Americas · Middle East scenes."],
        ["11", "World bars: 50 Best Bars, World Class, hotel bars; Moscow–Dubai–Doha via GreatList."],
        ["12", "Final Pitch Day: «Your Venue on the World Stage». Course wrap-up."],
    ]
    make_table(c, rows, M, y - 2, [46, 802], row_h=25, header_h=22, font_size=9.2)
    c.showPage()

    # ================= 22. CLOSING =================
    c.bg()
    c.setStrokeColor(GOLD); c.setLineWidth(1.1)
    c.rect(18, 18, PAGE_W - 36, PAGE_H - 36, stroke=1, fill=0)
    c.setFont("Inter-Bold", 8.5)
    c.setFillColor(GOLD)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 120, spaced("Contemporary HoReCa Scene · Course Proposal"))
    para(c, "Let's bring the world's best\nhospitality to Montreux.", PAGE_W / 2 - 330, PAGE_H - 150, 660, 33, TEXT, "Inter-XB", leading=42, align=TA_CENTER)
    c.vrect(PAGE_W / 2 - 46, PAGE_H - 300, 92, 4, GOLD)
    c.setFont("Inter-XB", 16)
    c.setFillColor(TEXT)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 340, "Egor Tarasenko")
    c.setFont("Inter", 10)
    c.setFillColor(MUTED)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 360, "Author & Course Leader · Master in Business Management, Hotel Institute Montreux Alumnus")
    c.setFont("Inter", 9.5)
    c.setFillColor(GOLD_SOFT)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 388, "email · LinkedIn — to be added          Montreux, 2026")
    c.setFont("Inter", 8.5)
    c.setFillColor(MUTED)
    c.drawCentredString(PAGE_W / 2, 60, "Sources: MICHELIN Guide · The 50 Best (the50.com) · GreatList (greatlist.ru) · Diageo World Class (diageo.com)")
    c.showPage()
