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
      name: 'Jiro Ono (Дзиро Оно)',
      role: 'Shokunin Master · Chef-Owner',
      venues: 'Sukiyabashi Jiro · Ginza, Tokyo (3★ MICHELIN)',
      moduleId: 'future',
      moduleNumber: '01 & 03',
      block: 'Hospitality Futures · Rankings, Mastery & Counter Precision',
      image: 'horeca-chefs-counter.jpg',
      summary: 'A 10-seat basement counter inside a Ginza subway station that held three MICHELIN stars for decades. No printed menu choices, no appetizers, no distractions — only a 20-piece nigiri progression timed to the guest’s breathing and hand movement.',
      lessonAngle: 'Proves that world-historical prestige does not depend on square metres or opulent real estate. Mastery (shokunin), radical focus on one format, and micro-adjustments (rice temperature at 37°C body heat, piece size adjusted to each guest) turn a 30-minute counter seating into a global benchmark.',
      takeaway: 'Radical subtraction and daily repetition of fundamentals create an authority no marketing budget can buy.'
    },
    {
      id: 'erik-lorincz',
      name: 'Erik Lorincz (Эрик Лоринц)',
      role: 'World Class Global Winner · Master Bartender & Restaurateur',
      venues: 'American Bar at The Savoy (№1 World’s 50 Best Bars) · Kwānt · Mayfair, London',
      moduleId: 'experience',
      moduleNumber: '02 & 06',
      block: 'Experience Design · Five-Star Choreography, Vintage Glassware & 50 Best Menus',
      image: 'horeca-interior-design.jpg',
      summary: 'Diageo Reserve World Class Global Winner (2010), 10th Head Bartender of The Savoy’s American Bar (which he led to World №1), and founder of Kwānt in London.',
      lessonAngle: 'Bridges grand European five-star hotel ritual with contemporary botanical science, antique crystal and museum-grade menu storytelling. At Kwānt, guests step off Mayfair pavement into a cinematic mid-century salon where posture, vintage glassware, candlelit brass and effortless table choreography keep the guest inside the dream.',
      takeaway: 'Service choreography and tactile vessels are spatial design in motion: the way a bartender moves, pours and serves makes luxury believable.'
    },
    {
      id: 'artem-talalay',
      name: 'Artem Talalay (Артём Талалай)',
      role: 'World Class Russia Winner · Bartender of the Year Hall of Fame',
      venues: 'London Bar (Sochi) · Diageo Reserve World Class · Palm Branch Hall of Fame',
      moduleId: 'neuro',
      moduleNumber: '03 & 05',
      block: 'Neurogastronomy & R&D · Multisensory Mixology & Speed Ergonomics',
      image: 'horeca-neurogastronomy-serve.jpg',
      summary: 'Winner of Diageo Reserve World Class Russia (2020–2021), taking first place in both Signature Drink and Cocktail Against the Clock, and inductee of the Palm Branch "Bartender of the Year" Hall of Fame.',
      lessonAngle: 'Treats every cocktail through four deliberate coordinates — taste, aroma, tactile texture (enveloping mouthfeel) and visual colouristics — while proving in "Against the Clock" that high-concept gastrophysics only works when backed by razor-sharp station ergonomics and speed under pressure.',
      takeaway: 'Mixology is not blind trend-chasing; it is aligning flavour, aroma, texture and colour with the venue’s concept at operational speed.'
    },
    {
      id: 'remy-savage',
      name: 'Rémy Savage (Реми Саваж)',
      role: 'Concept Architect · Pioneer of 50 Best Conceptual Menus',
      venues: 'A Bar with Shapes for a Name (London) · Bar Nouveau (Paris) · Abstract (Lyon) · Little Red Door · Artesian',
      moduleId: 'concepts',
      moduleNumber: '04 & 06',
      block: 'Restaurant & Bar Concepts · 50 Best Menu Architecture & Art Manifestos',
      image: 'horeca-ai-mixology-lab.jpg',
      summary: 'World Class Bartender of the Year (2014) who revolutionised World’s 50 Best Bar menus — from wordless illustrated comic-book and architectural menus at Little Red Door to Bauhaus geometric manifestos at Shapes and Art Nouveau organic lines at Bar Nouveau.',
      lessonAngle: 'Demonstrates how a menu and a bar concept act as a single artistic manifesto: guests do not read a list of ingredients; they choose an emotion, a shape, a painting or a philosophical idea. Every vessel, chair, candle, ice block and uniform obeys that single rulebook.',
      takeaway: 'A great 50 Best menu is not a price list — it is a physical artefact that teaches the guest how to read your world.'
    },
    {
      id: 'bek-narzi',
      name: 'Bek Narzi (Бек Нарзи)',
      role: 'Hospitality Entrepreneur · Pioneer of Bar Management & Educator',
      venues: 'City Space Bar (Moscow, World’s 50 Best) · Pachamama (London) · Author of «Кодекс хореканца» & «7 часов до взлёта»',
      moduleId: 'technology',
      moduleNumber: '05 & 08',
      block: 'Operations, Systems & Entrepreneurship · The Horeca Code',
      image: 'horeca-tech-operations.jpg',
      summary: 'British-Russian entrepreneur who put Moscow’s City Space Bar onto the world cocktail map, built London hospitality projects (Pachamama), mentored a generation of bar leaders, and codified operational discipline in "The Horeca Code" («Кодекс хореканца»).',
      lessonAngle: 'Insists that hospitality romance collapses without iron operational standards, cost control, station ergonomics, sales psychology and team discipline. His City Space school trained future founders (including Igor Zernov) and invented bar staples such as dehydrated fruit-chip garnishes alongside hotel pastry chefs.',
      takeaway: 'Creative charisma opens a venue once; standards, unit economics and a disciplined school of people keep it open for years.'
    },
    {
      id: 'hiroyasu-kayama',
      name: 'Hiroyasu Kayama (Хироясу Каяма)',
      role: 'Farm-to-Glass Pioneer · Master Apothecary Bartender',
      venues: 'Bar Benfiddich · Shinjuku, Tokyo (№18 World’s 50 Best Bars / №9 Asia’s 50 Best Bars)',
      moduleId: 'fnb',
      moduleNumber: '07 & 03',
      block: 'Food & Beverage Futures · Farm-to-Counter Apothecary & Zero-Menu Craft',
      image: 'horeca-sustainable-terroir.jpg',
      summary: 'Founder of the 16-seat Bar Benfiddich in Tokyo ("Ben" = mountain = Yama, "Fiddich" = deer = Ka → Kayama). Grows wormwood, fennel, juniper, chamomile, mint and yuzu on his family farm in Chichibu and distils his own absinthe and botanical elixirs.',
      lessonAngle: 'Works with no printed cocktail menu: the candlelit apothecary counter of antique jars, mortar and pestle, fresh herbs and vintage glassware IS the menu. Guests converse with Kayama while he crushes botanicals and builds bespoke drinks from soil to glass.',
      takeaway: 'Owning the raw ingredient from soil to glass — and serving it in antique apothecary vessels — creates an irreproducible signature.'
    },
    {
      id: 'igor-zernov',
      name: 'Igor Zernov (Игорь Зернов)',
      role: 'Co-Founder of #FollowTheRabbits · Community & Concept Builder',
      venues: 'El Copitas Bar (№8 World’s 50 Best Bars) · Paloma Cantina · Tagliatella Caffe · Sangre Fresca · Bartenders FAQtory · SPb Cocktail Week',
      moduleId: 'entrepreneurship',
      moduleNumber: '08 & 04',
      block: 'Entrepreneurship & Living Menus · From Hidden Table to Global Ecosystem',
      image: 'horeca-craft-bar.jpg',
      summary: 'Alumnus of Bek Narzi’s City Space school and co-founder of #FollowTheRabbits. Started El Copitas in a hidden St. Petersburg courtyard around one communal table, candles, antique Mexican artefacts, a hand-drawn weekly chalkboard menu and a tiny budget — rising to №8 in The World’s 50 Best Bars.',
      lessonAngle: 'Shows how a ritual-driven micro-concept (welcome taco and copita of mezcal in handmade ceramic vessels, living weekly menu, radical warmth) scales into an entire hospitality ecosystem: Tagliatella Caffe, Paloma Cantina, Sangre Fresca, Bartenders FAQtory and SPb Cocktail Week.',
      takeaway: 'Start with a communal ritual, real tactile objects and a tight team culture; scale by building distinct concepts and educating the market.'
    },
    {
      id: 'denis-bobkov',
      name: 'Denis Bobkov (Денис Бобков)',
      role: 'Co-Founder of Pub Life Group · Master of Salvage & Antique Scenography',
      venues: 'Black Swan Pub & Shop · Bambule · Abbey Players · The Bix · Tap & Barrel · Drunken Duck',
      moduleId: 'budget',
      moduleNumber: '09 & 02',
      block: 'Budget Realisation & Scenography · Antique Tableware, Candles & Found Worlds',
      image: 'horeca-atmosphere-candle.jpg',
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
      image: 'horeca-concept-pitch.jpg',
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
          practitioners: ['Jiro Ono (Дзиро Оно)', 'Igor Zernov (Игорь Зернов)'],
          challenge: 'Practical Assignment 01: Choose one real shift in guest behaviour and analyse one benchmark venue through the course’s four lenses (trend, atmosphere, sensory memory, ranking potential). Compare how Jiro Ono’s precision model or Igor Zernov’s community model applies to your future venue concept. Attach your file/notes inside the app (or send to egor.tarasenko@him-mail.ch).'
        }
      ]
    },
    {
      id: 'experience',
      number: '02',
      title: 'Experience Design',
      description: 'Explore how space, service choreography, antique vessels, candlelight and sound keep the “sweet fairy tale” intact — with Erik Lorincz (The Savoy / Kwānt) and Denis Bobkov (Black Swan / Bambule).',
      image: 'horeca-interior-design.jpg',
      practitioners: ['Erik Lorincz (American Bar at The Savoy · Kwānt)', 'Denis Bobkov (Pub Life Group · Black Swan · Bambule)'],
      lessons: [
        {
          id: 'atmosphere',
          title: 'Designing atmosphere & the sweet fairy tale',
          duration: '16 min',
          intro: 'Atmosphere is not decoration. It is the cumulative effect of hundreds of tactile choices — light, antique tableware, sound and posture — made legible to a guest through a single evening.',
          body: 'Think of a bar or a restaurant as a sweet fairy tale: for two hours the guest agrees to believe in a world you have built, where the candle flame is warm, the noise of the street disappears and every plate, fork and glass on the table belongs to the story. The spell is fragile. One wrong detail — a harsh overhead LED, a cheap plastic tray, a dirty door handle, a ringtone from the service station, a visible POS printer — wakes the guest up instantly, and the rest of the evening is spent in a room rather than in a dream. Watch how two masters guard that spell. In London, Erik Lorincz (World Class Global Champion, former Head Bartender of The Savoy’s American Bar and founder of Kwānt) treats service choreography and vintage crystal as spatial design: the posture of the bartender, the acoustic snap of the tin, the weight of antique glassware and the transition from Mayfair street to mid-century tropical salon. In Moscow, Denis Bobkov (Pub Life Group — Black Swan, Bambule, The Bix, Abbey Players) constructs multi-room theatrical labyrinths filled with real antique silverware, dripping wax candles, vintage porcelain and reclaimed church doors where every object keeps the guest inside the narrative.',
          ideas: [
            'A venue is a sweet fairy tale: any small detail (a harsh light, a plastic tray, a visible printer) can instantly wake the guest from the dream.',
            'Erik Lorincz (The Savoy / Kwānt): service choreography, posture and vintage glassware weight are part of spatial architecture.',
            'Denis Bobkov (Black Swan / Bambule): real candles, antique tableware and sequential hidden rooms immerse the guest deeper than any modern renovation.',
            'Back-of-house must never leak into the story; continuity across sight, sound, scent and touch is the craft.'
          ],
          case: 'Kwānt & The Savoy (Erik Lorincz, London) · Black Swan & Bambule (Denis Bobkov) · Himkok (Oslo)',
          practitioners: ['Erik Lorincz (Эрик Лоринц)', 'Denis Bobkov (Денис Бобков)'],
          challenge: 'Practical Assignment 02: Map three scenes for your venue concept (arrival, peak moment, farewell). Specify lighting (candles/warm lamps), sound (BPM), scent, antique/custom tableware and service choreography inspired by Erik Lorincz or Denis Bobkov — and list three “fairy-tale breakers” you will eliminate. Submit your file/text inside the app for admin feedback.'
        }
      ]
    },
    {
      id: 'neuro',
      number: '03',
      title: 'Neurogastronomy',
      description: 'Understand how perception, gastrophysics, vessel weight and multisensory design shape flavour — through Artem Talalay, Jiro Ono and Hiroyasu Kayama.',
      image: 'horeca-neurogastronomy-serve.jpg',
      practitioners: ['Artem Talalay (World Class Russia Winner)', 'Jiro Ono (Sukiyabashi Jiro)', 'Hiroyasu Kayama (Bar Benfiddich)'],
      lessons: [
        {
          id: 'perception',
          title: 'The senses at the table, vessel weight & flavour architecture',
          duration: '16 min',
          intro: 'Flavour is experienced through more than taste. Heavy antique silver, thin crystal, candlelit shadows, aroma, texture and sound all construct what the brain perceives.',
          body: 'Gastrophysics (Charles Spence) proves that the brain assembles flavour from every sense before the first sip or bite: the weight of an antique spoon, the texture of handmade ceramics, the crackle of ice or the scent of crushed herbs. Artem Talalay — Diageo Reserve World Class Russia Winner and Palm Branch Hall of Fame bartender — formulates modern mixology around four inseparable coordinates: taste balance, aromatic cloud, enveloping tactile texture (mouthfeel) and colouristics written into the venue’s concept. In Tokyo, Hiroyasu Kayama (Bar Benfiddich) engages the guest’s ears and nose first by grinding fresh Chichibu farm herbs and wormwood in a mortar right across the candlelit counter, serving elixirs in antique apothecary glass. And at Sukiyabashi Jiro, Jiro Ono engineers the peak–end rule by brushing shoyu onto each piece himself, serving shari (sushi rice) at human body temperature (37°C), and pacing the 20-piece sequence like a three-act concert.',
          ideas: [
            'Artem Talalay’s four coordinates of a serve: taste, aroma, enveloping texture and conceptual colouristics.',
            'Vessel gastrophysics: antique porcelain, heavy silverware and vintage cut crystal directly alter perceived richness and value.',
            'Hiroyasu Kayama (Bar Benfiddich): freshly crushed botanicals and audible mortar craft prime olfactory perception before the first sip.',
            'Jiro Ono (Sukiyabashi Jiro): temperature precision (37°C rice) and the peak–end rule turn 20 bites into a lasting memory.'
          ],
          case: 'Artem Talalay’s World Class Signature Serves · Bar Benfiddich (Hiroyasu Kayama) · Sukiyabashi Jiro',
          practitioners: ['Artem Talalay (Артём Талалай)', 'Hiroyasu Kayama (Хироясу Каяма)', 'Jiro Ono (Дзиро Оно)'],
          challenge: 'Practical Assignment 03: Design three signature serves or dishes for your concept using Artem Talalay’s four coordinates (taste, aroma, texture, colour), specify the exact vessel/tableware (antique, ceramic, crystal) for each, and describe one pre-sip sensory ritual inspired by Hiroyasu Kayama or Jiro Ono. Attach your assignment file for admin confirmation.'
        }
      ]
    },
    {
      id: 'concepts',
      number: '04',
      title: 'Restaurant & Bar Concepts & 50 Best Menu Breakdown',
      description: 'Deconstruct how the World’s 50 Best Bars & Restaurants build concepts and physical menu artefacts — learning from Rémy Savage, Igor Zernov, Bar Leone and Tuju.',
      image: 'horeca-craft-bar.jpg',
      practitioners: ['Rémy Savage (Little Red Door · Shapes · Bar Nouveau)', 'Igor Zernov (El Copitas · Tagliatella Caffe · Paloma Cantina)'],
      lessons: [
        {
          id: 'point-of-view',
          title: 'Concept manifestos & deconstructing The World’s 50 Best menus',
          duration: '18 min',
          intro: 'In the World’s 50 Best Bars and Restaurants, the menu is never a laminated price sheet. It is the concept made touchable — a physical object that sets the rules of the room.',
          body: 'A compelling venue connects audience, occasion, offer, space and economics under one unmistakable idea — and proves that idea the moment the guest touches the menu. Look at how the World’s 50 Best leaders engineer menu concepts: (1) Rémy Savage turned the cocktail menu into an art discipline: at Little Red Door (Paris), he replaced drink descriptions with a wordless comic book and architectural drawings where guests ordered by visual emotion; at A Bar with Shapes for a Name (London), the menu is a pure Bauhaus design manifesto of primary shapes (triangle, square, circle); at Bar Nouveau, it echoes Art Nouveau craftsmanship. (2) Bar Leone (Hong Kong, №1 World’s 50 Best Bars) created the "Cocktail Popolari" living archive — deceptively classic Italian neighbourhood cards backed by radical transparency of ingredients. (3) Igor Zernov at El Copitas (№8 World’s 50 Best Bars) rejected static printing altogether for a living chalkboard menu redrawn every week around fresh batches, while at Tagliatella Caffe the menu works as an instant Italian aperitivo postcard. (4) Tuju (São Paulo, Art of Hospitality 2026) structures its tasting menus as meteorological research notebooks ("Rain", "Wind", "Drought"). When you design your venue, your menu concept must be a real physical artefact that belongs on the table next to your candles and glassware.',
          ideas: [
            '50 Best Menu Archetypes: the Art Manifesto (Rémy Savage), the Living Weekly Chalkboard (Igor Zernov / El Copitas), the Neighbourhood Archive (Bar Leone), the Climate Notebook (Tuju) and the Zero-Menu Apothecary (Hiroyasu Kayama).',
            'Menu psychology & architecture: choice limit (8–14 items), flavour/mood axes, tactile paper/material weight, no currency-sign columns.',
            'Rémy Savage (Shapes / Bar Nouveau / Little Red Door): let one conceptual rule govern the menu object, the glassware, the furniture and the batching.',
            'Igor Zernov (#FollowTheRabbits): each venue in a group must own a distinct ritual, menu format and occasion.'
          ],
          case: '50 Best Menu Breakdown: Little Red Door & Shapes (Rémy Savage) · El Copitas (Igor Zernov) · Bar Leone · Tuju',
          practitioners: ['Rémy Savage (Реми Саваж)', 'Igor Zernov (Игорь Зернов)'],
          challenge: 'Practical Assignment 04 (Concept & 50 Best Menu Breakdown): Analyse two menu concepts from The World’s 50 Best Bars/Restaurants (e.g. Rémy Savage, El Copitas, Bar Leone, Paradiso, Tuju) and design the physical Menu Concept for your own venue (structure, tactile material, naming rules, pricing presentation, 6–10 items). Attach your menu concept draft/photos for admin review.'
        }
      ]
    },
    {
      id: 'technology',
      number: '05',
      title: 'Technology & Automation',
      description: 'Consider where technology, station ergonomics and operational standards improve speed and margins — with Bek Narzi and Artem Talalay.',
      image: 'horeca-tech-operations.jpg',
      practitioners: ['Bek Narzi (City Space Bar · «Кодекс хореканца»)', 'Artem Talalay (World Class Speed & Ergonomics)'],
      lessons: [
        {
          id: 'automation',
          title: 'Automation, ergonomics & the Horeca Code',
          duration: '15 min',
          intro: 'Technology and ergonomics should not simply make hospitality faster. They should free the team to be more human with the guest.',
          body: 'The right systems remove friction behind the scenes while keeping the machinery invisible in the candlelit dining room. Bek Narzi — founder of Moscow’s legendary City Space Bar (World’s 50 Best Bars), London’s Pachamama, and author of «Кодекс хореканца» ("The Horeca Code") — proved that world-class bar theatre collapses without hard operational engineering: station ergonomics, prep tech (from rotary evaporators and clarification to dehydrated fruit garnishes co-created with Swissôtel pastry chefs), inventory control and check-average discipline. Artem Talalay demonstrated the physical side of this in World Class’s "Cocktail Against the Clock" challenge: when prep, batching and speed-rail geometry are engineered to the centimetre, a bartender can deliver ten complex, balanced serves in minutes without breaking eye contact or hospitality warmth.',
          ideas: [
            'Automate repetition and prep; protect moments where human attention creates emotional value.',
            'Bek Narzi («Кодекс хореканца» / City Space): iron operational standards, cost control and station ergonomics are the backbone of hospitality.',
            'Artem Talalay ("Against the Clock"): speed-rail ergonomics and smart pre-batching allow high craft at peak Friday volume.',
            'Hide the machinery: technology that guests can see working is stage scenery that broke.'
          ],
          case: 'City Space Bar & «Кодекс хореканца» (Bek Narzi) · Speed-Rail & Prep R&D (Artem Talalay)',
          practitioners: ['Bek Narzi (Бек Нарзи)', 'Artem Talalay (Артём Талалай)'],
          challenge: 'Practical Assignment 05: Build a "Human / Machine Matrix" for 10 touchpoints of your venue’s evening, plus a station ergonomics & prep plan inspired by Bek Narzi’s Horeca Code and Artem Talalay’s speed principles. Upload your file/notes for admin confirmation.'
        }
      ]
    },
    {
      id: 'ai',
      number: '06',
      title: 'AI in Hospitality',
      description: 'Assess emerging AI workflows, creative briefs and operational forecasting — contrasting algorithmic tools with the human authorship of Rémy Savage and Erik Lorincz.',
      image: 'horeca-ai-mixology-lab.jpg',
      practitioners: ['Rémy Savage (Conceptual Authorship)', 'Erik Lorincz (World Class Jury & Bespoke Craft)'],
      lessons: [
        {
          id: 'human-ai',
          title: 'AI as a creative and operational tool',
          duration: '17 min',
          intro: 'AI can help teams generate options, prototype menu visuals, forecast demand and structure R&D briefs. It cannot own the responsibility for what a hospitality business promises.',
          body: 'From Diageo World Class challenges (where bartenders translated AI-generated visual art into Don Julio 1942 sensory serves) to demand forecasting, menu engineering and prep scheduling, AI expands a small team’s capacity. Yet as Rémy Savage and Erik Lorincz demonstrate in their laboratories in London and Paris, an algorithm can suggest flavour pairings or visual compositions, but only a human author can decide why a drink exists, how an antique glass feels in the hand, and how a host reads a tired guest at 11 p.m. Use AI to compress back-office analysis and widen creative exploration, then edit ruthlessly through your own taste and ethical rules.',
          ideas: [
            'Use AI to widen R&D exploration, menu prototyping and demand forecasting, then apply human taste and editorial judgement.',
            'World Class AI Briefs & Erik Lorincz: AI can spark a visual or flavour hypothesis, but execution lives in glass, ice and hospitality.',
            'Rémy Savage: never mistake fluent algorithmic output for a real philosophical point of view.',
            'Commit to clear ethical boundaries around guest data, team scheduling and creative authorship.'
          ],
          case: 'World Class AI Beverage Brief · Conceptual Laboratories of Rémy Savage & Erik Lorincz',
          practitioners: ['Rémy Savage (Реми Саваж)', 'Erik Lorincz (Эрик Лоринц)'],
          challenge: 'Practical Assignment 06: Define your venue’s AI & Ethics Charter: 3 workflows where AI saves time/money (forecasting, R&D flavour matrix, menu testing), 2 areas where AI is strictly banned to protect human hospitality, and 1 AI-assisted creative brief edited through Rémy Savage’s or Erik Lorincz’s lens. Submit for admin review.'
        }
      ]
    },
    {
      id: 'fnb',
      number: '07',
      title: 'Food & Beverage Futures',
      description: 'Explore farm-to-glass mixology, hyper-seasonal terroir and zero-menu personalisation through Hiroyasu Kayama (Bar Benfiddich, Tokyo) and Tuju (São Paulo).',
      image: 'horeca-sustainable-terroir.jpg',
      practitioners: ['Hiroyasu Kayama (Bar Benfiddich, Tokyo)'],
      lessons: [
        {
          id: 'new-formats',
          title: 'The next table & Hiroyasu Kayama’s farm-to-glass apothecary',
          duration: '15 min',
          intro: 'The future of food and beverage belongs to operators who control their raw narrative — from soil and botanical harvest to the final serve across the candlelit counter.',
          body: 'When every bar in a city buys the same bottles from the same three distributors, differentiation dies. In Shinjuku, Tokyo, Hiroyasu Kayama built Bar Benfiddich (№18 World’s 50 Best Bars / №9 Asia’s 50 Best Bars) around a radical answer: he farms his own land in Chichibu (Saitama Prefecture), growing wormwood, fennel, anise, juniper, chamomile, mint, plums and yuzu. He distils and infuses his own absinthe, amari and botanical spirits. Even the name encodes his roots: "Ben" (mountain = yama) + "Fiddich" (deer = ka) = Kayama. Inside the 16-seat apothecary bar there is no printed menu — Kayama talks with each guest among antique jars and candlelight and composes from scratch. Pair this with São Paulo’s Tuju (Art of Hospitality 2026), where menus follow seasonal rain, wind and drought cycles. Both show that the future of F&B is hyper-personal, terroir-rooted and impossible to copy-paste.',
          ideas: [
            'Hiroyasu Kayama (Bar Benfiddich): grow or craft your own core ingredients so your flavour signature cannot be bought from a catalogue.',
            'Zero-menu apothecary dialogue turns ordering from a transaction into a bespoke consultation.',
            'Local terroir and seasonal cycles (Chichibu botanicals at Benfiddich, climate menus at Tuju) create authentic scarcity.',
            'Scale is optional: a 16-seat room with high integrity can influence the entire global industry.'
          ],
          case: 'Bar Benfiddich (Hiroyasu Kayama, Tokyo) · Tuju (São Paulo)',
          practitioners: ['Hiroyasu Kayama (Хироясу Каяма)'],
          challenge: 'Practical Assignment 07: Design the F&B & Menu core of your concept (5 key dishes/serves + pricing logic). Include at least two "house-grown / house-made" signature preparations inspired by Hiroyasu Kayama’s Bar Benfiddich that no competitor can buy ready-made. Submit your file/notes for admin confirmation.'
        }
      ]
    },
    {
      id: 'entrepreneurship',
      number: '08',
      title: 'Entrepreneurship',
      description: 'Move from a strong idea to an operationally grounded hospitality business and school of talent — learning from Bek Narzi and Igor Zernov.',
      image: 'horeca-concept-pitch.jpg',
      practitioners: ['Bek Narzi (City Space · Pachamama · «Кодекс хореканца»)', 'Igor Zernov (#FollowTheRabbits · El Copitas · Bartenders FAQtory)'],
      lessons: [
        {
          id: 'from-idea',
          title: 'From idea to operating model & talent ecosystem',
          duration: '18 min',
          intro: 'A hospitality business is a promise delivered repeatedly by a team within real financial constraints. Great founders build not just a room, but a school of people.',
          body: 'Look at one of the most instructive lineages in contemporary bar entrepreneurship: Bek Narzi and his former protégé Igor Zernov. At Moscow’s City Space Bar and later in London (Pachamama) and his books «Кодекс хореканца» and «7 часов до взлёта», Bek Narzi established the entrepreneurial fundamentals: P&L literacy, guest psychology, PR audacity, and treating the bar team as a first-league sports squad where discipline creates stars. Igor Zernov absorbed that school and, together with Artyom Peruk and Nikolay Kiselyov, launched El Copitas on a shoestring budget — turning a hidden Thursday-to-Saturday speakeasy into #FollowTheRabbits: a group encompassing El Copitas (№8 World’s 50 Best Bars), Paloma Cantina, Tagliatella Caffe, Sangre Fresca, the Bartenders FAQtory academy and Saint-Petersburg Cocktail Week. Their lesson is clear: test assumptions cheaply, build a fanatical team culture, and turn education into your growth engine.',
          ideas: [
            'Bek Narzi’s entrepreneurial rule: creative storytelling must sit on top of unit economics, sales training and iron discipline.',
            'Igor Zernov (#FollowTheRabbits): validate demand in a low-capex format first, then reinvest community trust into a multi-concept ecosystem.',
            'Build a school inside your business (City Space school, Bartenders FAQtory) so talent grows with you instead of leaving.',
            'Map your unit economics early: average check, seat turns, rent-to-revenue ratio, labour percentage and payback horizon.'
          ],
          case: 'Bek Narzi (City Space & «Кодекс хореканца») · Igor Zernov (#FollowTheRabbits & El Copitas)',
          practitioners: ['Bek Narzi (Бек Нарзи)', 'Igor Zernov (Игорь Зернов)'],
          challenge: 'Practical Assignment 08: Present the Operating Model & Unit Economics for your venue (capacity, covers/day, average check, rent logic, staffing structure, 90-day launch & guest-shift plan) applying Bek Narzi’s Horeca Code and Igor Zernov’s ecosystem model. Upload your assignment for admin review.'
        }
      ]
    },
    {
      id: 'budget',
      number: '09',
      title: 'Budget Realisation, Scenography & Found-Object Mockup',
      description: 'Prove that a venue with soul does not need a fortune: Denis Bobkov’s salvage-built theatrical pubs (Black Swan, Bambule), Egor Tarasenko’s street-sourced Joi Espresso Bar — and your real physical mockup assembled from found objects, antique tableware, candles and menu concepts.',
      image: 'horeca-atmosphere-candle.jpg',
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
          practitioners: ['Denis Bobkov (Денис Бобков)', 'Egor Tarasenko (Егор Тарасенко)'],
          challenge: 'Practical Assignment 09A: List 10 key physical elements of your venue (tableware, glasses, candle/light sources, bar counter, seating, doors, menu artefact, etc.). For each, specify a second-hand, antique flea-market, salvage or self-built sourcing plan inspired by Joi Espresso Bar and Denis Bobkov’s Black Swan, comparing your budget against catalogue prices. Submit for admin confirmation.'
        },
        {
          id: 'scenography',
          title: 'Theatrical techniques & the live mockup from found objects',
          duration: '19 min',
          intro: 'Do not build a sterile architectural paper box. Stage your venue directly from real found objects — antique tableware, candles, vintage glass, fabric, wood, bottles and your physical menu concept.',
          body: 'Here is the core secret of scenography: you do not test a hospitality concept on a flat blueprint or out of white office paper. You test it by assembling its real tactile world out of whatever you can hunt down and improvise with your hands! Borrow the decorative techniques of the theatre (as Denis Bobkov does at Abbey Players and Black Swan, and Egor Tarasenko did at Joi Espresso Bar): patina, glazing, trompe-l’œil, distressing, drapery, wax candles and a single tight beam of warm light. Then build your physical mockup NOT from paper, but from real improvised and found things ("из подручных вещей, что найдёте"): an antique plate or coupe glass from a flea market, melted candles in vintage holders, a scrap of velvet or aged wood, a hand-aged bottle, a mortar with herbs (like Hiroyasu Kayama’s counter), and a physical prototype of your 50 Best-style Menu Concept. Stage a real corner, table vignette or bar fragment of your venue in actual light. Photograph it at guest eye height. If a guest looking at that photograph immediately believes the "sweet fairy tale" and wants to sit at that table tonight, your concept works.',
          ideas: [
            'The mockup is NOT made of paper: assemble it from real found and improvised objects — antique tableware, candles, vintage glassware, fabrics, wood, stone and herbs.',
            'Include a physical prototype of your Menu Concept (inspired by 50 Best menus: Rémy Savage, Bar Leone, El Copitas, Tuju) right inside the setup.',
            'Borrow theatrical techniques (Denis Bobkov’s Abbey Players & Black Swan): patina, distressing, drapery, candle flame and a single tight beam of light.',
            'A theatrical trick must support the story and never announce itself — otherwise the sweet fairy tale ends.',
            'Stage and photograph your found-object mockup in real evening/candle light at guest eye level — that is the image you pitch with.'
          ],
          case: 'Live Found-Object Mockup · Antique Tableware, Candles & 50 Best Menu Artefacts (Denis Bobkov · Joi Espresso Bar · Rémy Savage)',
          practitioners: ['Denis Bobkov (Денис Бобков)', 'Rémy Savage (Реми Саваж)', 'Hiroyasu Kayama (Хироясу Каяма)'],
          challenge: 'Practical Assignment 09B (Found-Object Live Mockup & Menu Concept): Assemble a real physical mockup of your venue from improvised and found objects — antique tableware/glassware, candles, textures, props and a physical prototype of your 50 Best-inspired Menu Concept. Light it with real candles/focused light and photograph 3 views at guest eye level. Attach your photographs and description for admin confirmation.'
        }
      ]
    },
    {
      id: 'final',
      number: '10',
      title: 'Final Challenge',
      description: 'Bring your thinking together. Defend the hospitality concept of tomorrow — synthesizing the 8 industry leaders, a 50 Best menu concept, and your live found-object mockup.',
      image: 'horeca-concept-pitch.jpg',
      practitioners: ['Hiroyasu Kayama', 'Denis Bobkov', 'Rémy Savage', 'Erik Lorincz', 'Igor Zernov', 'Artem Talalay', 'Bek Narzi', 'Jiro Ono'],
      lessons: [
        {
          id: 'final-brief',
          title: 'Design the hospitality concept of tomorrow ("Open & Operate")',
          duration: '20 min',
          intro: 'Imagine you are opening a hospitality venue. Make the complete case for the experience, the 50 Best menu concept, the business model, and the real found-object mockup staged with antique tableware and candlelight.',
          body: 'Your final submission brings together every milestone of the elective into one cohesive "Open & Operate" pitch deck, a physical Menu Concept (in the spirit of The World’s 50 Best Bars & Restaurants), and your live mockup assembled from found objects, antique tableware and candles. Connect your audience, one-sentence USP, space, atmosphere ("sweet fairy tale" continuity), neurogastronomy serves, technology/human matrix, unit economics, and salvage & budget realisation plan. Explicitly reference which principles from the course’s featured industry figures — Hiroyasu Kayama (farm-to-glass apothecary), Denis Bobkov (antique salvage & candlelit scenography), Rémy Savage (conceptual manifesto & 50 Best menu architecture), Erik Lorincz (five-star choreography), Igor Zernov (community ritual & living menu), Artem Talalay (4-coordinate sensory mixology), Bek Narzi (the Horeca Code & standards) and Jiro Ono (shokunin precision) — anchor your project.',
          ideas: [
            'Make the guest, the occasion and the one-sentence USP unmistakable.',
            'Present your Menu Concept analysed through The World’s 50 Best lens (Rémy Savage, Bar Leone, El Copitas, Tuju, Bar Benfiddich).',
            'Show how service choreography (Lorincz), sensory serves (Talalay, Kayama, Jiro), operational standards (Bek Narzi) and community growth (Zernov) work together.',
            'Present your salvage & scenography budget (Joi Espresso Bar, Denis Bobkov) alongside photographs of your real found-object mockup (antique tableware, candles, textures, menu artefact).',
            'Keep the fairy tale intact — name the details that could wake the guest up, and how you removed them.'
          ],
          case: 'Your own concept, 50 Best Menu & Found-Object Mockup benchmarked against Kayama, Bobkov, Savage, Lorincz, Zernov, Talalay, Narzi & Jiro',
          practitioners: ['Hiroyasu Kayama', 'Denis Bobkov', 'Rémy Savage', 'Erik Lorincz', 'Igor Zernov', 'Artem Talalay', 'Bek Narzi', 'Jiro Ono'],
          challenge: 'Practical Assignment 10 (Final Pitch "Open & Operate"): Submit your complete concept deck, 50 Best Menu Concept, sourcing & budget plan, and photographs of your live found-object mockup (antique tableware, candles, props) inside the app (and/or to egor.tarasenko@him-mail.ch) for final review and certificate approval by Egor Tarasenko.'
        }
      ]
    }
  ],
  cases: [
    {
      title: 'Bar Benfiddich · Hiroyasu Kayama',
      location: 'Tokyo, Japan',
      year: '№18 World’s 50 Best Bars',
      industry: 'Farm-to-glass apothecary · Hiroyasu Kayama (Хироясу Каяма)',
      image: 'horeca-sustainable-terroir.jpg',
      context: 'A 16-seat apothecary cocktail bar in Shinjuku where owner-bartender Hiroyasu Kayama serves botanicals grown on his family farm in Chichibu (Saitama).',
      what: 'No printed menu: Kayama talks with each guest across a candlelit counter of antique jars, crushes fresh wormwood, fennel, juniper and yuzu in a mortar, and pours homemade absinthe, amari and infusions.',
      why: 'Demonstrates that vertical ownership of raw ingredients (soil to glass) and antique apothecary staging create an irreproducible global benchmark.',
      takeaway: 'What you grow, distil and stage yourself can never be copied from a distributor catalogue.'
    },
    {
      title: 'Black Swan & Bambule · Denis Bobkov',
      location: 'Moscow · Pub Life Group',
      year: 'Salvage, Antique Tableware & Scenography',
      industry: 'Theatrical pubs & bars · Denis Bobkov (Денис Бобков)',
      image: 'horeca-atmosphere-candle.jpg',
      context: 'Co-founder of Pub Life Group Denis Bobkov rose from dishwasher and bartender to building Europe’s most atmospheric theatrical pubs and bars (Black Swan, Bambule, Abbey Players, The Bix).',
      what: 'Labyrinthine multi-room spaces assembled from European salvage yards, antique porcelain and silverware, dripping wax candles, 19th-century church doors, Victorian confessionals and stage lighting.',
      why: 'Proves how found antique objects, real candlelight and theatrical scenography keep the "sweet fairy tale" intact across every room.',
      takeaway: 'Real found artefacts — antique tableware, candles and salvage — build deeper emotional worlds than turnkey luxury renovations.'
    },
    {
      title: 'Shapes, Bar Nouveau & Little Red Door · Rémy Savage',
      location: 'London & Paris',
      year: '50 Best Menu Concepts & Manifestos',
      industry: 'Concept architecture & 50 Best menus · Rémy Savage (Реми Саваж)',
      image: 'horeca-ai-mixology-lab.jpg',
      context: 'World Class Bartender of the Year Rémy Savage builds bars and 50 Best menus as complete philosophical movements — wordless illustrated comic menus at Little Red Door, Bauhaus minimalism at Shapes (London) and Art Nouveau at Bar Nouveau (Paris).',
      what: 'The menu is designed as a collectible art object where guests choose by visual form, mood or movement rather than a dry recipe list.',
      why: 'Turns the menu and interior into a single conceptual filter that makes every decision coherent.',
      takeaway: 'A World’s 50 Best menu is a tangible manifesto that teaches the guest how to experience the room.'
    },
    {
      title: 'The Savoy & Kwānt · Erik Lorincz',
      location: 'Mayfair, London',
      year: '№1 World’s 50 Best Bars legacy',
      industry: 'Five-star service choreography · Erik Lorincz (Эрик Лоринц)',
      image: 'horeca-interior-design.jpg',
      context: 'World Class Global Champion (2010) Erik Lorincz led The Savoy’s American Bar to №1 in the world before opening his own Mayfair flagship, Kwānt.',
      what: 'Combines classic hotel elegance, rare vintage spirits, antique crystal, tropical mid-century scenography and laboratory precision.',
      why: 'Shows how physical choreography, posture, vintage glassware and menu storytelling create effortless luxury.',
      takeaway: 'Hospitality excellence lives in the rhythm and grace of human movement behind the bar.'
    },
    {
      title: 'El Copitas & #FollowTheRabbits · Igor Zernov',
      location: 'St. Petersburg',
      year: '№8 World’s 50 Best Bars',
      industry: 'Community speakeasy, living menu & ecosystem · Igor Zernov (Игорь Зернов)',
      image: 'horeca-craft-bar.jpg',
      context: 'Co-founded by Igor Zernov (an alumnus of Bek Narzi’s City Space school), El Copitas began as a tiny hidden bar around one candlelit communal table.',
      what: 'Personal phone greeting, welcome taco and copita of mezcal in handmade clay/ceramic vessels, weekly hand-drawn chalkboard menu — scaling into #FollowTheRabbits (Paloma Cantina, Tagliatella Caffe, Sangre Fresca, Bartenders FAQtory, SPb Cocktail Week).',
      why: 'A masterclass in scaling intimacy: starting with found objects and a living weekly menu, then building an entire industry ecosystem.',
      takeaway: 'Warmth, handmade vessels and living rituals scale better than expensive hardware.'
    },
    {
      title: 'City Space & The Horeca Code · Bek Narzi',
      location: 'Moscow & London',
      year: 'Management & Standards',
      industry: 'Bar entrepreneurship & education · Bek Narzi (Бек Нарзи)',
      image: 'horeca-tech-operations.jpg',
      context: 'British-Russian hospitality entrepreneur Bek Narzi put City Space Bar into the World’s 50 Best Bars, launched London’s Pachamama, and authored «Кодекс хореканца» and «7 часов до взлёта».',
      what: 'Built a rigorous school of bar management combining five-star standards, station ergonomics, R&D garnishes (such as fruit chips) and unit economics.',
      why: 'Demonstrates that showmanship only survives when backed by iron operational standards and mentorship.',
      takeaway: 'Build a school of people and strict operational standards; the awards and revenue follow.'
    },
    {
      title: 'Sensory Mixology & Speed · Artem Talalay',
      location: 'Sochi & Moscow',
      year: 'World Class Winner',
      industry: 'Neurogastronomy & competition R&D · Artem Talalay (Артём Талалай)',
      image: 'horeca-neurogastronomy-serve.jpg',
      context: 'Diageo Reserve World Class Russia Winner (2020–2021, winning both Signature Drink and Cocktail Against the Clock) and Palm Branch "Bartender of the Year" Hall of Fame member.',
      what: 'Constructs drinks across four coordinates — taste, aroma, enveloping texture and conceptual colouristics — executed at high-speed competition ergonomics.',
      why: 'Connects sensory gastrophysics directly to real-world Friday-night bar speed.',
      takeaway: 'A masterpiece in a glass must work both as a sensory story and as an ergonomic 60-second build.'
    },
    {
      title: 'Sukiyabashi Jiro · Jiro Ono',
      location: 'Ginza, Tokyo',
      year: '3★ MICHELIN legend',
      industry: 'Shokunin mastery & omakase architecture · Jiro Ono (Дзиро Оно)',
      image: 'horeca-chefs-counter.jpg',
      context: 'A 10-seat counter in a Tokyo subway basement led by nonagenarian master Jiro Ono, holding three MICHELIN stars for decades.',
      what: 'A 20-piece nigiri omakase with zero menu distractions, rice kept at 37°C body temperature, and piece proportions subtly adjusted to each guest’s posture and pace.',
      why: 'Proves that absolute mastery of fundamentals and peak–end pacing transcend location and size.',
      takeaway: 'Perfection is not an act of luxury decor; it is relentless daily refinement of the core craft.'
    },
    {
      title: 'Joi Espresso Bar · Egor Tarasenko',
      location: 'Author’s own project',
      year: 'Budget build & Found objects',
      industry: 'Espresso bar · Found objects, vintage tableware & scenography',
      image: 'horeca-atmosphere-candle.jpg',
      context: 'A small espresso bar assembled by the author of this course almost entirely from what the street and the flea markets offered — furniture, fixtures, cups, lamps, equipment and objects other people had already discarded.',
      what: 'Instead of ordering a fitted interior, the space was built piece by piece: second-hand and reclaimed objects, adjusted, repaired and re-finished by hand until the room held together as one story.',
      why: 'Direct evidence that a venue with soul does not require a large investment: the constraint became the character.',
      takeaway: 'Budget is not the opposite of atmosphere. Money buys speed and finish; intention buys soul.'
    },
    {
      title: '50 Best Menu Concepts · Bar Leone & Tuju',
      location: 'Hong Kong & São Paulo',
      year: '2025–2026',
      industry: 'World’s 50 Best №1 Bar & Art of Hospitality Menu Breakdown',
      image: 'horeca-craft-bar.jpg',
      context: 'Bar Leone ("Cocktail Popolari", №1 World’s 50 Best Bars) and Tuju (São Paulo, 2026 Art of Hospitality Award) show how contemporary menus communicate identity.',
      what: 'Bar Leone pairs nostalgic Italian neighbourhood cards with full recipe/ingredient transparency; Tuju turns its tasting menu into meteorological field notes structured around Rain, Wind and Drought.',
      why: 'Both prove that a 50 Best menu is an editorial story and a physical souvenir that anchors the guest’s memory.',
      takeaway: 'Design your menu as an object guests want to hold, photograph and remember.'
    }
  ],
  updates: [
    {
      tag: 'INDUSTRY LEADERS & 50 BEST MENUS',
      title: 'Eight practitioners & World’s 50 Best menu concepts',
      date: 'September 2026',
      text: 'Modules and cases now feature Hiroyasu Kayama (Bar Benfiddich), Denis Bobkov (Pub Life Group / Black Swan), Rémy Savage (Shapes / Bar Nouveau / Little Red Door), Erik Lorincz (The Savoy / Kwānt), Igor Zernov (El Copitas / #FollowTheRabbits), Artem Talalay (World Class), Bek Narzi (City Space / The Horeca Code) and Jiro Ono (Sukiyabashi Jiro), plus a deep dive into World’s 50 Best menu concepts.'
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
  ]
};
