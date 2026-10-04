/* Portable, edition-scoped course content for Contemporary Horeca Scene. Replace this seed with a CMS/API adapter without changing the views. */
window.COURSE = {
  id: 'contemporary-horeca-scene',
  title: 'Contemporary Horeca Scene',
  edition: 2026,
  descriptor: 'A living digital elective that reads the contemporary horeca scene through rankings, 50 Best menu concepts, design, neurogastronomy, technology, entrepreneurship and its leading practitioners — then asks you to stage a real physical mockup of your venue from found objects, antique tableware, candles and a bespoke menu artefact.',
  institution: 'Hotel Institute Montreux',
  author: 'Egor Tarasenko',
  authorEmail: 'egor.tarasenko@him-mail.ch',
  access: 'Personal password via Tribute digital product (1 password per person). Full access to all modules and lessons upon password entry.',
  figures: [
    {
      id: 'jiro-ono',
      name: 'Jiro Ono',
      role: 'Shokunin Master · Chef-Owner',
      venues: 'Sukiyabashi Jiro · Ginza, Tokyo (3★ MICHELIN)',
      moduleId: 'future',
      moduleNumber: '01 & 03',
      block: 'Hospitality Futures · Rankings, Mastery & Counter Precision',
      image: 'figure-jiro.jpg',
      summary: 'A 10-seat basement counter inside a Ginza subway station that held three MICHELIN stars for decades. No printed menu choices, no appetizers, no distractions — only a 20-piece nigiri progression timed to the guest’s breathing and hand movement.',
      lessonAngle: 'Proves that world-historical prestige does not depend on square metres or opulent real estate. Mastery (shokunin), radical focus on one format, and micro-adjustments (rice temperature at 37°C body heat, piece size adjusted to each guest) turn a 30-minute counter seating into a global benchmark.',
      takeaway: 'Radical subtraction and daily repetition of fundamentals create an authority no marketing budget can buy.'
    },
    {
      id: 'rene-redzepi',
      name: 'René Redzepi',
      role: 'Chef & Co-Founder · New Nordic Cuisine',
      venues: 'Noma · Noma Projects · Copenhagen / global residencies',
      moduleId: 'fnb',
      moduleNumber: '07 & 10',
      block: 'Food & Beverage Futures · Local Ingredients, Fermentation & Responsible Leadership',
      image: 'figure-redzepi.jpg',
      summary: 'Co-founded Noma and helped make Nordic ingredients, foraging, hyper-seasonality and fermentation central to contemporary gastronomy. In 2026, following public abuse allegations from former employees, Redzepi acknowledged harmful past leadership, apologised and stepped away from Noma. The case pairs culinary influence with questions of workplace culture and accountability.',
      lessonAngle: 'Read Noma’s ingredient research alongside questions of power, worker dignity, safe conditions and accountability; creative excellence does not remove an employer’s duty of care.',
      takeaway: 'A local culinary point of view can become a global language; exceptional craft never excuses harm to the people doing the work.'
    },
    {
      id: 'simone-caporale',
      name: 'Simone Caporale',
      role: 'Co-Founder of Sips · Award-Winning Innovator',
      venues: 'Sips Drinkery House (Barcelona, №1 World’s 50 Best Bars 2023) · Artesian (former №1) · Amaro Santoni',
      moduleId: 'experience',
      moduleNumber: '02 & 06',
      block: 'Experience Design · Counterless Hospitality, Island Ergonomics & Bespoke Vessels',
      image: 'figure-caporale.jpg',
      summary: 'Co-founder of Barcelona’s Sips with Marc Álvarez, leading it to №1 in The World’s 50 Best Bars 2023. Former creative leader at London’s Artesian (four consecutive years World №1). At Sips, he removed the traditional barrier between guest and bartender with a central open island workstation and museum-grade custom vessels.',
      lessonAngle: 'Shows how removing the physical bar counter transforms guest connection: 360-degree visibility, bespoke tactile glassware (like cast-metal hands) and culinary cocktail techniques turn service into an intimate theatrical craft without five-star stiffness.',
      takeaway: 'Atmosphere is created when you remove the physical and psychological distance between the maker and the guest.'
    },
    {
      id: 'alex-kratena',
      name: 'Alex Kratena',
      role: 'Award-Winning Bartender & Entrepreneur · Bar Concept Designer',
      venues: 'Artesian at The Langham · Tayēr + Elementary · Muyu · P(OUR)',
      moduleId: 'concepts',
      moduleNumber: '02 & 04',
      block: 'Experience Design & Concepts · Hotel-Bar Reinvention and Dual-Format R&D',
      image: 'figure-kratena.jpg',
      summary: 'Former head bartender of London’s Artesian, which topped The World’s 50 Best Bars for four consecutive years with his team; in 2019, he co-founded Tayēr + Elementary with Monica Berg, pairing an accessible neighbourhood bar with a produce-led cocktail R&D counter.',
      lessonAngle: 'Tayēr + Elementary shows how a clear idea can hold two complementary offers: an approachable everyday bar and a focused produce-led laboratory, each with a distinct role in the guest journey.',
      takeaway: 'Make innovation legible to guests: one bar can balance an easy everyday offer and a focused R&D counter when each has a clear promise.'
    },
    {
      id: 'artem-talalay',
      name: 'Artem Talalay',
      role: 'World Class Russia Winner · Bartender of the Year Hall of Fame',
      venues: 'London Bar (Sochi) · Diageo Reserve World Class · Palm Branch Hall of Fame',
      moduleId: 'neuro',
      moduleNumber: '03 & 05',
      block: 'Neurogastronomy & R&D · Multisensory Mixology & Speed Ergonomics',
      image: 'figure-talalay.jpg',
      summary: 'Winner of Diageo Reserve World Class Russia (2020–2021), taking first place in both Signature Drink and Cocktail Against the Clock, and inductee of the Palm Branch "Bartender of the Year" Hall of Fame.',
      lessonAngle: 'Treats every cocktail through four deliberate coordinates — taste, aroma, tactile texture (enveloping mouthfeel) and visual colouristics — while proving in "Against the Clock" that high-concept gastrophysics only works when backed by razor-sharp station ergonomics and speed under pressure.',
      takeaway: 'Mixology is not blind trend-chasing; it is aligning flavour, aroma, texture and colour with the venue’s concept at operational speed.'
    },
    {
      id: 'dave-arnold',
      name: 'Dave Arnold',
      role: 'Beverage Science Author · Innovator & Educator',
      venues: 'Liquid Intelligence · Booker & Dax (former) · Museum of Food and Drink',
      moduleId: 'neuro',
      moduleNumber: '03 & 07',
      block: 'Neurogastronomy & R&D · Science of the Perfect Cocktail',
      image: 'figure-dave-arnold.jpg',
      summary: 'Author of Liquid Intelligence: The Art and Science of the Perfect Cocktail, an educator and drinks innovator known for applying controlled experiments to cocktail technique — temperature, dilution, carbonation, sugar-and-acid balance and clarification.',
      lessonAngle: 'Turns cocktail development into testable practice: change one variable at a time, record the result, taste critically and translate the discovery into a repeatable bar workflow.',
      takeaway: 'Measure and control variables to make craft repeatable; let guest pleasure — not equipment — be the point.'
    },
    {
      id: 'egor-tarasenko',
      name: 'Egor Tarasenko',
      role: 'Course Author · Practitioner & Founder',
      venues: 'Joi Espresso Bar (2025, by OGONEK TEAM) · Passie Cakes Co. · CooCoo Coffee · Pacific',
      moduleId: 'budget',
      moduleNumber: '09 & 04',
      block: 'Budget Realisation & Scenography · Projects Built from Found Objects',
      image: 'author-joi-2025.jpg',
      summary: 'The author of this elective builds the venues, identities and bar objects the course teaches from: an espresso bar assembled from the street, a pastel cake room, a croffle bar with a cartoon cup on the window, and a bar-furniture studio drawing stations in blackened steel and stone.',
      lessonAngle: 'Every project in the archive is a working answer to one question: what can you make when the budget is small and the point of view is clear? The photos are the primary sources — sourcing, patina, signage, crockery, lighting, merchandise — and students are asked to read them the way they will later read their own flea-market finds.',
      takeaway: 'A consistent point of view, applied to cheap objects with patience, reads as luxury to a guest who never sees the invoice.'
    },
    {
      id: 'remy-savage',
      name: 'Rémy Savage',
      role: 'Concept Architect · Pioneer of 50 Best Conceptual Menus',
      venues: 'A Bar with Shapes for a Name (London) · Bar Nouveau (Paris) · Abstract (Lyon) · Little Red Door · Artesian',
      moduleId: 'concepts',
      moduleNumber: '04 & 06',
      block: 'Restaurant & Bar Concepts · 50 Best Menu Architecture & Art Manifestos',
      image: 'figure-savage.jpg',
      summary: 'World Class Bartender of the Year (2014) who revolutionised World’s 50 Best Bar menus — from wordless illustrated comic-book and architectural menus at Little Red Door to Bauhaus geometric manifestos at Shapes and Art Nouveau organic lines at Bar Nouveau.',
      lessonAngle: 'Demonstrates how a menu and a bar concept act as a single artistic manifesto: guests do not read a list of ingredients; they choose an emotion, a shape, a painting or a philosophical idea. Every vessel, chair, candle, ice block and uniform obeys that single rulebook.',
      takeaway: 'A great 50 Best menu is not a price list — it is a physical artefact that teaches the guest how to read your world.'
    },
    {
      id: 'bek-narzi',
      name: 'Bek Narzi',
      role: 'Hospitality Entrepreneur · Pioneer of Bar Management & Educator',
      venues: 'City Space Bar (Moscow, World’s 50 Best) · Pachamama (London) · Author of The Horeca Code & Seven Hours Before Take-off',
      moduleId: 'technology',
      moduleNumber: '05 & 08',
      block: 'Operations, Systems & Entrepreneurship · The Horeca Code',
      image: 'figure-narzi.jpg',
      summary: 'British-Russian entrepreneur who put Moscow’s City Space Bar onto the world cocktail map, built London hospitality projects (Pachamama), mentored a generation of bar leaders, and codified operational discipline in "The Horeca Code".',
      lessonAngle: 'Insists that hospitality romance collapses without iron operational standards, cost control, station ergonomics, sales psychology and team discipline. His City Space school trained future founders (including Igor Zernov) and invented bar staples such as dehydrated fruit-chip garnishes alongside hotel pastry chefs.',
      takeaway: 'Creative charisma opens a venue once; standards, unit economics and a disciplined school of people keep it open for years.'
    },
    {
      id: 'hiroyasu-kayama',
      name: 'Hiroyasu Kayama',
      role: 'Farm-to-Glass Pioneer · Master Apothecary Bartender',
      venues: 'Bar Benfiddich · Shinjuku, Tokyo (№18 World’s 50 Best Bars / №9 Asia’s 50 Best Bars)',
      moduleId: 'fnb',
      moduleNumber: '07 & 03',
      block: 'Food & Beverage Futures · Farm-to-Counter Apothecary & Zero-Menu Craft',
      image: 'figure-kayama.jpg',
      summary: 'Founder of the 16-seat Bar Benfiddich in Tokyo ("Ben" = mountain = Yama, "Fiddich" = deer = Ka → Kayama). Grows wormwood, fennel, juniper, chamomile, mint and yuzu on his family farm in Chichibu and distils his own absinthe and botanical elixirs.',
      lessonAngle: 'Works with no printed cocktail menu: the candlelit apothecary counter of antique jars, mortar and pestle, fresh herbs and vintage glassware IS the menu. Guests converse with Kayama while he crushes botanicals and builds bespoke drinks from soil to glass.',
      takeaway: 'Owning the raw ingredient from soil to glass — and serving it in antique apothecary vessels — creates an irreproducible signature.'
    },
    {
      id: 'igor-zernov',
      name: 'Igor Zernov',
      role: 'Co-Founder of #FollowTheRabbits · Community & Concept Builder',
      venues: 'El Copitas Bar (№8 World’s 50 Best Bars) · Paloma Cantina · Tagliatella Caffe · Sangre Fresca · Bartenders FAQtory · SPb Cocktail Week',
      moduleId: 'entrepreneurship',
      moduleNumber: '08 & 04',
      block: 'Entrepreneurship & Living Menus · From Hidden Table to Global Ecosystem',
      image: 'figure-zernov.jpg',
      summary: 'Alumnus of Bek Narzi’s City Space school and co-founder of #FollowTheRabbits. Started El Copitas in a hidden St. Petersburg courtyard around one communal table, candles, antique Mexican artefacts, a hand-drawn weekly chalkboard menu and a tiny budget — rising to №8 in The World’s 50 Best Bars.',
      lessonAngle: 'Shows how a ritual-driven micro-concept (welcome taco and copita of mezcal in handmade ceramic vessels, living weekly menu, radical warmth) scales into an entire hospitality ecosystem: Tagliatella Caffe, Paloma Cantina, Sangre Fresca, Bartenders FAQtory and SPb Cocktail Week.',
      takeaway: 'Start with a communal ritual, real tactile objects and a tight team culture; scale by building distinct concepts and educating the market.'
    },
    {
      id: 'boris-zarkov',
      name: 'Boris Zarkov',
      role: 'Restaurateur & Entrepreneur · Founder of White Rabbit Family',
      venues: 'White Rabbit Family · Krasota Gastro-Theatre (Moscow & Dubai) · White Rabbit · Selfie · IKRA',
      moduleId: 'entrepreneurship',
      moduleNumber: '04 & 08',
      block: 'Restaurant Concepts & Entrepreneurship · Portfolio Strategy and Gastro-Theatre',
      image: 'figure-zarkov.jpg',
      summary: 'Founder and CVO of White Rabbit Family and creator of Krasota immersive gastro-theatre. He develops groundbreaking restaurant concepts across a portfolio, showing how theatrical scenography, 360-degree projections, culinary R&D and distinct talent can create iconic hospitality.',
      lessonAngle: 'Study how Krasota synthesizes visual arts, spatial projections, sound design and culinary timing around a single 20-seat interactive table — proving that dining can become immersive living theatre.',
      takeaway: 'When scenography, visual arts and technology serve the culinary story, hospitality transcends food to become unforgettable theatre.'
    },
    {
      id: 'denis-bobkov',
      name: 'Denis Bobkov',
      role: 'Co-Founder of Pub Life Group · Master of Salvage & Antique Scenography',
      venues: 'Black Swan Pub & Shop · Bambule · Abbey Players · The Bix · Tap & Barrel · Drunken Duck',
      moduleId: 'budget',
      moduleNumber: '09 & 02',
      block: 'Budget Realisation & Scenography · Antique Tableware, Candles & Found Worlds',
      image: 'figure-bobkov.jpg',
      summary: 'Rose through every hospitality role — from dishwasher, waiter, cook and bartender to co-owner of Pub Life Group — creating some of the most theatrical, immersive multi-room bars and pubs in Europe.',
      lessonAngle: 'At Black Swan, Bambule and Abbey Players, Bobkov builds worlds not from designer catalogues, but from real found objects: antique silverware and porcelain, dripping wax candles, 19th-century church doors, Victorian confessionals, vintage brass taps and flea-market furniture. Every table feels like a living film set.',
      takeaway: 'Real found objects — antique tableware, candles, patina and salvage — create instant soul that no factory furniture can imitate.'
    }
  ],
  modules: [
    {
      id: 'future',
      number: '01',
      title: 'Hospitality Futures',
      description: 'Read the signals reshaping hospitality, from global rankings (MICHELIN, The 50 Best, GreatList) to the shokunin mastery of Jiro Ono and the independent scene-building of Igor Zernov.',
      image: 'project-detail-street-press.jpg',
      practitioners: ['Jiro Ono (Sukiyabashi Jiro, Tokyo)', 'Igor Zernov (El Copitas / #FollowTheRabbits)'],
      lessons: [
        {
          id: 'signals',
          title: 'Reading the signals & the system of rankings',
          duration: '15 min',
          intro: 'Hospitality is not standing still. The most useful question is not what is trending, but what a trend — and a ranking — reveals about the way people want to spend their time.',
          body: 'A shift in guest behaviour rarely arrives as a single invention. It appears first in small choices: where people gather, what they are willing to wait for, and what they tell friends afterwards. Three rating systems read these signals differently: MICHELIN (anonymous inspectors testing culinary mastery and consistency), The 50 Best (global academy voting on memorable experiences) and GreatList (expert audits of food, service CJM, ergonomics and atmosphere). Look at two opposite poles of global recognition. In Tokyo, Jiro Ono’s Sukiyabashi Jiro — a 10-seat counter tucked inside a Ginza subway station with no printed menu and no decor excess — held three MICHELIN stars for decades through sheer shokunin discipline: 20 pieces of nigiri served at body temperature in 30 minutes. Meanwhile, Igor Zernov and his partners opened El Copitas in a hidden St. Petersburg courtyard around a single candlelit communal table, handmade copitas and antique Mexican props, rising to №8 in The World’s 50 Best Bars through radical warmth and community ritual. Both prove that rankings follow conviction, not square footage.',
          ideas: [
            'A trend is a signal to investigate, not a brief to copy.',
            'MICHELIN, The 50 Best and GreatList each measure a different definition of excellence — know which game your concept plays.',
            'Jiro Ono (Sukiyabashi Jiro): 10 seats in a subway basement can command 3 MICHELIN stars when shokunin mastery is absolute.',
            'Igor Zernov (El Copitas): a hidden communal table lit by candles can enter the world top 10 when hospitality ritual comes first.',
            'Strong concepts make deliberate choices about what they will not be.'
          ],
          case: 'Sukiyabashi Jiro (Jiro Ono, Tokyo) · Bar Leone (Hong Kong) · El Copitas (Igor Zernov)',
          practitioners: ['Jiro Ono', 'Igor Zernov'],
          challenge: 'Practical Assignment 01: Choose one real shift in guest behaviour and analyse one benchmark venue through the course’s four lenses (trend, atmosphere, sensory memory, ranking potential). Compare how Jiro Ono’s precision model or Igor Zernov’s community model applies to your future venue concept. Attach your file/notes inside the app (or send to egor.tarasenko@him-mail.ch).'
        }
      ]
    },
    {
      id: 'experience',
      number: '02',
      title: 'Experience Design',
      description: 'Explore how space, service choreography, antique vessels, candlelight and sound keep the “sweet fairy tale” intact — with Simone Caporale, Alex Kratena and Denis Bobkov.',
      image: 'project-coocoo-room.jpg',
      practitioners: ['Simone Caporale (Sips Barcelona · №1 World’s 50 Best Bars 2023)', 'Alex Kratena (Artesian · Tayēr + Elementary)', 'Denis Bobkov (Pub Life Group · Black Swan · Bambule)'],
      lessons: [
        {
          id: 'atmosphere',
          title: 'Designing atmosphere & the sweet fairy tale',
          duration: '16 min',
          intro: 'Atmosphere is not decoration. It is the cumulative effect of hundreds of tactile choices — light, antique tableware, sound and posture — made legible to a guest through a single evening.',
          body: 'Think of a bar or a restaurant as a sweet fairy tale: for two hours the guest agrees to believe in a world you have built, where the candle flame is warm, the noise of the street disappears and every plate, fork and glass on the table belongs to the story. The spell is fragile. One wrong detail — a harsh overhead LED, a cheap plastic tray, a dirty door handle, a ringtone from the service station, a visible POS printer — wakes the guest up instantly, and the rest of the evening is spent in a room rather than in a dream. Watch how two masters guard that spell. In Barcelona, Simone Caporale (co-founder of Sips, №1 in The World’s 50 Best Bars 2023) treats service choreography and custom vessels as spatial architecture: by dismantling the traditional bar counter in favour of an open central island workstation, Sips creates 360-degree visibility where the bartender’s craft is shared directly with guests, paired with bespoke vessels (such as cast metal hands) that make luxury immediate and unpretentious. In Moscow, Denis Bobkov (Pub Life Group — Black Swan, Bambule, The Bix, Abbey Players) constructs multi-room theatrical labyrinths filled with real antique silverware, dripping wax candles, vintage porcelain and reclaimed church doors where every object keeps the guest inside the narrative.',
          ideas: [
            'A venue is a sweet fairy tale: any small detail (a harsh light, a plastic tray, a visible printer) can instantly wake the guest from the dream.',
            'Simone Caporale (Sips Barcelona): service choreography, central island ergonomics and bespoke vessel craft remove barriers between maker and guest.',
            'Denis Bobkov (Black Swan / Bambule): real candles, antique tableware and sequential hidden rooms immerse the guest deeper than any modern renovation.',
            'Alex Kratena (Artesian / Tayēr + Elementary): connect five-star ritual to contemporary, clearly differentiated bar formats.',
            'Back-of-house must never leak into the story; continuity across sight, sound, scent and touch is the craft.'
          ],
          case: 'Sips Drinkery House (Simone Caporale, Barcelona) · Black Swan & Bambule (Denis Bobkov) · Himkok (Oslo)',
          practitioners: ['Simone Caporale', 'Alex Kratena', 'Denis Bobkov'],
          challenge: 'Practical Assignment 02: Map three scenes for your venue concept (arrival, peak moment, farewell). Specify lighting (candles/warm lamps), sound (BPM), scent, antique/custom tableware and service choreography inspired by Simone Caporale, Alex Kratena or Denis Bobkov — and list three “fairy-tale breakers” you will eliminate. Submit your file/text inside the app for admin feedback.'
        }
      ]
    },
    {
      id: 'neuro',
      number: '03',
      title: 'Neurogastronomy',
      description: 'Understand how perception, gastrophysics, vessel weight and multisensory design shape flavour — through Artem Talalay, Dave Arnold, Jiro Ono and Hiroyasu Kayama.',
      image: 'project-tam-cubes.jpg',
      practitioners: ['Artem Talalay (World Class Russia Winner)', 'Dave Arnold (Liquid Intelligence)', 'Jiro Ono (Sukiyabashi Jiro)', 'Hiroyasu Kayama (Bar Benfiddich)'],
      lessons: [
        {
          id: 'perception',
          title: 'The senses at the table, vessel weight & flavour architecture',
          duration: '16 min',
          intro: 'Flavour is experienced through more than taste. Heavy antique silver, thin crystal, candlelit shadows, aroma, texture and sound all construct what the brain perceives.',
          body: 'Gastrophysics (Charles Spence) proves that the brain assembles flavour from every sense before the first sip or bite: the weight of an antique spoon, the texture of handmade ceramics, the crackle of ice or the scent of crushed herbs. Dave Arnold’s Liquid Intelligence adds a measurement-first method for drink R&D: treat temperature, dilution, carbonation and acid-sugar balance as variables to test, not guesses to repeat. Artem Talalay — Diageo Reserve World Class Russia Winner and Palm Branch Hall of Fame bartender — formulates modern mixology around four inseparable coordinates: taste balance, aromatic cloud, enveloping tactile texture (mouthfeel) and colouristics written into the venue’s concept. In Tokyo, Hiroyasu Kayama (Bar Benfiddich) engages the guest’s ears and nose first by grinding fresh Chichibu farm herbs and wormwood in a mortar right across the candlelit counter, serving elixirs in antique apothecary glass. And at Sukiyabashi Jiro, Jiro Ono engineers the peak–end rule by brushing shoyu onto each piece himself, serving shari (sushi rice) at human body temperature (37°C), and pacing the 20-piece sequence like a three-act concert.',
          ideas: [
            'Artem Talalay’s four coordinates of a serve: taste, aroma, enveloping texture and conceptual colouristics.',
            'Dave Arnold (Liquid Intelligence): test temperature, dilution, carbonation and balance systematically, changing one variable at a time.',
            'Vessel gastrophysics: antique porcelain, heavy silverware and vintage cut crystal directly alter perceived richness and value.',
            'Hiroyasu Kayama (Bar Benfiddich): freshly crushed botanicals and audible mortar craft prime olfactory perception before the first sip.',
            'Jiro Ono (Sukiyabashi Jiro): temperature precision (37°C rice) and the peak–end rule turn 20 bites into a lasting memory.'
          ],
          case: 'Artem Talalay’s World Class Signature Serves · Bar Benfiddich (Hiroyasu Kayama) · Sukiyabashi Jiro',
          practitioners: ['Artem Talalay', 'Dave Arnold', 'Hiroyasu Kayama', 'Jiro Ono'],
          challenge: 'Practical Assignment 03: Design three signature serves or dishes for your concept using Artem Talalay’s four coordinates (taste, aroma, texture, colour), specify the exact vessel/tableware (antique, ceramic, crystal) for each, and describe one pre-sip sensory ritual inspired by Hiroyasu Kayama or Jiro Ono. Attach your assignment file for admin confirmation.'
        }
      ]
    },
    {
      id: 'concepts',
      number: '04',
      title: 'Restaurant & Bar Concepts & 50 Best Menu Breakdown',
      description: 'Deconstruct how the World’s 50 Best Bars & Restaurants build concepts and physical menu artefacts — learning from Rémy Savage, Alex Kratena, Boris Zarkov, Igor Zernov, Bar Leone and Tuju.',
      image: 'project-joi-brand.jpg',
      practitioners: ['Rémy Savage (Little Red Door · Shapes · Bar Nouveau)', 'Alex Kratena (Artesian · Tayēr + Elementary)', 'Boris Zarkov (White Rabbit Family · IKRA)', 'Igor Zernov (El Copitas · Tagliatella Caffe · Paloma Cantina)'],
      lessons: [
        {
          id: 'point-of-view',
          title: 'Concept manifestos & deconstructing The World’s 50 Best menus',
          duration: '18 min',
          intro: 'In the World’s 50 Best Bars and Restaurants, the menu is never a laminated price sheet. It is the concept made touchable — a physical object that sets the rules of the room.',
          body: 'A compelling venue connects audience, occasion, offer, space and economics under one unmistakable idea — and proves that idea the moment the guest touches the menu. Look at how the World’s 50 Best leaders engineer menu concepts: (1) Rémy Savage turned the cocktail menu into an art discipline: at Little Red Door (Paris), he replaced drink descriptions with a wordless comic book and architectural drawings where guests ordered by visual emotion; at A Bar with Shapes for a Name (London), the menu is a pure Bauhaus design manifesto of primary shapes (triangle, square, circle); at Bar Nouveau, it echoes Art Nouveau craftsmanship. (2) Bar Leone (Hong Kong, №1 World’s 50 Best Bars) created the "Cocktail Popolari" living archive — deceptively classic Italian neighbourhood cards backed by radical transparency of ingredients. (3) Igor Zernov at El Copitas (№8 World’s 50 Best Bars) rejected static printing altogether for a living chalkboard menu redrawn every week around fresh batches, while at Tagliatella Caffe the menu works as an instant Italian aperitivo postcard. (4) Tuju (São Paulo, Art of Hospitality 2026) structures its tasting menus as meteorological research notebooks ("Rain", "Wind", "Drought"). (5) Alex Kratena and Monica Berg built Tayēr + Elementary as a dual-format bar, pairing an approachable neighbourhood offer with produce-led cocktail R&D. (6) Boris Zarkov’s White Rabbit Family and IKRA illustrate portfolio-level concept building: a group can support distinct restaurant ideas and talent without flattening them into one brand. When you design your venue, your menu concept must be a real physical artefact that belongs on the table next to your candles and glassware.',
          ideas: [
            '50 Best Menu Archetypes: the Art Manifesto (Rémy Savage), the Living Weekly Chalkboard (Igor Zernov / El Copitas), the Neighbourhood Archive (Bar Leone), the Climate Notebook (Tuju) and the Zero-Menu Apothecary (Hiroyasu Kayama).',
            'Menu psychology & architecture: choice limit (8–14 items), flavour/mood axes, tactile paper/material weight, no currency-sign columns.',
            'Rémy Savage (Shapes / Bar Nouveau / Little Red Door): let one conceptual rule govern the menu object, the glassware, the furniture and the batching.',
            'Igor Zernov (#FollowTheRabbits): each venue in a group must own a distinct ritual, menu format and occasion.',
            'Alex Kratena & Monica Berg (Tayēr + Elementary): pair an easy everyday offer with a produce-led R&D counter, each with a clear purpose.',
            'Boris Zarkov (White Rabbit Family / IKRA): grow a portfolio of distinct concepts around a recognisable entrepreneurial vision.'
          ],
          case: '50 Best Menu Breakdown: Little Red Door & Shapes (Rémy Savage) · El Copitas (Igor Zernov) · Bar Leone · Tuju',
          practitioners: ['Rémy Savage', 'Alex Kratena', 'Boris Zarkov', 'Igor Zernov'],
          challenge: 'Practical Assignment 04 (Concept & 50 Best Menu Breakdown): Analyse two menu concepts from The World’s 50 Best Bars/Restaurants (e.g. Rémy Savage, El Copitas, Bar Leone, Paradiso, Tuju) and design the physical Menu Concept for your own venue (structure, tactile material, naming rules, pricing presentation, 6–10 items). Attach your menu concept draft/photos for admin review.'
        },
        {
          id: 'concept-objects',
          title: 'Concept objects: the menu, the merchandise, the furniture',
          duration: '17 min',
          intro: 'A concept becomes real when it leaves the wall and lands in the guest’s hands — as a menu, a coaster, a cube, a stool, or a bar station drawn for the workshop.',
          body: 'The projects in this archive show three ways a concept turns into a physical object. (1) The menu as a keepsake: at CooCoo Coffee the entire promise is three alliterative words — coffee, croffles, cookies — printed on cups, window art and a paper board, so the brand travels home in the guest’s hand. (2) The furniture and stations that carry the room: Pacific designs bar stations the way a menu is designed — a sintered-stone top, a recessed ice well, speed rails, an under-counter glass hanger, a cantilevered console on castors — and delivers them as 3D visualisations and technical drawings a workshop can actually build. The exercise is always the same three questions: what does the guest touch first, what do they take away, and what does the team work behind?',
          ideas: [
            'Every concept needs one takeaway object: a menu card, a cup, a coaster, a box — something the guest carries out of the room.',
            'Pacific bar solutions: design the working furniture — ice well, speed rail, glass hanger, castors — because ergonomics is scenography the guest never notices.',
            'Pacific: the bar itself is a designed object — draw the ice well, the speed rail and the glass hanger, not just the countertop.',
            'CooCoo Coffee: a single alliterative product trio (coffee · croffles · cookies) makes naming, signage, packaging and menu structure fall into place.',
            'A concept object only counts when it can be produced, priced and replaced — prototypes are part of the business model.'
          ],
          case: 'Concept Objects: Pacific (bar stations, mobile consoles & technical drawings) · CooCoo Coffee (coffee · croffles · cookies)',
          practitioners: ['Egor Tarasenko'],
          challenge: 'Practical Assignment 04B (Concept Objects): Design three physical objects for your venue — one menu artefact the guest keeps, one item of merchandise that teaches the concept, and one piece of working furniture or equipment (sketch with dimensions and materials). Explain the production route and the unit cost of each. Attach sketches/photos for admin review.'
        }
      ]
    },
    {
      id: 'technology',
      number: '05',
      title: 'Technology & Automation',
      description: 'Consider where technology, station ergonomics and operational standards improve speed and margins — with Bek Narzi and Artem Talalay.',
      image: 'web-insider-station.jpg',
      practitioners: ['Bek Narzi (City Space Bar · The Horeca Code)', 'Artem Talalay (World Class Speed & Ergonomics)'],
      lessons: [
        {
          id: 'automation',
          title: 'Automation, ergonomics & the Horeca Code',
          duration: '15 min',
          intro: 'Technology and ergonomics should not simply make hospitality faster. They should free the team to be more human with the guest.',
          body: 'The right systems remove friction behind the scenes while keeping the machinery invisible in the candlelit dining room. Bek Narzi — founder of Moscow’s legendary City Space Bar (World’s 50 Best Bars), London’s Pachamama, and author of The Horeca Code ("The Horeca Code") — proved that world-class bar theatre collapses without hard operational engineering: station ergonomics, prep tech (from rotary evaporators and clarification to dehydrated fruit garnishes co-created with Swissôtel pastry chefs), inventory control and check-average discipline. Artem Talalay demonstrated the physical side of this in World Class’s "Cocktail Against the Clock" challenge: when prep, batching and speed-rail geometry are engineered to the centimetre, a bartender can deliver ten complex, balanced serves in minutes without breaking eye contact or hospitality warmth.',
          ideas: [
            'Automate repetition and prep; protect moments where human attention creates emotional value.',
            'Bek Narzi (The Horeca Code / City Space): iron operational standards, cost control and station ergonomics are the backbone of hospitality.',
            'Artem Talalay ("Against the Clock"): speed-rail ergonomics and smart pre-batching allow high craft at peak Friday volume.',
            'Hide the machinery: technology that guests can see working is stage scenery that broke.'
          ],
          case: 'City Space Bar & The Horeca Code (Bek Narzi) · Speed-Rail & Prep R&D (Artem Talalay)',
          practitioners: ['Bek Narzi', 'Artem Talalay'],
          challenge: 'Practical Assignment 05: Build a "Human / Machine Matrix" for 10 touchpoints of your venue’s evening, plus a station ergonomics & prep plan inspired by Bek Narzi’s Horeca Code and Artem Talalay’s speed principles. Upload your file/notes for admin confirmation.'
        }
      ]
    },
    {
      id: 'ai',
      number: '06',
      title: 'AI in Hospitality',
      description: 'Assess emerging AI workflows, creative briefs and operational forecasting — contrasting algorithmic tools with the human authorship of Rémy Savage and Simone Caporale.',
      image: 'project-tam-tool.jpg',
      practitioners: ['Rémy Savage (Conceptual Authorship)', 'Simone Caporale (Bespoke Vessel Craft & Avant-Garde Mixology)'],
      lessons: [
        {
          id: 'human-ai',
          title: 'AI as a creative and operational tool',
          duration: '17 min',
          intro: 'AI can help teams generate options, prototype menu visuals, forecast demand and structure R&D briefs. It cannot own the responsibility for what a hospitality business promises.',
          body: 'From Diageo World Class challenges (where bartenders translated AI-generated visual art into Don Julio 1942 sensory serves) to demand forecasting, menu engineering and prep scheduling, AI expands a small team’s capacity. Yet as Rémy Savage and Simone Caporale demonstrate in their laboratories in London, Paris and Barcelona, an algorithm can suggest flavour pairings or visual compositions, but only a human author can decide why a drink exists, how an antique glass feels in the hand, and how a host reads a tired guest at 11 p.m. Use AI to compress back-office analysis and widen creative exploration, then edit ruthlessly through your own taste and ethical rules.',
          ideas: [
            'Use AI to widen R&D exploration, menu prototyping and demand forecasting, then apply human taste and editorial judgement.',
            'World Class AI Briefs & Simone Caporale: AI can spark a visual or flavour hypothesis, but execution lives in glass, ice and hospitality.',
            'Rémy Savage: never mistake fluent algorithmic output for a real philosophical point of view.',
            'Commit to clear ethical boundaries around guest data, team scheduling and creative authorship.'
          ],
          case: 'World Class AI Beverage Brief · Conceptual Laboratories of Rémy Savage & Simone Caporale',
          practitioners: ['Rémy Savage', 'Simone Caporale'],
          challenge: 'Practical Assignment 06: Define your venue’s AI & Ethics Charter: 3 workflows where AI saves time/money (forecasting, R&D flavour matrix, menu testing), 2 areas where AI is strictly banned to protect human hospitality, and 1 AI-assisted creative brief edited through Rémy Savage’s or Simone Caporale’s lens. Submit for admin review.'
        }
      ]
    },
    {
      id: 'fnb',
      number: '07',
      title: 'Food & Beverage Futures',
      description: 'Explore farm-to-glass mixology, hyper-seasonal terroir, fermentation and beverage science through Hiroyasu Kayama, René Redzepi, Dave Arnold and Artem Talalay.',
      image: 'project-passie-counter.jpg',
      practitioners: ['Hiroyasu Kayama (Bar Benfiddich, Tokyo)', 'René Redzepi (Noma)', 'Dave Arnold (Liquid Intelligence)', 'Artem Talalay (World Class)'],
      lessons: [
        {
          id: 'new-formats',
          title: 'The next table & Hiroyasu Kayama’s farm-to-glass apothecary',
          duration: '15 min',
          intro: 'The future of food and beverage belongs to operators who control their raw narrative — from soil and botanical harvest to the final serve across the candlelit counter.',
          body: 'When every bar in a city buys the same bottles from the same three distributors, differentiation dies. In Shinjuku, Tokyo, Hiroyasu Kayama built Bar Benfiddich (№18 World’s 50 Best Bars / №9 Asia’s 50 Best Bars) around a radical answer: he farms his own land in Chichibu (Saitama Prefecture), growing wormwood, fennel, anise, juniper, chamomile, mint, plums and yuzu. He distils and infuses his own absinthe, amari and botanical spirits. Even the name encodes his roots: "Ben" (mountain = yama) + "Fiddich" (deer = ka) = Kayama. Inside the 16-seat apothecary bar there is no printed menu — Kayama talks with each guest among antique jars and candlelight and composes from scratch. Pair this with São Paulo’s Tuju (Art of Hospitality 2026), where menus follow seasonal rain, wind and drought cycles. Dave Arnold’s Liquid Intelligence offers the complementary beverage-science lens: controlled temperature, dilution and carbonation make novel serves reliably repeatable. At Noma, René Redzepi and his teams brought foraging, local Nordic ingredients, fermentation and hyper-seasonality into the global conversation. This is also a leadership case: in 2026, following public allegations from former employees, Redzepi acknowledged harmful past leadership, apologised and stepped away from Noma. Together, these cases show that the future of F&B is terroir-rooted and inventive — and must also be responsible to the people who make it.',
          ideas: [
            'Hiroyasu Kayama (Bar Benfiddich): grow or craft your own core ingredients so your flavour signature cannot be bought from a catalogue.',
            'Zero-menu apothecary dialogue turns ordering from a transaction into a bespoke consultation.',
            'Local terroir and seasonal cycles (Chichibu botanicals at Benfiddich, climate menus at Tuju) create authentic scarcity.',
            'Scale is optional: a 16-seat room with high integrity can influence the entire global industry.',
            'Dave Arnold (Liquid Intelligence): use controlled experiments to make a distinctive drink both delicious and consistent.',
            'René Redzepi / Noma: study foraging, hyper-seasonality and fermentation alongside the 2026 debate about leadership, worker dignity and accountability.',
            'Ivan Lyashuk and Vladimir Nikolaev / Artender: build bartender creativity through accessible challenges, education and peer exchange.'
          ],
          case: 'Bar Benfiddich (Hiroyasu Kayama, Tokyo) · Tuju (São Paulo)',
          practitioners: ['Hiroyasu Kayama', 'René Redzepi', 'Dave Arnold', 'Artem Talalay'],
          challenge: 'Practical Assignment 07: Design the F&B & Menu core of your concept (5 key dishes/serves + pricing logic). Include at least two "house-grown / house-made" signature preparations inspired by Hiroyasu Kayama’s Bar Benfiddich that no competitor can buy ready-made. Submit your file/notes for admin confirmation.'
        }
      ]
    },
    {
      id: 'entrepreneurship',
      number: '08',
      title: 'Entrepreneurship',
      description: 'Move from a strong idea to an operationally grounded hospitality business and school of talent — learning from Bek Narzi, Igor Zernov and Boris Zarkov.',
      image: 'project-joi-facade.jpg',
      practitioners: ['Bek Narzi (City Space · Pachamama · The Horeca Code)', 'Igor Zernov (#FollowTheRabbits · El Copitas · Bartenders FAQtory)', 'Boris Zarkov (White Rabbit Family · Krasota · IKRA)'],
      lessons: [
        {
          id: 'from-idea',
          title: 'From idea to operating model & talent ecosystem',
          duration: '18 min',
          intro: 'A hospitality business is a promise delivered repeatedly by a team within real financial constraints. Great founders build not just a room, but a school of people.',
          body: 'Look at one of the most instructive lineages in contemporary bar entrepreneurship: Bek Narzi and his former protégé Igor Zernov. At Moscow’s City Space Bar and later in London (Pachamama) and his books The Horeca Code and Seven Hours Before Take-off, Bek Narzi established the entrepreneurial fundamentals: P&L literacy, guest psychology, PR audacity, and treating the bar team as a first-league sports squad where discipline creates stars. Igor Zernov absorbed that school and, together with Artyom Peruk and Nikolay Kiselyov, launched El Copitas on a shoestring budget — turning a hidden Thursday-to-Saturday speakeasy into #FollowTheRabbits: a group encompassing El Copitas (№8 World’s 50 Best Bars), Paloma Cantina, Tagliatella Caffe, Sangre Fresca, the Bartenders FAQtory academy and Saint-Petersburg Cocktail Week. At restaurant-group scale, Boris Zarkov (White Rabbit Family, Krasota Gastro-Theatre, co-founder of IKRA) offers a model of building a portfolio of distinct concepts and immersive talent ecosystems. Across these models, test assumptions cheaply, build a strong team culture, and make education part of the growth engine.',
          ideas: [
            'Bek Narzi’s entrepreneurial rule: creative storytelling must sit on top of unit economics, sales training and iron discipline.',
            'Igor Zernov (#FollowTheRabbits): validate demand in a low-capex format first, then reinvest community trust into a multi-concept ecosystem.',
            'Build a school inside your business (City Space school, Bartenders FAQtory) so talent grows with you instead of leaving.',
            'Boris Zarkov (White Rabbit Family / IKRA): make each concept distinct while building a group with a clear point of view and a deep talent bench.',
            'Map your unit economics early: average check, seat turns, rent-to-revenue ratio, labour percentage and payback horizon.'
          ],
          case: 'Bek Narzi (City Space & The Horeca Code) · Igor Zernov (#FollowTheRabbits & El Copitas)',
          practitioners: ['Bek Narzi', 'Igor Zernov', 'Boris Zarkov'],
          challenge: 'Practical Assignment 08: Present the Operating Model & Unit Economics for your venue (capacity, covers/day, average check, rent logic, staffing structure, 90-day launch & guest-shift plan) applying Bek Narzi’s Horeca Code and Igor Zernov’s ecosystem model. Upload your assignment for admin review.'
        }
      ]
    },
    {
      id: 'budget',
      number: '09',
      title: 'Budget Realisation, Scenography & Found-Object Mockup',
      description: 'Prove that a venue with soul does not need a fortune: Denis Bobkov’s salvage-built theatrical pubs (Black Swan, Bambule), Egor Tarasenko’s street-sourced Joi Espresso Bar — and your real physical mockup assembled from found objects, antique tableware, candles and menu concepts.',
      image: 'project-detail-chess-morning.jpg',
      practitioners: ['Denis Bobkov (Pub Life Group · Black Swan · Bambule · Abbey Players)', 'Egor Tarasenko (Joi Espresso Bar)'],
      lessons: [
        {
          id: 'budget-builds',
          title: 'Soul before budget: Joi Espresso Bar & Denis Bobkov’s salvage worlds',
          duration: '16 min',
          intro: 'A venue does not need a large budget to feel alive. It needs a point of view, and the patience to hunt for real objects — antique dishes, candlesticks, vintage furniture — that carry one.',
          body: 'Some of the most convincing rooms in the world were assembled rather than constructed: doors, mirrors and chairs from flea markets, tarnished silver and antique porcelain, heavy candlesticks, marble offcuts, reclaimed timber, an espresso machine bought second-hand, signage painted by hand. Joi Espresso Bar — the course author Egor Tarasenko’s own project — was built almost entirely from the street and flea markets without a large investment, holding together because the story came first and every object was chosen by the same pair of eyes. At a larger multi-room scale, Denis Bobkov (co-founder of Pub Life Group: Black Swan Pub & Shop, Bambule, Abbey Players, The Bix) turned salvage hunting into an art form: assembling secret rooms out of antique church doors, Victorian wood panelling, flea-market brass, antique tableware, dripping candles and vintage posters. When you refuse to buy a sterile look from a catalogue, you invent a world no competitor can replicate. Money buys speed and finish. Intention buys soul.',
          ideas: [
            'Write the feeling first, then go hunting for it: flea markets, antique stalls, auctions, demolition yards, liquidations, the street.',
            'Egor Tarasenko (Joi Espresso Bar): a venue assembled from the street and flea markets holds together when one clear story guides every choice.',
            'Denis Bobkov (Black Swan / Bambule / Abbey Players): antique tableware, candlesticks, reclaimed doors and vintage salvage create instant history and depth.',
            'Repair, repurpose and re-upholster before replacing; patina is expensive to fake and free to keep.',
            'Money buys speed and finish. Intention buys soul.'
          ],
          case: 'Joi Espresso Bar (Egor Tarasenko) · Black Swan & Bambule (Denis Bobkov, Pub Life Group)',
          practitioners: ['Denis Bobkov', 'Egor Tarasenko'],
          challenge: 'Practical Assignment 09A: List 10 key physical elements of your venue (tableware, glasses, candle/light sources, bar counter, seating, doors, menu artefact, etc.). For each, specify a second-hand, antique flea-market, salvage or self-built sourcing plan inspired by Joi Espresso Bar and Denis Bobkov’s Black Swan, comparing your budget against catalogue prices. Submit for admin confirmation.'
        },
        {
          id: 'scenography',
          title: 'Theatrical techniques & the live mockup from found objects',
          duration: '19 min',
          intro: 'Do not build a sterile architectural paper box. Stage your venue directly from real found objects — antique tableware, candles, vintage glass, fabric, wood, bottles and your physical menu concept.',
          body: 'Here is the core secret of scenography: you do not test a hospitality concept on a flat blueprint or out of white office paper. You test it by assembling its real tactile world out of whatever you can hunt down and improvise with your hands! Borrow the decorative techniques of the theatre (as Denis Bobkov does at Abbey Players and Black Swan, and Egor Tarasenko did at Joi Espresso Bar): patina, glazing, trompe-l’œil, distressing, drapery, wax candles and a single tight beam of warm light. Then build your physical mockup NOT from paper, but from real improvised and found things: an antique plate or coupe glass from a flea market, melted candles in vintage holders, a scrap of velvet or aged wood, a hand-aged bottle, a mortar with herbs (like Hiroyasu Kayama’s counter), and a physical prototype of your 50 Best-style Menu Concept. Stage a real corner, table vignette or bar fragment of your venue in actual light. Photograph it at guest eye height. If a guest looking at that photograph immediately believes the "sweet fairy tale" and wants to sit at that table tonight, your concept works.',
          ideas: [
            'The mockup is NOT made of paper: assemble it from real found and improvised objects — antique tableware, candles, vintage glassware, fabrics, wood, stone and herbs.',
            'Include a physical prototype of your Menu Concept (inspired by 50 Best menus: Rémy Savage, Bar Leone, El Copitas, Tuju) right inside the setup.',
            'Borrow theatrical techniques (Denis Bobkov’s Abbey Players & Black Swan): patina, distressing, drapery, candle flame and a single tight beam of light.',
            'A theatrical trick must support the story and never announce itself — otherwise the sweet fairy tale ends.',
            'Stage and photograph your found-object mockup in real evening/candle light at guest eye level — that is the image you pitch with.'
          ],
          case: 'Live Found-Object Mockup · Antique Tableware, Candles & 50 Best Menu Artefacts (Denis Bobkov · Joi Espresso Bar · Rémy Savage)',
          practitioners: ['Denis Bobkov', 'Rémy Savage', 'Hiroyasu Kayama'],
          challenge: 'Practical Assignment 09B (Found-Object Live Mockup & Menu Concept): Assemble a real physical mockup of your venue from improvised and found objects — antique tableware/glassware, candles, textures, props and a physical prototype of your 50 Best-inspired Menu Concept. Light it with real candles/focused light and photograph 3 views at guest eye level. Attach your photographs and description for admin confirmation.'
        },
        {
          id: 'small-venues',
          title: 'Small venues, real budgets: the author’s project archive',
          duration: '18 min',
          intro: 'Four built venues, one cake room, one bar-furniture studio: what a small budget actually buys, photographed on the day the rooms were finished.',
          body: 'This unit opens the photo archive behind the course — the author’s own projects, documented as working evidence rather than portfolio images. Joi Espresso Bar (opened 2025 by OGONEK TEAM) is the espresso bar assembled from the street: a poster facade, café bulbs, paper cups stamped with the logo, a brass lever machine and second-hand grinders on a small counter. Passie Cakes Co. is the opposite lesson in the same method: a one-room cake shop where pink banquettes, a crystal chandelier, china jugs used as vases and a hand-drawn bear with a birthday cake do all the branding, so the cheapest props in the room are the most photographed. CooCoo Coffee (coffee · croffles · cookies) shows a street concept built on one alliterative promise: a turquoise facade, a cartoon cup with googly eyes on the window, café bulbs over a paper menu and a croffle served on a pink table. Pacific moves one step upstream from the venue: bar stations, consoles and glass hangers designed, drawn and fabricated as products — because half of the atmosphere of a good bar was decided by whoever drew the furniture. Read the photos in the archive and write down what was bought, what was found and what was made. That list is your own sourcing plan.',
          ideas: [
            'Joi Espresso Bar (2025 · OGONEK TEAM): logo, cup, poster facade and a second-hand bar — the brand costs nothing, the equipment costs everything.',
            'Passie Cakes Co.: props do the branding — a chandelier, a pastel banquette, a hand-drawn logo and flowers, all replaceable at flea-market prices.',
            'CooCoo Coffee: one product trio and one palette make signage, menu and packaging self-evident.',
            'Pacific: design the working furniture — ice well, speed rail, glass hanger, castors — because ergonomics is scenography the guest never notices.',
            'Chicken Connection: the finish pass, boxed delivery and open kitchen are the content of the room, not the back of house.',
            'Collect the details: chessboards, resin ashtrays, pasted posters, bric-a-brac glassware in red light — a research file is cheaper than a renovation.'
          ],
          case: 'Project Archive of the Author: Joi Espresso Bar · Passie Cakes Co. · CooCoo Coffee · Chicken Connection (Moscow) · Pacific',
          practitioners: ['Egor Tarasenko'],
          challenge: 'Practical Assignment 09C (Archive Reading): Choose four photographs from the author’s project archive and write a sourcing analysis for each: what was bought new, what was found second-hand, what was made or repaired by hand, and what it would cost to repeat in your own city. Then add one detail you would copy and one you would refuse. Attach your notes for admin confirmation.'
        }
      ]
    },
    {
      id: 'final',
      number: '10',
      title: 'Final Challenge',
      description: 'Bring your thinking together. Defend the hospitality concept of tomorrow — drawing on selected industry benchmarks, a 50 Best menu concept and your live found-object mockup.',
      image: 'web-insider-lab.webp',
      practitioners: ['Hiroyasu Kayama', 'Denis Bobkov', 'Rémy Savage', 'Simone Caporale', 'Igor Zernov', 'Artem Talalay', 'Bek Narzi', 'Jiro Ono', 'Boris Zarkov', 'René Redzepi', 'Dave Arnold', 'Alex Kratena'],
      lessons: [
        {
          id: 'final-brief',
          title: 'Design the hospitality concept of tomorrow ("Open & Operate")',
          duration: '20 min',
          intro: 'Imagine you are opening a hospitality venue. Make the complete case for the experience, the 50 Best menu concept, the business model, and the real found-object mockup staged with antique tableware and candlelight.',
          body: 'Your final submission brings together every milestone of the elective into one cohesive "Open & Operate" pitch deck, a physical Menu Concept (in the spirit of The World’s 50 Best Bars & Restaurants), and your live mockup assembled from found objects, antique tableware and candles. Connect your audience, one-sentence USP, space, atmosphere ("sweet fairy tale" continuity), neurogastronomy serves, technology/human matrix, unit economics, and salvage & budget realisation plan. Choose one or two principles from the featured figures: Kayama (farm-to-glass), Bobkov (salvage scenography), Savage (conceptual menus), Caporale or Kratena (service and bar format), Zernov (community ritual and education), Talalay or Dave Arnold (sensory mixology and drink science), Narzi or Zarkov (operating discipline and restaurant-group strategy), Redzepi (terroir, fermentation and responsible leadership), and Jiro Ono (shokunin precision).',
          ideas: [
            'Make the guest, the occasion and the one-sentence USP unmistakable.',
            'Present your Menu Concept analysed through The World’s 50 Best lens (Rémy Savage, Bar Leone, El Copitas, Tuju, Bar Benfiddich).',
            'Show how service choreography (Caporale or Kratena), sensory serves (Talalay, Arnold, Kayama or Jiro), operational standards (Narzi or Zarkov) and community growth (Zernov) work together.',
            'Pair culinary innovation (Redzepi) with a credible plan for safe, fair working conditions.',
            'Present your salvage & scenography budget (Joi Espresso Bar, Denis Bobkov) alongside photographs of your real found-object mockup (antique tableware, candles, textures, menu artefact).',
            'Keep the fairy tale intact — name the details that could wake the guest up, and how you removed them.'
          ],
          case: 'Your own concept, 50 Best Menu & Found-Object Mockup benchmarked against selected figures from every course block',
          practitioners: ['Hiroyasu Kayama', 'Denis Bobkov', 'Rémy Savage', 'Simone Caporale', 'Igor Zernov', 'Artem Talalay', 'Bek Narzi', 'Jiro Ono', 'Boris Zarkov', 'René Redzepi', 'Dave Arnold', 'Alex Kratena'],
          challenge: 'Practical Assignment 10 (Final Pitch "Open & Operate"): Submit your complete concept deck, 50 Best Menu Concept, sourcing & budget plan, and photographs of your live found-object mockup (antique tableware, candles, props) inside the app (and/or to egor.tarasenko@him-mail.ch) for final review and certificate approval by Egor Tarasenko.'
        }
      ]
    }
  ],
  cases: [
    {
      title: 'Bar Benfiddich · Hiroyasu Kayama',
      location: 'Tokyo, Japan',
      year: '№18 World’s 50 Best Bars / №9 Asia’s 50 Best Bars',
      industry: 'Farm-to-Glass Mixology · Botanical Apothecary Craft',
      image: 'case-benfiddich-kayama.jpg',
      context: 'A 16-seat apothecary cocktail bar in Shinjuku where owner-bartender Hiroyasu Kayama serves botanicals grown on his family farm in Chichibu (Saitama).',
      what: 'No printed menu: Kayama talks with each guest across a candlelit counter of antique jars, crushes fresh wormwood, fennel, juniper and yuzu in a mortar, and pours homemade absinthe, amari and infusions.',
      why: 'Demonstrates that vertical ownership of raw ingredients (soil to glass) and antique apothecary staging create an irreproducible global benchmark.',
      takeaway: 'What you grow, distil and stage yourself can never be copied from a distributor catalogue.'
    },
    {
      title: 'Black Swan & Bambule · Denis Bobkov',
      location: 'Moscow · Pub Life Group',
      year: 'Salvage Architecture & Theatrical Pubs',
      industry: 'Pub Life Group · Theatrical Scenography & Found Objects',
      image: 'case-black-swan-bobkov.jpg',
      context: 'Co-founder of Pub Life Group Denis Bobkov rose from dishwasher and bartender to building Europe’s most atmospheric theatrical pubs and bars (Black Swan, Bambule, Abbey Players, The Bix).',
      what: 'Labyrinthine multi-room spaces assembled from European salvage yards, antique porcelain and silverware, dripping wax candles, 19th-century church doors, Victorian confessionals and stage lighting.',
      why: 'Proves how found antique objects, real candlelight and theatrical scenography keep the "sweet fairy tale" intact across every room.',
      takeaway: 'Real found artefacts — antique tableware, candles and salvage — build deeper emotional worlds than turnkey luxury renovations.'
    },
    {
      title: 'A Bar with Shapes for a Name · Rémy Savage',
      location: 'London & Paris',
      year: 'World’s 50 Best Bars',
      industry: '50 Best Conceptual Menus · Bauhaus Architecture & Art Manifestos',
      image: 'case-shapes-savage.jpg',
      context: 'World Class Bartender of the Year Rémy Savage builds bars and menus as complete philosophical movements — Bauhaus functionalism at Shapes (London) and Art Nouveau at Bar Nouveau (Paris).',
      what: 'At Shapes (London) and Bar Nouveau (Paris), the menu is designed as an art manifesto where guests choose by visual form, mood or movement rather than a dry recipe list.',
      why: 'Turns the menu and interior into a single conceptual filter that makes every decision coherent.',
      takeaway: 'A World’s 50 Best menu is a tangible manifesto that teaches the guest how to experience the room.'
    },
    {
      title: 'Sips Drinkery House · Simone Caporale',
      location: 'Barcelona, Spain',
      year: '№1 World’s 50 Best Bars 2023',
      industry: 'Modern Cocktail Lab · The Counterless Drinkery House & Bespoke Vessels',
      image: 'case-sips-caporale.jpg',
      context: 'Founded by Simone Caporale and Marc Álvarez in Barcelona’s Eixample, Sips eliminated the traditional bar counter to reinvent guest connection.',
      what: 'Instead of sitting across a counter barrier, guests sit around a central island workstation where bartenders work in 360-degree view. Signature serves feature bespoke vessels — from cast metal hands to suspended crystal and temperature contrasts.',
      why: 'Proves that world-leading avant-garde mixology thrives without formal stiffness or barriers separating staff from guests.',
      takeaway: 'Remove the barrier between maker and guest; bespoke vessels and open ergonomics make the experience immediate, intimate and alive.'
    },
    {
      title: 'El Copitas & #FollowTheRabbits · Igor Zernov',
      location: 'St. Petersburg',
      year: '№8 World’s 50 Best Bars',
      industry: '#FollowTheRabbits · Speakeasy Rituals & Hospitality Ecosystem',
      image: 'case-el-copitas-zernov.jpg',
      context: 'Co-founded by Igor Zernov (an alumnus of Bek Narzi’s City Space school), El Copitas began as a tiny hidden bar around one candlelit communal table.',
      what: 'Personal phone greeting, welcome taco and copita of mezcal in handmade clay/ceramic vessels, weekly hand-drawn chalkboard menu — scaling into #FollowTheRabbits (Paloma Cantina, Tagliatella Caffe, Sangre Fresca, Bartenders FAQtory, SPb Cocktail Week).',
      why: 'A masterclass in scaling intimacy: starting with found objects and a living weekly menu, then building an entire industry ecosystem.',
      takeaway: 'Warmth, handmade vessels and living rituals scale better than expensive hardware.'
    },
    {
      title: 'City Space & The Horeca Code · Bek Narzi',
      location: 'Moscow & London',
      year: 'World’s 50 Best Bars Pioneer',
      industry: 'Bar Management, Standards & Unit Economics',
      image: 'case-city-space-narzi.jpg',
      context: 'British-Russian hospitality entrepreneur Bek Narzi put City Space Bar into the World’s 50 Best Bars, launched London’s Pachamama, and authored The Horeca Code.',
      what: 'Built a rigorous school of bar management combining five-star standards, station ergonomics, R&D garnishes (such as fruit chips) and unit economics.',
      why: 'Demonstrates that showmanship only survives when backed by iron operational standards and mentorship.',
      takeaway: 'Build a school of people and strict operational standards; the awards and revenue follow.'
    },
    {
      title: 'Sensory Mixology · Artem Talalay',
      location: 'Sochi & Moscow',
      year: 'World Class Russia Winner · Palm Branch Hall of Fame',
      industry: 'Multisensory Mixology · Speed Ergonomics & Gastrophysics',
      image: 'case-sensory-talalay.jpg',
      context: 'Diageo Reserve World Class Russia Winner (2020–2021, winning both Signature Drink and Cocktail Against the Clock) and Palm Branch Hall of Fame member.',
      what: 'Constructs drinks across four deliberate coordinates — taste, aroma, enveloping tactile texture and conceptual colouristics — executed at high-speed competition ergonomics.',
      why: 'Connects sensory gastrophysics directly to real-world Friday-night bar speed.',
      takeaway: 'A masterpiece in a glass must work both as a sensory story and as an ergonomic 60-second build.'
    },
    {
      title: 'Sukiyabashi Jiro · Jiro Ono',
      location: 'Ginza, Tokyo',
      year: '3★ MICHELIN Legend',
      industry: 'Shokunin Mastery · Counter Precision & Pacing',
      image: 'case-jiro-ono.jpg',
      context: 'A 10-seat counter in a Tokyo subway basement led by nonagenarian master Jiro Ono, holding three MICHELIN stars for decades.',
      what: 'A 20-piece nigiri omakase with zero menu distractions, rice kept at 37°C body temperature, and piece proportions subtly adjusted to each guest’s posture and pace.',
      why: 'Proves that absolute mastery of fundamentals and peak–end pacing transcend location and size.',
      takeaway: 'Perfection is not an act of luxury decor; it is relentless daily refinement of the core craft.'
    },
    {
      title: 'Krasota Gastro-Theatre · Boris Zarkov',
      location: 'Moscow & Dubai · White Rabbit Family',
      year: 'Immersive Dining & Gastro-Theatre',
      industry: 'Gastro-Theatre · 360° Scenography, Digital Art & Multisensory Dining',
      image: 'case-krasota-zarkov.jpg',
      context: 'Created by Boris Zarkov (White Rabbit Family), chef Vladimir Mukhin and visual director Anton Nenashev to merge haute cuisine with immersive digital scenography.',
      what: 'A 20-seat circular interactive table surrounded by 360-degree projections, spatial audio and synchronized lighting. Each course is a choreographed scene where visuals on the table surface and walls illuminate the dish’s narrative, culture and ingredients.',
      why: 'Proves that contemporary hospitality can become a total artwork (Gesamtkunstwerk), uniting culinary art, scenography, digital projection and theatrical pacing.',
      takeaway: 'When technology, lighting and scenography serve the culinary story rather than distract from it, dining becomes unforgettable theatre.'
    },
    {
      title: 'Liquid Intelligence · Dave Arnold',
      location: 'New York City',
      year: 'Beverage Science Pioneer',
      industry: 'Beverage Science & Laboratory Cocktail Technique',
      image: 'project-tam-flatlay.jpg',
      context: 'Author of Liquid Intelligence and founder of Booker & Dax, applying scientific rigor to the physics and chemistry of cocktails.',
      what: 'Applies controlled experiments to temperature, dilution, clarification (agar, centrifuge), rapid nitro-infusion and carbonation to make complex beverage craft rigorously repeatable.',
      why: 'Shifts drink-making from superstitious guesswork to measurable, repeatable science where every variable is understood.',
      takeaway: 'Measure and control variables so craft becomes reliable; use science not for show, but to deliver pure guest pleasure.'
    },
    {
      title: 'Noma · René Redzepi',
      location: 'Copenhagen, Denmark',
      year: 'Multiple №1 World’s 50 Best Restaurants',
      industry: 'New Nordic Cuisine · Foraging, Fermentation & Seasonality',
      image: 'project-chicken-connection-kitchen.jpg',
      context: 'Pioneered New Nordic gastronomy through hyper-local wild foraging, koji fermentation and micro-seasonality at Noma.',
      what: 'Redefined the global culinary language by championing native wild produce, game, coastal seaweeds and koji fermentation, building an R&D laboratory (Noma Projects) alongside seasonal menu iterations.',
      why: 'Demonstrates that a regional terroir and deep curiosity can spark a worldwide culinary movement.',
      takeaway: 'Your immediate local terroir contains boundless luxury if you approach it with radical curiosity, patience and fermentation craft.'
    },
    {
      title: 'Tayēr + Elementary · Alex Kratena',
      location: 'Old Street, London',
      year: 'Top-5 World’s 50 Best Bars',
      industry: 'Dual-Concept Hospitality · Casual Tap Bar & Produce-Led R&D Counter',
      image: 'project-detail-nine-lives-bar.jpg',
      context: 'Created by Alex Kratena and Monica Berg, uniting an accessible everyday front bar with a progressive produce-driven backroom.',
      what: 'Elementary serves draft highballs and quick snacks in an open daylight room, while Tayēr operates an industrial U-shaped counter serving daily changing, ingredient-first drinks numbered rather than named.',
      why: 'Solves the dilemma of bar accessibility versus progressive laboratory R&D by creating two distinct stages under one roof.',
      takeaway: 'Democratise great drinks: pair an effortless neighbourhood entrance with a focused R&D counter so both casual guests and connoisseurs feel at home.'
    },
    {
      title: 'Joi Espresso Bar · Egor Tarasenko',
      location: 'Author’s own project',
      year: 'Opened 2025 · OGONEK TEAM',
      industry: 'Espresso bar · Found objects, street sourcing & low-budget scenography',
      image: 'project-joi-bar.jpg',
      context: 'A small espresso bar assembled by the course author almost entirely from found objects, flea markets and second-hand equipment.',
      what: 'Built from street finds and flea-market discoveries: a poster facade, café bulbs, hand-set branding, reconditioned equipment and second-hand furniture without a large budget.',
      why: 'Direct proof that with great desire you do not need a super budget: a clear point of view and resourcefulness build real soul.',
      takeaway: 'With strong vision and desire, you do not need a huge budget. Money buys speed and finish; intention and soul come from your vision.'
    },
    {
      title: 'Pacific · Bar Stations & Equipment Design',
      location: 'Bar equipment design & fabrication studio',
      year: 'Author’s own project',
      industry: 'Bar ergonomics · Technical drawings · Made-to-measure fabrication',
      image: 'project-pacific-station.jpg',
      context: 'Pacific is the course author’s bar-equipment design and fabrication studio: a project that shapes the working environment before a guest ever sees the room.',
      what: 'Designs modular stations and consoles around real service choreography: a sintered-stone top, recessed ice well, speed rails, under-counter glass hanger and mobile castor-mounted furniture, developed through 3D visualisations and workshop-ready technical drawings.',
      why: 'Shows how operations, ergonomics and scenography meet in one designed object. The team works faster and more comfortably while the guest experiences a room that feels resolved.',
      takeaway: 'Design the bar around movement and service sequence. Draw every tool, reach and working surface before the workshop builds it.'
    }
  ],
  projects: {
    eyebrow: 'PROJECTS OF THE AUTHOR',
    title: 'Built, repaired, drawn — and photographed.',
    lead: 'The venues, identities and objects behind this course, documented as working evidence: what was found, what was bought second-hand, what was made by hand. Every photograph was taken on site — in the arcade, behind the counter, on the pavement — not in a showroom.',
    note: 'Primary sources for Module 09 (Budget Realisation & Scenography) and Module 04 (Concept Objects). Students read the archive the way they will later read their own flea-market finds: what was bought, what was found, what was made, and what it cost to keep the story coherent.',
    items: [
      {
        id: 'joi',
        index: '01',
        name: 'Joi Espresso Bar',
        role: 'Espresso bar · Found objects & scenography',
        year: '2025',
        team: 'By OGONEK TEAM',
        moduleId: 'budget',
        moduleNumber: '09',
        image: 'project-joi-bar.jpg',
        tagline: 'A small espresso bar in an old arcade — assembled almost entirely from what the street and the flea markets offered.',
        summary: 'The author’s own venue and the case behind Module 09. Joi opened in 2025: a glass door behind a poster facade, café bulbs strung along the arcade, paper cups stamped with a hand-set logo, a reconditioned brass lever machine and second-hand grinders on a counter that hides more stock than seating. Nothing here came from a single showroom appointment. The room holds together because the story was written first and every object was chosen by the same pair of eyes.',
        facts: [
          ['ROLE', 'Author’s own project · the case behind Module 09'],
          ['OPENED', '2025 · by OGONEK TEAM'],
          ['BUILT FROM', 'Street finds, second-hand equipment, salvage, hand-set signage and glassware'],
          ['IN THE COURSE', 'Module 09 · “Soul before budget” and the live found-object mockup']
        ],
        photos: [
          { file: 'project-joi-arcade.jpg', caption: 'The arcade: vaults, café bulbs and stone floors — the kind of address a small bar can still afford, and the first thing the guest sees.' },
          { file: 'project-joi-facade.jpg', caption: 'The facade as a menu: photographs in the windows, a painted “open” sign, and the opening date — Joi · 2025 BY OGONEK TEAM.' },
          { file: 'project-joi-brand.jpg', caption: 'The brand mark is a date and three letters, set by hand. No agency, no system — but the same logo on every cup.' },
          { file: 'project-joi-cups.jpg', caption: 'Stacks of paper cups behind the bar: the cheapest brand touchpoint in hospitality, used as inventory.' },
          { file: 'project-joi-machine.jpg', caption: 'A brass lever machine on a small counter — the one object worth spending money on, because the guest hears it work.' },
          { file: 'project-joi-grinder.jpg', caption: 'Second-hand grinders, still carrying the roaster’s sticker: Brazil, Colibri. Equipment wears its own history.' },
          { file: 'project-joi-bar.jpg', caption: 'The bar, photographed as the crew works — a red-lit counter, paper, cups and no styling.' },
          { file: 'project-joi-arcade-lights.jpg', caption: 'Café bulbs under the vaults: theatrical light borrowed from the building, not commissioned from a designer.' },
          { file: 'project-joi-arcade-arches.jpg', caption: 'The approach at service time — the sightline that decides whether a passer-by becomes a guest.' }
        ]
      },
      {
        id: 'passie',
        index: '02',
        name: 'Passie Cakes Co.',
        role: 'Cake shop & pastry counter · identity built from props',
        year: '2025–2026',
        team: 'Prop-led interior & hand-drawn identity',
        moduleId: 'experience',
        moduleNumber: '02 & 09',
        image: 'project-passie-wall.jpg',
        tagline: 'A one-room cake shop where the props do the branding: pastel banquettes, a crystal chandelier, flowers and a bear with a birthday cake.',
        summary: 'A tiny venue built on a single promise — cake, made and decorated the same day. The concept lives in the cheapest possible cast: pastel pink booth seating, a second-hand crystal chandelier, lilac cups and old lace-edged china plates, a water jug used as a vase, hand-written gift cards, and one hand-drawn logo of a bear holding a cake, painted straight onto the wall. Guests photograph the wall, the fridge and the table before they photograph the plate.',
        facts: [
          ['ROLE', 'Small-venue scenography · identity through props'],
          ['CONCEPT', 'One product, one colour story, one photographable room'],
          ['THE SET', 'Pastel banquettes · crystal chandelier · flowers · hand-drawn logo'],
          ['IN THE COURSE', 'Module 02 · the “sweet fairy tale” maintained on a small budget']
        ],
        photos: [
          { file: 'project-passie-wall.jpg', caption: 'PASSIE CAKES CO. painted straight onto the plaster — the cheapest signage there is, and the most photographed surface in the room.' },
          { file: 'project-passie-cake.jpg', caption: 'A birthday cake with duck decorations in the display fridge: the product is the window display.' },
          { file: 'project-passie-cheesecake.jpg', caption: 'A slice on an old china plate with a lace edge, a daisy napkin, and a vase that is really a water jug.' },
          { file: 'project-passie-sakura.jpg', caption: 'The same idea at 30 centimetres: a green tray, a lilac cup, a cake card and a glass of water — a table vignette, exactly like the mockup brief.' },
          { file: 'project-passie-room.jpg', caption: 'The room: mirrored tiles, fairy lights, drinks fridge and a counter that doubles as a shop window.' },
          { file: 'project-passie-counter.jpg', caption: 'A chandelier over a paper menu with a cartoon duck: the same room operates at two registers at once.' },
          { file: 'project-passie-window.jpg', caption: 'Seen from the street: tables, chairs and a chandelier — the interior is legible from the pavement.' }
        ]
      },
      {
        id: 'coocoo',
        index: '03',
        name: 'CooCoo Coffee (coffee · croffles · cookies)',
        role: 'Street coffee & dessert concept',
        year: '2025–2026',
        team: 'One alliterative promise, one palette',
        moduleId: 'concepts',
        moduleNumber: '04',
        image: 'project-coocoo-pour.jpg',
        tagline: 'Coffee, croffles, cookies — one alliterative promise, a turquoise facade and a pair of googly eyes on the window.',
        summary: 'A street concept that solves naming, signage, menu and packaging with a single sentence. The turquoise frontage carries a cartoon cup with eyes and the line “WE ARE COOCOO”; inside there is checkered tile, café bulbs strung over the counter, a paper menu taped to the wall and a croffle served on a pink table. Nothing in the room is expensive. Everything in the room says the same three words.',
        facts: [
          ['ROLE', 'Street coffee & dessert concept · graphics-first'],
          ['CONCEPT', 'One alliterative product trio: coffee · croffles · cookies'],
          ['GRAPHICS', 'Logo · window art · paper cups · printed menu boards'],
          ['IN THE COURSE', 'Module 04 · the menu and the cup as takeaway objects']
        ],
        photos: [
          { file: 'project-coocoo-pour.jpg', caption: '“WE ARE COOCOO · COFFEE | CROFFLES | COOKIES”: the whole brand on one paper cup and one pane of glass.' },
          { file: 'project-coocoo-room.jpg', caption: 'The room: checkered tiles, fairy lights, a soft-serve machine and a croffle on a pink table.' },
          { file: 'project-coocoo-bulbs.jpg', caption: 'Café bulbs and a paper menu above the bar — theatrical light on a street-food budget.' },
          { file: 'project-coocoo-team.jpg', caption: 'The frame the brand needs: aprons, flowers and cartoons behind the counter.' },
          { file: 'project-coocoo-menu.jpg', caption: 'A printed board taped to the tiles: transparent pricing, made in an afternoon and replaced in ten minutes.' }
        ]
      },
      {
        id: 'chicken',
        index: '04',
        name: 'Chicken Connection · Moscow',
        role: 'Chicken concept · pilot episode & venue visit',
        year: 'Filmed with Dmitry Konnikov',
        team: 'Food media production',
        moduleId: 'technology',
        moduleNumber: '05',
        image: 'project-chicken-connection-kitchen.jpg',
        tagline: 'A chicken concept seen from inside the pass — and filmed for the pilot episode of a food series.',
        summary: 'A pilot episode shot inside a Moscow chicken venue with Dmitry Konnikov: the open finish pass, the rotisserie, branded delivery boxes and a rooster mascot waiting on the shelf. The camera stands where the kitchen hands stand, so the film shows heat, boxes and the comedy of a full pass at service speed. For a modern food venue the kitchen is not the back of house — it is the content, the queue entertainment and the proof of freshness at once.',
        facts: [
          ['ROLE', 'Food-media pilot · venue visit'],
          ['VENUE', 'Chicken concept · Moscow'],
          ['HOST', 'Dmitry Konnikov'],
          ['IN THE COURSE', 'Module 05 · operations on camera, brand theatre at the pass']
        ],
        photos: [
          { file: 'project-chicken-connection-kitchen.jpg', caption: 'The pass as a stage: branded boxes, rotisserie heat and a rooster mascot waiting on the shelf.' },
          { file: 'project-chicken-connection-pass.jpg', caption: 'Shot from behind the counter: the pilot episode of CHICKEN CONNECTION with Dmitry Konnikov, filmed where the food is finished.' }
        ]
      },
      {
        id: 'pacific',
        index: '05',
        name: 'Pacific',
        role: 'Bar furniture, stations & equipment design',
        year: 'Design & fabrication',
        team: '3D visualisation · technical drawings · production',
        moduleId: 'technology',
        moduleNumber: '05 & 04',
        image: 'project-pacific-station.jpg',
        tagline: 'Bar solutions drawn to be fabricated: blackened steel, sintered stone and glass, specified to the last millimetre.',
        summary: 'A design-and-fabrication project rather than a venue: modular stations and consoles for bars, developed as a set — a working station with a stone top, recessed ice well, speed rails and a glass hanger; a cantilevered console on castors; a wall-mounted server; and a compact bar-top tool cabinet. Everything is delivered as 3D visualisations plus technical drawings a workshop can read, because ergonomics decided behind the bar is atmosphere the guest never notices — until it is missing.',
        facts: [
          ['ROLE', 'Bar furniture & equipment design'],
          ['OUTPUT', '3D visualisations · technical drawings · fabrication'],
          ['MATERIALS', 'Blackened steel · sintered stone · glass · castors'],
          ['IN THE COURSE', 'Modules 05 & 04 · ergonomics as scenography, objects as concept']
        ],
        photos: [
          { file: 'project-pacific-logo.png', caption: 'Pacific — bar solutions: a brand for a workshop rather than a venue.' },
          { file: 'project-pacific-station.jpg', caption: 'The station: stone top, ice well, speed rail, under-counter glass hanger, powder-coated steel body.' },
          { file: 'project-pacific-console.jpg', caption: 'A cantilevered console on castors — the service bar becomes mobile furniture.' },
          { file: 'project-pacific-render.jpg', caption: '“FUTURE OF BARTENDING”: the project the furniture was drawn for.' },
          { file: 'project-pacific-drawing.jpg', caption: 'Technical drawing — a concept only exists once the cabinetmaker can read it.' }
        ]
      },
      {
        id: 'tam',
        index: '06',
        name: 'TAM · TYT — bar objects & merchandise',
        role: 'Bar brand & object design',
        year: 'Product line',
        team: 'Cubes · tools · furniture · textiles',
        moduleId: 'concepts',
        moduleNumber: '04',
        image: 'project-tam-cubes.jpg',
        tagline: 'A bar that leaves the building: cubes, tools, stools and socks designed as souvenirs of a cocktail menu.',
        summary: 'A product line built around a bar concept. Engraved stainless-steel cubes carry the vocabulary of the drinks list — smoky, dirty, fruits, sweet, shake, umami, agave, brandy — so the menu becomes something a guest can hold, stack and take home. Around them: a bar-top tool set with mirror-polished cladding, a flick-style bar blade, a folding stool that packs flat for guest shifts, bar mats and knitted TAM / TYT socks. Merchandise that teaches the menu is worth more than merchandise that decorates a shelf.',
        facts: [
          ['ROLE', 'Bar brand & object design'],
          ['OBJECTS', 'Flavour cubes · tool set · bar blade · folding stool · textiles'],
          ['IDEA', 'Merchandise that teaches the drinks list'],
          ['IN THE COURSE', 'Module 04 · the takeaway object as part of the concept']
        ],
        photos: [
          { file: 'project-tam-cubes.jpg', caption: 'Flavour cubes: smoky · dirty · fruits · sweet · shake · umami · agave · brandy.' },
          { file: 'project-tam-mirror.jpg', caption: 'A stainless-steel bar-top tool set with a mirror-polished panel and a black bar blade.' },
          { file: 'project-tam-flatlay.jpg', caption: 'The same objects in a case: designed to be packed, carried between venues and photographed.' },
          { file: 'project-tam-tool.jpg', caption: 'A flick-style bar blade — the tool bartenders actually keep in a pocket, so it must look like the brand.' },
          { file: 'project-tam-opener.jpg', caption: '“BITTER IS BETTER”: a powder-coated portrait of a bent cocktail spoon, cast into a solid handle.' },
          { file: 'project-tam-stool.jpg', caption: 'A folding stool with a matte frame: guest-shift furniture that fits in a bag.' },
          { file: 'project-tam-socks.jpg', caption: 'TAM / TYT socks — the cheapest brand touchpoint in hospitality, done properly.' }
        ]
      },
      {
        id: 'details',
        index: '07',
        name: 'Found objects & small details',
        role: 'Research file for the mockup brief',
        year: 'Collected across the venues',
        team: 'Flea markets · salvage · the street',
        moduleId: 'budget',
        moduleNumber: '09',
        image: 'project-detail-nine-lives.jpg',
        tagline: 'The atmosphere lives in the small things: a matchbox, a chessboard, a pasted poster, a glass of parsley, a lemon press on the pavement.',
        summary: 'A collecting file of details observed across the venues in this archive: flea-market chess sets and resin ashtrays, glassware standing in red light, a chalkboard drinks list, a vintage television reused as a planter, a black cat poster reading NINE LIVES, NONE LEFT, an ice press working on the pavement outside, and a menu covered in hand-written stickers. These are the objects students are asked to hunt for before they are asked to design anything: cheap, specific, already full of someone else’s history.',
        facts: [
          ['ROLE', 'Research file · sources for the found-object mockup'],
          ['SOURCES', 'Flea markets · demolition salvage · city pavements'],
          ['USE', 'Module 09 · object hunting before drawing'],
          ['RULE', 'Buy the story, not the finish']
        ],
        photos: [
          { file: 'project-detail-nine-lives.jpg', caption: 'NINE LIVES, NONE LEFT: a pasted poster, a toy CCTV camera and a vintage television parked on the counter.' },
          { file: 'project-detail-nine-lives-bar.jpg', caption: 'The same room from behind the bar: red brick, an enamel lampshade and a wall that advertises itself.' },
          { file: 'project-detail-chess.jpg', caption: 'A flea-market chessboard, a resin ashtray, a green smoothie: the table is the concept.' },
          { file: 'project-detail-chess-morning.jpg', caption: 'The same table in morning light — two drinks, two guests, no styling.' },
          { file: 'project-detail-342.jpg', caption: 'A wooden counter, bunting lights and a menu covered in hand-written stickers.' },
          { file: 'project-detail-street-press.jpg', caption: 'A citrus press working on the pavement: production moves outside and becomes the show.' },
          { file: 'project-detail-street-press-2.jpg', caption: 'Second-hand press, second-hand board, one pair of hands — the cheapest theatre there is.' },
          { file: 'project-detail-backbar.jpg', caption: 'A backbar shelf: bottles, trade magazines, a metal teapot and a cap left by a guest.' }
        ]
      }
    ]
  },
  updates: [
    {
      tag: 'PROJECTS OF THE AUTHOR · PHOTO ARCHIVE',
      title: 'Forty-three new photographs: the author’s own venues, objects and studio work',
      date: 'September 2026',
      text: 'The app carries a photographic archive of the author’s own practice: Joi Espresso Bar (2025 · OGONEK TEAM), Passie Cakes Co., CooCoo Coffee, Chicken Connection (Moscow, filmed with Dmitry Konnikov), Pacific and the TAM / TYT object line — plus a collecting file of found details. Open About the author to see selected projects and reach the full archive; Module 09 uses the same photographs as working evidence.'
    },
    {
      tag: 'INDUSTRY LEADERS & 50 BEST MENUS',
      title: 'Fourteen industry figures & World’s 50 Best menu concepts',
      date: 'September 2026',
      text: 'The featured practitioners now include Hiroyasu Kayama, Denis Bobkov, Rémy Savage, Simone Caporale (Sips Barcelona), Igor Zernov, Artem Talalay, Bek Narzi, Jiro Ono, Boris Zarkov (White Rabbit Family & Krasota), René Redzepi, Dave Arnold (author of Liquid Intelligence) and Alex Kratena — mapped to concept design, sensory R&D, gastro-theatre, entrepreneurship, education and responsible leadership.'
    },
    {
      tag: 'LIVE FOUND-OBJECT MOCKUP',
      title: 'Mockup from real improvised objects, antique tableware & candles',
      date: 'September 2026',
      text: 'Instead of a paper model, every student stages a real tactile mockup from found and improvised objects: antique tableware and vintage glassware, dripping candles, flea-market props, and a physical prototype of their 50 Best-style Menu Concept.'
    },
    {
      tag: 'TRIBUTE & ACCESS',
      title: 'Personal password via Tribute & in-app assignment feedback',
      date: 'September 2026',
      text: 'Each student receives an automatically generated 1-per-person password through Tribute Digital Product checkout, unlocking immediate access to all modules and lessons. Practical assignments and files can be submitted inside the app (or sent to egor.tarasenko@him-mail.ch) and receive feedback via the Admin Panel or Admin Bot.'
    }
  ],
  imageCredits: {
    statement: 'Every photograph in the elective is listed with its source and rights status. Photographs of the author’s own venues, objects and portraits are © Egor Tarasenko and are published from his personal archive. Photographs of third-party industry figures and venues are editorial reference images © their respective photographers and venues, used only for educational commentary inside this password-protected course; where no rights-cleared venue photograph exists, an illustrative photograph from the author’s archive is used and explicitly marked — it does not depict the venue discussed. The HIM Business School logo remains the property of Swiss Education Group. Rights holders may request removal at any time and the image will be taken down promptly.',
    contact: 'egor.tarasenko@him-mail.ch',
    files: [
      { file: 'web-insider-hall.jpg', short: 'PHOTO · INSIDER BAR LAB · MOSCOW', credit: 'Insider Bar Lab (Sretenka 22/1, Moscow) — © Insider Bar / @insider.bar.lab', license: 'Public venue photograph · educational commentary · takedown on request', source: 'https://www.tripadvisor.com/LocationPhotoDirectLink-g298484-d14015692-i539874042-Insider_Bar-Moscow_Central_Russia.html' },
      { file: 'web-insider-station.jpg', short: 'PHOTO · INSIDER BAR LAB · MOSCOW', credit: 'Insider Bar Lab (Sretenka 22/1, Moscow) — © Insider Bar / @insider.bar.lab', license: 'Public venue photograph · educational commentary · takedown on request', source: 'https://www.tripadvisor.com/LocationPhotoDirectLink-g298484-d14015692-i539874042-Insider_Bar-Moscow_Central_Russia.html' },
      { file: 'web-insider-lab.webp', short: 'PHOTO · INSIDER BAR LAB · MOSCOW', credit: 'Insider Bar Lab cocktail laboratory (Sretenka 22/1, Moscow) — © Insider Bar / @insider.bar.lab', license: 'Public venue photograph via the Cocktail Pilgrim feature · educational commentary · takedown on request', source: 'https://questamiamilano.com/cocktailpilgrim/insidermoscow' }
    ],
    illustrative: [
      { file: 'project-detail-nine-lives-bar.jpg', note: 'Illustrative bar-counter study from the author’s archive, used in the Alex Kratena · Tayier + Elementary case file. It does not depict the venue.' },
      { file: 'project-chicken-connection-kitchen.jpg', note: 'Illustrative kitchen photograph from the author’s archive (Chicken Connection shoot, Moscow), used in the René Redzepi · Noma case file. It does not depict the venue.' },
      { file: 'project-tam-flatlay.jpg', note: 'Illustrative R&D flat-lay from the author’s TAM / TYT object line, used in the Dave Arnold · Liquid Intelligence case file. It does not depict a laboratory.' }
    ],
    groups: [
      { prefix: ['project-', 'author-'], short: 'PHOTO · EGOR TARASENKO ARCHIVE', credit: '© Egor Tarasenko — author’s personal archive', license: 'All rights reserved · published with the author’s permission', source: 'Original camera files kept in the course repository (repository root)' },
      { prefix: ['case-', 'figure-'], short: 'PHOTO · EDITORIAL REFERENCE · © RESPECTIVE PHOTOGRAPHER', credit: '© respective photographers and venues — editorial reference images', license: 'Educational commentary inside the password-protected elective · takedown requests honoured', source: 'Curated from public press and website materials, September 2026' },
      { prefix: ['him-logo-white.png'], short: '© SWISS EDUCATION GROUP / HIM', credit: 'HIM Business School logo · © Swiss Education Group', license: 'Trademark · used for identification only', source: 'swisseducation.com — HIM Business School page' }
    ]
  }
};
