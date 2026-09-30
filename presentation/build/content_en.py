# -*- coding: utf-8 -*-
"""EN slide deck: Contemporary Horeca Scene — course proposal for Hotel Institute Montreux."""
from deck_lib import *

def std(c, kicker="COURSE PROPOSAL · HOTEL INSTITUTE MONTREUX"):
    c.bg(); c.header(kicker); c.footer()
    return CONTENT_TOP

def build(c):
    # ================= 1. COVER =================
    course_cover(
        c,
        "Course Proposal · 2026–27",
        "Trends · Design & Atmosphere · Neurogastronomy · Technology · World's Best Restaurants & Bars · Budget & Scenography",
        "A 12-week elective that turns the global hospitality scene into a practical business lens — for the next generation of world-ready leaders.",
        "AUTHOR & COURSE LEADER",
        "Egor Tarasenko",
        "Master in Business Management — Hotel Institute Montreux Alumnus",
        "Montreux · 2026",
        "12 weeks · 36 contact hours · English",
        cover_photo=PHOTO_CHEFS_COUNTER,
    )

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
    y = slide_title_block(c, "About the author & course architecture", "A practical lens on strategy, concept design and venue economics")
    c.setFillColor(NAVY)
    c.roundRect(M, y - 292, 300, 292, 8, stroke=0, fill=1)
    draw_photo(c, PHOTO_CONCEPT_PITCH, M, y - 156, 300, 156, focus_x=0.5, focus_y=0.5)
    c.setFillColor(NAVY)
    c.roundRect(M, y - 292, 300, 136, 8, stroke=0, fill=1)
    c.vrect(M, y - 156, 300, 5, RED)
    c.setFont("Inter-Bold", 7.5)
    c.setFillColor(HexColor("#91CAE1"))
    c.drawString(M + 16, y - 179, "HIM ALUMNUS  ·  COURSE LEADER")
    c.setFont("Inter-XB", 17)
    c.setFillColor(WHITE)
    c.drawString(M + 16, y - 211, "Egor Tarasenko")
    c.setFont("Inter", 8.5)
    c.setFillColor(HexColor("#B9D2E2"))
    c.drawString(M + 16, y - 233, "Master in Business Management")
    c.drawString(M + 16, y - 249, "Hotel Institute Montreux")
    X = M + 340
    bullets_block(c, [
        ("Graduate of the Master in Business Management programme at Hotel Institute Montreux.",
         "The course is designed as an alumnus contribution: a bridge between Swiss hospitality management and today's global restaurant and bar scene."),
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
    para(c, "Positioning: a business-perspective tour of the contemporary Horeca scene — what the world's best venues do,\nwhy guests love them, and how rankings, design, science and technology create competitive advantage.",
         M, y - 252, PAGE_W - 2 * M, 10.5, MUTED, "Inter-Italic", leading=15)
    c.showPage()

    # ================= 5. LEARNING OUTCOMES =================
    top = std(c)
    y = slide_title_block(c, "Learning outcomes", "What students will be able to do after 12 weeks")
    outs = [
        ("Navigate the global ranking ecosystem", "Michelin, The 50 Best, GreatList, World Class — how they work and how to use them in marketing and strategy."),
        ("Analyse Horeca trends", "Turn macro-trends — experience economy, anti-luxury, mindfulness — into concrete business decisions."),
        ("Design venue concepts", "Interior, light, sound, scent and guest journey (CJM) — atmosphere as a managed product."),
        ("Apply culinary science & neurogastronomy", "Physics & chemistry of flavour, multisensory design of menus, serves and service: from plate weight to sound pairing."),
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
        c.setFillColor(PANEL)
        c.roundRect(x, yy - 92, colw, 92, 6, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.setFont("Inter-XB", 26)
        c.drawString(x + 14, yy - 40, f"0{i+1}")
        c.setFillColor(TEXT)
        c.setFont("Inter-Bold", 10.5)
        c.drawString(x + 62, yy - 30, h)
        para(c, b, x + 62, yy - 42, colw - 80, 9.2, MUTED, leading=12.4)
    c.showPage()

    # ================= 6. COURSE MAP =================
    top = std(c)
    y = slide_title_block(c, "Course map", "Six modules, one arc: from trends to a world-class concept you can build by hand")
    rows = [
        ["#", "Module", "Weeks", "Core question", "Signature cases"],
        ["1", "Contemporary Horeca Trends", "1–3", "Where is the industry heading?", "50 Best week in Lima; Californios ★★★; Gerbou"],
        ["2", "Venue Design & Atmosphere", "4–5", "What makes a space unforgettable?", "GreatList criteria; Himkok; Hanu Dubai"],
        ["3", "Neurogastronomy & Guest Experience", "6–7", "How do senses shape taste?", "Spence's gastrophysics; World Class multisensory"],
        ["4", "Technology & Automation", "8–9", "What should be human, what — smart?", "AI-inspired serve (Don Julio 1942); Sesto Senso Academy"],
        ["5", "World's Leading Restaurants & Bars", "10", "Who sets the global standard?", "Noma; Maido; Bar Leone; Myojaku; Felice Capasso"],
        ["6", "Budget Realisation & Scenography", "11–12", "Can you build it with soul — and with what money?", "Joi Espresso Bar (built from flea markets); Himkok"],
        ["+", "Mockup + Final Pitch Day", "12", "Can your venue win the world stage?", "Concept decks and paper mockups judged by an expert panel"],
    ]
    make_table(c, rows, M, y - 4, [34, 258, 62, 216, 278], row_h=44, header_h=26, font_size=9.3)
    c.showPage()

    # ================= MODULE SLIDES helper =================
    def module_slide(num, weeks, title, sub, topics, cases, question, photo,
                     field_label, field_note):
        top = std(c)
        accent = MODULE_COLORS[num]
        y = CONTENT_TOP
        c.vrect(M, y - 34, 4, 40, accent)
        c.setFillColor(accent)
        c.setFont("Inter-XB", 11)
        c.drawString(M + 16, y - 8, spaced(f"Module {num} · Weeks {weeks}"))
        c.setFillColor(NAVY)
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
        c.setStrokeColor(LINE)
        c.setLineWidth(0.55)
        c.roundRect(X2, y - 318, W2, 254, 8, stroke=1, fill=1)
        c.vrect(X2, y - 318, 3, 254, accent)
        c.setFillColor(accent)
        c.setFont("Inter-Bold", 9)
        c.drawString(X2 + 18, y - 84, "CASES & FIELD MATERIAL")
        bullets_block(c, cases, X2 + 18, y - 104, W2 - 36, size=9.2, gap=8,
                      color=TEXT, bullet_color=accent)
        draw_photo(c, photo, X2 + 18, y - 304, 142, 78, focus_x=0.5, focus_y=0.5, radius=4)
        c.setFont("Inter-Bold", 7.2)
        c.setFillColor(RED if num == 5 else BLUE)
        c.drawString(X2 + 170, y - 252, field_label.upper())
        para(c, field_note, X2 + 170, y - 262, W2 - 186, 8.1, MUTED, leading=10.5)
        c.setFillColor(PANEL2)
        c.roundRect(X2, y - 396, W2, 66, 8, stroke=0, fill=1)
        c.setFillColor(GOLD)
        c.setFont("Inter-Bold", 8.5)
        c.drawString(X2 + 18, y - 344, "KEY QUESTION")
        para(c, question, X2 + 18, y - 358, W2 - 36, 10.5, TEXT, "Inter-Italic", leading=14)
        c.showPage()

    # ================= 7. MODULE 1 =================
    module_slide(1, "1–3", "Contemporary Horeca Trends",
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
        "If a venue opens today, which trends will still matter in 2030?",
        photo=PHOTO_CHEFS_COUNTER, field_label="Open-kitchen theatre", field_note="Chef's counters and tasting-menu dramaturgy as a managed business product.")

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
        "Can atmosphere be measured — and can it be managed like a P&L line?",
        photo=PHOTO_INTERIOR_DESIGN, field_label="Architecture & lighting", field_note="Lighting scenarios, tactile materials, and guest journey ergonomics.")

    # ================= 9. MODULE 3 =================
    module_slide(3, "6–7", "Neurogastronomy & Guest Experience",
        "Culinary science & gastrophysics: how the brain constructs flavour from all senses",
        [
            "Cooking as applied science: Maillard reactions, emulsions, fermentation & controlled testing.",
            "Gastrophysics basics: crossmodal correspondences (Spence, Oxford).",
            "Sound & taste: sonic seasoning; music changes perceived flavour.",
            "Colour, shape and weight of tableware; plating geometry.",
            "Menu psychology: naming, layout, price anchors, choice architecture.",
            "Memory, emotion & peak–end rule: designing «Proust moments».",
            "Sensory lab: a guided blind tasting with controlled variables.",
        ],
        [
            "World Class 2025: The Singleton multisensory challenge — cocktail «Between Us» with a custom record sleeve for «That's Amore».",
            "Tuju: radical personalisation — reading glasses, children's drawing kit, menus of rain and wind.",
            "Bar Leone: simplicity as a sensory strategy — «cocktails for the people».",
        ],
        "What does your venue taste like — before the first bite is served?",
        photo=PHOTO_NEURO_SERVE, field_label="Multisensory serve", field_note="Sound, aromatic smoke, and ceramic weight alter perceived flavour.")

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
        "Where does technology amplify hospitality — and where does it kill it?",
        photo=PHOTO_TECH_OPS, field_label="Smart F&B operations", field_note="Reservation algorithms and KDS free up staff for human hospitality.")

    # ================= 11. MODULE 5 =================
    module_slide(5, "10–12", "World's Leading Restaurants & Bars",
        "Deep dives into chef philosophies, institutions and venues setting the global standard",
        [
            "Chefs as authors & researchers: René Redzepi (Noma), Bottura, Humm, Martínez, Royer.",
            "MICHELIN anatomy: stars, Bib Gourmand, special awards, inspector method.",
            "The 50 Best Academy: who votes, how lists change markets.",
            "Bar scene: World's 50 Best Bars, hotel bars, speakeasies.",
            "World Class: 16 seasons, 450,000+ bartenders, «drink better, not more».",
            "GreatList geography: Moscow — Dubai — Doha — Bangkok — Shanghai.",
            "Final pitch: student concepts vs world benchmarks.",
        ],
        [
            "Maido (Lima) — World's №1 Restaurant 2025; four Lima venues in the top 50.",
            "Bar Leone (Hong Kong) — World's Best Bar 2025, first Asian №1, two years after opening.",
            "Myojaku (Tokyo) — promoted to Three MICHELIN Stars in the 2026 guide.",
        ],
        "What do all №1 venues share — and can it be taught?",
        photo=PHOTO_HOTEL_BAR, field_label="World service benchmarks", field_note="The martini trolley ritual and the renaissance of iconic hotel bars.")

    # ================= 11b. MODULE 6 =================
    module_slide(6, "11–12", "Budget Realisation & Scenography",
        "Opening something with soul without a large budget — then building it by hand, like stage scenery",
        [
            "Soul before budget: a small budget is a creative brief, not a limitation.",
            "Sourcing discipline: flea markets, auctions, demolition yards, liquidations, the street.",
            "Repair, repurpose, re-upholster — patina is expensive to fake and free to keep.",
            "Scenography: painted flats, forced perspective, backdrops, scrim, one tight beam of light.",
            "Decorative techniques: trompe-l'œil, glazing, patina, stencil & gold leaf, faux bois / faux marbre.",
            "The fairy-tale test: a venue is a sweet fairy tale — any small detail can wake the guest up.",
            "Final exercise: a physical mockup of your own venue from paper and found materials (1:20 / 1:50).",
        ],
        [
            "Joi Espresso Bar — the course author's own project, assembled almost entirely from the street and flea markets.",
            "Himkok (Oslo) — a 200-year-old space reimagined instead of rebuilt; Best Bar Design.",
            "Handshake Speakeasy — hidden-door dramaturgy as stagecraft.",
        ],
        "What can be found, reused or painted — and what genuinely has to be bought?",
        photo=PHOTO_ATMOSPHERE_CANDLE, field_label="The paper mockup",
        field_note="Entrance, first sightline, light source and three atmosphere details — photographed at guest height.")

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
    ], M, y - 184, 540, size=9.8, gap=8)
    draw_photo_card(c, PHOTO_OPEN_FIRE, M + 564, y - 172, 284, 170,
                    label="ASADOR ETXEBARRI · DON JULIO",
                    caption="Open fire and radical product minimalism at the top of the world list.",
                    accent=RED)
    c.showPage()

    # ================= 14. CASE: MICHELIN =================
    top = std(c)
    y = slide_title_block(c, "Case: The MICHELIN Guide", "From tyre-maker's guide to the industry's most cited rating")
    X = M; W = 470
    bullets_block(c, [
        ("The star anatomy.", "★ — very good cuisine; ★★ — worth a detour; ★★★ — worth a special journey; plus Bib Gourmand and special awards (Service, Sommelier, Young Chef)."),
        ("Tokyo 2026.", "Myojaku promoted to Three Stars; 18 new stars; Service and Sommelier awards — the world's deepest starred scene."),
        ("California 2026.", "Californios becomes the first Mexican restaurant in the world with Three Stars."),
        ("Sustainability & geopolitics.", "Green Star transitions into «Mindful Voices». The Moscow chapter (debut 2021, suspended 2022) — a case study in rankings and geopolitics."),
    ], X, y - 4, W, size=9.6, gap=9)
    X2 = M + 498; W2 = PAGE_W - M - X2
    draw_photo_card(c, PHOTO_CERAMIC_SERVE, X2, y - 4, W2, 224,
                    label="MICHELIN 2026 · CALIFORNIOS & MYOJAKU",
                    caption="Bespoke ceramic tableware, technical mastery, and regional identity at ★★★ level.",
                    accent=BLUE)
    c.setFillColor(PANEL2)
    c.roundRect(X2, y - 344, W2, 108, 6, stroke=0, fill=1)
    c.vrect(X2, y - 344, 3.5, 108, RED)
    c.setFont("Inter-Bold", 8.2)
    c.setFillColor(NAVY)
    c.drawString(X2 + 14, y - 254, "FIVE CRITERIA OF MICHELIN INSPECTORS")
    para(c, "1. Quality of ingredients · 2. Mastery of cooking technique · 3. Harmony and clarity of flavours · 4. Personality of the chef in the dish · 5. Consistency across visits.",
         X2 + 14, y - 264, W2 - 28, 8.6, TEXT, "Inter", leading=12.0)
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
    ], M, y - 184, 540, size=9.8, gap=9)
    draw_photo_card(c, PHOTO_CRAFT_BAR, M + 564, y - 172, 284, 170,
                    label="BAR LEONE · COCKTAIL POPOLARI",
                    caption="A return to warm neighbourhood hospitality and unpretentious classic cocktails.",
                    accent=BLUE)
    c.showPage()

    # ================= 16. CASES: WORLD CLASS + GREATLIST =================
    top = std(c)
    y = slide_title_block(c, "Cases: Diageo World Class & GreatList", "People and expertise behind the headlines")
    X = M; W = (PAGE_W - 2 * M - 26) / 2
    c.setFillColor(PANEL); c.roundRect(X, y - 350, W, 350, 8, stroke=0, fill=1)
    c.vrect(X, y - 350, 3, 350, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X + 16, y - 22, "DIAGEO WORLD CLASS 2025 · TORONTO")
    bullets_block(c, [
        "Winner: Felice Capasso (Norway) — Nedre Løkka Cocktailbar, Oslo; founder of Sesto Senso Academy.",
        "Challenges: reimagined classics with Johnnie Walker Black Label; Don Julio 1942 serve inspired by AI artwork; multisensory Singleton serve.",
        "Jury: Eric Van Beek (Handshake Speakeasy), Monica Berg (Tayēr + Elementary), Ago Perrone (Connaught Bar).",
    ], X + 16, y - 38, W - 34, size=8.9, gap=6)
    draw_photo(c, PHOTO_AI_MIXOLOGY, X + 16, y - 336, W - 32, 118, focus_x=0.5, focus_y=0.5, radius=5)

    X2 = M + W + 26
    c.setFillColor(PANEL); c.roundRect(X2, y - 350, W, 350, 8, stroke=0, fill=1)
    c.vrect(X2, y - 350, 3, 350, GOLD)
    c.setFillColor(GOLD); c.setFont("Inter-Bold", 9)
    c.drawString(X2 + 16, y - 22, "GREATLIST · INTERNATIONAL RESTAURANT GUIDE")
    bullets_block(c, [
        "Founded 2022; 100+ experts; anonymous visits, self-paid bills, repeat visits at different hours.",
        "Criteria: food & chef imagination; service across the full CJM; design & ergonomics; atmosphere — from scent to music.",
        "Geography: Russia, Dubai, Doha, Bangkok, Hong Kong, Shanghai (+ Singapore & Seoul soon); GreatList Sessions guest dinners.",
    ], X2 + 16, y - 38, W - 34, size=8.9, gap=6)
    draw_photo(c, PHOTO_ATMOSPHERE_CANDLE, X2 + 16, y - 336, W - 32, 118, focus_x=0.5, focus_y=0.5, radius=5)
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
        ("5-minute reflection & peer review", "5 minutes of silent individual notes before plenary debate; every «My Venue» page is peer-reviewed in pairs."),
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
        ["Final pitch «Open & Operate»", "40%", "Full concept deck plus a physical mockup of the venue (paper, cardboard, light — like stage scenery), defended before an expert panel"],
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
        ("05", "Mockup & roadmap", "A physical mockup of the venue — paper, cardboard, light, photographed at guest height — plus a 3-year plan to earn one target guide or list."),
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
    y = slide_title_block(c, "Week-by-week plan", "12 sessions · each lesson has its own full prose & photo presentation deck")
    rows = [
        ["Wk", "Session"],
        ["1", "Lesson 1. Introduction. Anatomy of contemporary Horeca. Rankings as industry infrastructure."],
        ["2", "Lesson 2. Macro-trends I: experience economy 2.0, anti-luxury, casualization of fine dining."],
        ["3", "Lesson 3. Macro-trends II: mindfulness, regional cuisines go global, gastro-tourism & hotel F&B."],
        ["4", "Lesson 4. Venue design: concept as narrative, architecture, interior, ergonomics (Prix Versailles; GreatList)."],
        ["5", "Lesson 5. Engineering atmosphere: light, sound, scent, tableware, service choreography. Field audit."],
        ["6", "Lesson 6. Culinary science & neurogastronomy I: flavour chemistry, gastrophysics, sensory lab."],
        ["7", "Lesson 7. Neurogastronomy II: menu psychology, pricing, peak–end design, World Class multisensory case."],
        ["8", "Lesson 8. Technology I: reservations, revenue management, kitchen & floor automation, CRM."],
        ["9", "Lesson 9. Technology II: AI in creativity and operations, Sesto Senso Academy, ethics & future of work."],
        ["10", "Lesson 10. World restaurants & bars: chef philosophies (Noma et al.), MICHELIN, 50 Best, World Class, hotel bars."],
        ["11", "Lesson 11. Budget realisation & scenography: sourcing with soul, theatrical decorative techniques (Joi Espresso Bar case)."],
        ["12", "Lesson 12. Mockup build + Final Pitch Day «Open & Operate»: concept deck defended together with a physical mockup."],
    ]
    make_table(c, rows, M, y - 2, [46, 802], row_h=25, header_h=22, font_size=9.1)
    c.showPage()

    # ================= 22. CLOSING =================
    closing_page(
        c,
        "Bring the world's best hospitality\ninto the classroom.",
        "Egor Tarasenko",
        "Master in Business Management · Hotel Institute Montreux Alumnus",
        "Sources: MICHELIN Guide · The 50 Best · GreatList · Diageo World Class",
        "Montreux · 2026",
        closing_photo=PHOTO_INTERIOR_SCONCES,
    )
