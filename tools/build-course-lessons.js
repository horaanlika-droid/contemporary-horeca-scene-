'use strict';

/* Build the course lesson blocks from the authored source (lessons.txt).

   `lessons.txt` is the editorial source of truth for the twelve learning units.
   This tool parses it, cleans the Markdown into the plain-prose shape the app
   renders, and rewrites the `modules` array in course-data.js. Module-level
   metadata (ids, covers, cases, challenges, key ideas) is curated below so the
   published course stays editorial rather than mechanical.

   Usage: node tools/build-course-lessons.js [--dry]
*/

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'lessons.txt');
const DATA = path.join(ROOT, 'course-data.js');
const DRY = process.argv.includes('--dry');

/* ---------------------------------------------------------------- parsing */

function splitBlocks(raw) {
  const lines = raw.split(/\r?\n/);
  const blocks = [];
  let current = null;
  for (const line of lines) {
    if (/^#\s+/.test(line)) {
      if (current) blocks.push(current);
      current = { heading: line.replace(/^#\s+/, '').trim(), lines: [line] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);
  return blocks.filter(block => !/^PRACTICAL ASSIGNMENTS$/i.test(block.heading));
}

function mergeLessonBlocks(blocks) {
  const merged = [];
  for (const block of blocks) {
    const isNumberOnly = /^LESSON\s+\d+$/.test(block.heading);
    if (isNumberOnly) {
      merged.push({ number: block.heading.match(/\d+/)[0], title: null, lines: [...block.lines] });
      continue;
    }
    const previous = merged[merged.length - 1];
    if (previous && previous.title === null) {
      previous.title = block.heading.replace(/^LESSON\s+\d+\s*[—–-]\s*/, '');
      previous.lines.push(...block.lines);
    } else {
      merged.push({ number: null, title: block.heading.replace(/^LESSON\s+\d+\s*[—–-]\s*/, ''), lines: [...block.lines] });
    }
  }
  return merged;
}

const SMALL_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'nor', 'of', 'in', 'on', 'at', 'to', 'for', 'by', 'with',
  'from', 'into', 'over', 'under', 'as', 'is', 'are', 'vs', 'via', 'per', 'than', 'that', 'this', 'not', 'no']);
const ACRONYMS = new Set(['AI', 'USP', 'R&D', 'CJM', 'POS', 'KDS', 'CRM', 'FAQ', 'F&B', 'HIM', 'BBA', 'MIB', 'UK', 'USA']);

function titleCase(value) {
  return value.split(/\s+/).map((word, index) => {
    if (ACRONYMS.has(word.toUpperCase())) return word.toUpperCase();
    const bare = word.replace(/[^A-Za-zÀ-ÿ’'&-]/g, '');
    if (index > 0 && SMALL_WORDS.has(bare.toLowerCase())) return word.toLowerCase();
    if (/^[A-Z0-9&]{2,}$/.test(word) && !SMALL_WORDS.has(bare.toLowerCase())) return word;
    return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function headingText(value) {
  const clean = value.replace(/<\/?(?:text|ins)>/gi, '').trim();
  if (!clean) return '';
  const bare = clean.replace(/\*\*/g, '').trim();
  /* Authored section labels are already styled; keep them exactly as written. */
  if (/[a-z]/.test(bare) || /[A-Z]/.test(bare)) return bare;
  const sentence = /[.!?]$/.test(bare);
  if (sentence) return bare.slice(0, 1).toUpperCase() + bare.slice(1).toLowerCase();
  return titleCase(bare);
}

/* The renderer reads a deliberately small Markdown subset: `##`/`###` headings,
   **bold**, *italic*, `- ` bullets, `1. ` steps, `> ` pull-quote highlights and
   *single italic lines* kept as notes or figure captions. Everything else stays
   plain prose, so the published course remains readable in the admin console. */

function stripTags(value) {
  return value
    .replace(/<\/?(?:text|ins)>/gi, '')
    .replace(/<AsyncImage(?:Group)?\b[^>]*\/?>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function inlineMarkdown(value) {
  return stripTags(value)
    .replace(/\*\*\s*(.+?)\s*\*\*/g, '**$1**')
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,;:!?—]|$)/g, '$1*$2*');
}

/* Loose comparison used to drop the title and standfirst repeated by the page. */
function comparable(value) {
  return plainText(String(value))
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function plainText(value) {
  return stripTags(value)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function convertTable(rows) {
  const cells = rows
    .map(row => row.split('|').slice(1, -1).map(cell => cell.trim()))
    .filter(row => row.length);
  if (!cells.length) return [];
  const body = cells.filter((row, index) => index > 0 && !row.every(cell => /^:?-{2,}:?$/.test(cell)));
  return body.map(row => {
    const head = plainText(row[0]);
    const detail = plainText(row[1] || row[2] || '');
    return detail ? `- **${head}** — ${detail}` : `- **${head}**`;
  });
}

/* Turn one lesson's Markdown into the structured blocks the renderer understands.
   Consecutive bullets and consecutive highlights are kept together in one block. */
function toParagraphs(lines) {
  const blocks = [];
  let table = [];
  let list = null;
  const flushTable = () => {
    if (!table.length) return;
    blocks.push(convertTable(table).join('\n'));
    table = [];
  };
  const flushList = () => { list = null; };
  const appendListItem = (ordered, text) => {
    if (!list || list.ordered !== ordered) {
      list = { ordered, items: [] };
      blocks.push(list);
    }
    list.items.push(`${ordered ? '1.' : '-'} ${text}`);
  };
  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00a0/g, ' ').trimEnd();
    const trimmed = line.trim();
    if (trimmed.startsWith('|')) { flushList(); table.push(trimmed); continue; }
    flushTable();
    if (!trimmed) { flushList(); continue; }
    if (/^---+$/.test(trimmed)) continue;
    if (/^#\s+/.test(trimmed)) continue;
    if (/^\*\*(?:LESSON\s+\d+|MODULE\s+\d+|EDITORIAL)/i.test(trimmed)) continue;
    if (/^EDITORIAL LESSON\b/i.test(trimmed)) continue;
    if (/^\*(?:Editorial [Ll]esson|LESSON \d+)/.test(trimmed)) continue;
    if (/^<AsyncImage(?:Group)?\b/i.test(trimmed)) continue;
    if (/^##\s+/.test(trimmed)) {
      const heading = headingText(trimmed.replace(/^##\s+/, ''));
      if (!heading) continue;
      flushList();
      blocks.push(`## ${heading}`);
      continue;
    }
    if (/^###\s+/.test(trimmed)) {
      const heading = headingText(trimmed.replace(/^###\s+/, ''));
      if (!heading) continue;
      flushList();
      blocks.push(`### ${heading}`);
      continue;
    }
    if (/^<ins>.*<\/ins>$/i.test(trimmed)) {
      const label = plainText(trimmed);
      if (!label) continue;
      flushList();
      blocks.push(`### ${label}`);
      continue;
    }
    if (/^<text>.*<\/text>$/i.test(trimmed)) {
      const caption = plainText(trimmed);
      if (!caption) continue;
      flushList();
      blocks.push(`*${caption}*`);
      continue;
    }
    if (/^\*\s*\*$/.test(trimmed) || /^-{1,3}\s*-{1,3}$/.test(trimmed)) continue;
    if (/^[*-]\s+/.test(trimmed)) {
      appendListItem(false, inlineMarkdown(trimmed.replace(/^[*-]\s+/, '')));
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      appendListItem(true, inlineMarkdown(trimmed.replace(/^\d+\.\s+/, '')));
      continue;
    }
    flushList();
    /* A paragraph written entirely in bold is the lesson's editorial highlight. */
    if (/^\*\*[^*](?:[^*]|\*(?!\*))*\*\*$/.test(trimmed)) {
      blocks.push(`> ${plainText(trimmed)}`);
      continue;
    }
    blocks.push(inlineMarkdown(trimmed));
  }
  flushTable();
  return blocks
    .map(block => (typeof block === 'string' ? block : block.items.join('\n')))
    .map(block => block.trim())
    .filter(Boolean);
}

function answerOf(paragraphs, heading) {
  const index = paragraphs.findIndex(paragraph => paragraph.toLowerCase() === heading.toLowerCase());
  if (index === -1) return [];
  const answer = [];
  for (const paragraph of paragraphs.slice(index + 1)) {
    if (/^\d{2}\s*[—–.]/.test(paragraph) || /^The Idea/i.test(paragraph) || /^Course connection$/i.test(paragraph)) break;
    if (/^\d{2}\.\s/.test(paragraph) && paragraph.length < 70) break;
    answer.push(paragraph);
  }
  return answer;
}

/* --------------------------------------------------------------- curation */

const MODULES = [
  {
    id: 'future', number: '01', title: 'Hospitality Futures',
    description: 'Read the signals reshaping hospitality: the ranking and awards infrastructure of MICHELIN, The 50 Best, GreatList and The Pinnacle Guide, the entry mechanics behind each system, and the evidence 2027 juries will reward.',
    image: 'illo-m01-signals.jpg',
    practitioners: ['Jiro Ono (Sukiyabashi Jiro, Tokyo)', 'Igor Zernov (El Copitas / #FollowTheRabbits)'],
    lessons: [{
      number: '01', id: 'signals', slug: 'look-beyond-the-surface',
      title: 'Look Beyond the Surface', duration: '25 min',
      intro: 'How awards shape the future of hospitality — and how to use them to your advantage.',
      case: 'Sukiyabashi Jiro (Tokyo) · El Copitas (St Petersburg) · Bar Leone (Hong Kong) · Line (Athens)',
      practitioners: ['Jiro Ono', 'Igor Zernov'],
      ideas: [
        'An award is never just a badge: it reflects a set of values, a method and a definition of excellence.',
        'Rankings and guides build reputation over time; jury prizes judge a submitted body of work; competitions test a team against a brief.',
        'Read the entry rules before the winners: who judges, what is measured, what evidence counts and who pays.',
        'Recognition follows a clear point of view, not the size of a venue or the scale of its budget.',
        'Use shortlists and criteria as a learning tool — and apply only when the evidence is ready.'
      ],
      challenge: 'Challenge — build a one-page award map for your own concept: one primary and one secondary award, the entry rule (self-entry, nomination or inspection only), the deadline and the five pieces of evidence a jury would need. Submit it in the app for feedback; the numbered assignment sequence begins with Assignment 03.'
    }]
  },
  {
    id: 'experience', number: '02', title: 'Experience Design',
    description: 'Atmosphere as a designed state of mind: the sweet fairy tale, service choreography, objects with a history, the back of house, and the evening as a sequence of scenes.',
    image: 'illo-m02-atmosphere.jpg',
    practitioners: ['Simone Caporale (Sips, Barcelona)', 'Denis Bobkov (Black Swan / Bambule)', 'Alex Kratena (Tayēr + Elementary)'],
    lessons: [{
      number: '02', id: 'atmosphere', slug: 'designing-atmosphere',
      title: 'Designing atmosphere & the sweet fairy tale', duration: '16 min',
      intro: 'Atmosphere is not decoration. It is the cumulative effect of hundreds of deliberate choices — light, sound, materials, tableware, movement and service — working together to create a world the guest can feel.',
      case: 'Sips (Simone Caporale, Barcelona) · Black Swan & Bambule (Denis Bobkov) · Tayēr + Elementary (Alex Kratena)',
      practitioners: ['Simone Caporale', 'Denis Bobkov', 'Alex Kratena'],
      ideas: [
        'A venue is a sweet fairy tale: for two hours the guest agrees to believe in a world you built.',
        'One harsh overhead light, a plastic tray or a visible printer can wake the guest from the dream.',
        'Sips (Simone Caporale): an open central workstation turns service into choreography.',
        'Denis Bobkov: candles, antique tableware and sequential rooms carry the story further than a renovation.',
        'Atmosphere unfolds over time — arrival, the defining moment, the farewell.',
        'Authenticity comes from how naturally objects belong together, not from their quantity.'
      ],
      challenge: 'Challenge — map three scenes for your venue (arrival, defining moment, farewell) with light, sound, scent, tableware and service choreography, then list three “fairy-tale breakers” you will eliminate. Submit your scene map in the app for feedback.'
    }]
  },
  {
    id: 'neuro', number: '03', title: 'Neurogastronomy',
    description: 'Flavour as a multisensory construction: gastrophysics, the weight of the vessel, precision before perfection, aroma as performance and the temperature and timing of a signature serve.',
    image: 'illo-m03-senses.jpg',
    practitioners: ['Artem Talalay (World Class Russia Winner)', 'Dave Arnold (Liquid Intelligence)', 'Hiroyasu Kayama (Bar Benfiddich)', 'Jiro Ono (Sukiyabashi Jiro)'],
    lessons: [{
      number: '03', id: 'perception', slug: 'senses-at-the-table',
      title: 'The senses at the table, vessel weight & flavour architecture', duration: '16 min',
      intro: 'Flavour is more than taste. The weight of antique silver, the clarity of crystal, candlelit shadows, aromatic herbs, texture and sound all influence how we experience food and drink.',
      case: 'Bar Benfiddich (Hiroyasu Kayama) · Sukiyabashi Jiro · Liquid Intelligence (Dave Arnold) · Artem Talalay',
      practitioners: ['Artem Talalay', 'Dave Arnold', 'Hiroyasu Kayama', 'Jiro Ono'],
      ideas: [
        'Flavour is assembled in the brain from taste, aroma, texture, colour, sound and temperature.',
        'The weight and material of the vessel change perceived quality and value.',
        'Dave Arnold: change one variable at a time and measure instead of guessing.',
        'Artem Talalay’s four coordinates — taste, aroma, texture, colour — keep a serve coherent.',
        'Kayama grinds botanicals at the counter; the sound and the aroma are part of the drink.',
        'Jiro Ono: 37 °C rice and a paced twenty-piece sequence design the peak and the end.'
      ],
      challenge: 'Practical Assignment 03 — The Sensory Serve: define one signature serve, map its sensory characteristics, compare two or three vessels and prototype it. Submit the one-page sensory sheet, the sensory map and your photographs in the app for feedback.'
    }]
  },
  {
    id: 'concepts', number: '04', title: 'Restaurant & Bar Concepts & 50 Best Menu Breakdown',
    description: 'The menu as the concept made tangible: manifestos and neighbourhood archives from the world’s best bars, menu psychology, and the object family — menus, merchandise, furniture and stations.',
    image: 'illo-m04-menu.jpg',
    practitioners: ['Rémy Savage (A Bar with Shapes for a Name)', 'Igor Zernov (El Copitas)', 'Boris Zarkov (White Rabbit Family)'],
    lessons: [
      {
        number: '04', id: 'point-of-view', slug: 'concept-manifestos',
        title: 'Concept manifestos & deconstructing The World’s 50 Best menus', duration: '18 min',
        intro: 'In the world’s leading bars and restaurants, a menu is never just a list of products and prices. It is the concept made tangible — a physical object that communicates the identity of a venue, sets expectations and shapes the guest experience.',
        case: 'Little Red Door / A Bar with Shapes for a Name (Rémy Savage) · Bar Leone · El Copitas · Tuju · Tayēr + Elementary · White Rabbit Family',
        practitioners: ['Rémy Savage', 'Igor Zernov', 'Boris Zarkov', 'Alex Kratena'],
        ideas: [
          'A menu is the concept made tangible — not a list of products and prices.',
          'Rémy Savage: one conceptual rule can generate the whole visual identity.',
          'Bar Leone writes the neighbourhood into the menu; El Copitas keeps it alive behind the bar.',
          'Tuju turns the menu into a narrative of rain, wind and season.',
          'Design for the occasion: Tayēr and Elementary are two formats with two promises.',
          'A menu should feel as though it could belong only to that venue.'
        ],
        challenge: 'Practical Assignment 04 — The Menu Manifesto: write your concept manifesto, analyse three menus, propose a menu architecture and a visual reference board. Submit the manifesto and the three case analyses in the app for feedback.'
      },
      {
        number: '05', id: 'concept-objects', slug: 'concept-objects',
        title: 'Concept objects: the menu, the merchandise & the furniture', duration: '17 min',
        intro: 'A concept becomes real when it leaves the wall and enters the guest’s hands — as a menu, a coaster, a cup, a stool or a bar station designed specifically for the way the venue works.',
        case: 'CooCoo Coffee · Pacific · TAM · Joi Espresso Bar',
        practitioners: ['Egor Tarasenko'],
        ideas: [
          'The concept becomes real in what the guest touches: menu, cup, coaster, stool, station.',
          'The first question is what the guest touches first; the second is what they take away.',
          'The team works behind these objects every day — ergonomics is part of the design language.',
          'Materials and dimensions decide whether an object survives the reality of use.',
          'A prototype and a unit cost turn a beautiful object into a buildable one.',
          'Design an object family, not a collection of unrelated pieces.'
        ],
        challenge: 'Practical Assignment 05 — The Object Family: choose a menu, a service object and a furniture or merchandise element; define materials, dimensions, durability and a realistic unit cost. Submit three object concept sheets and a material board in the app for feedback.'
      }
    ]
  },
  {
    id: 'technology', number: '05', title: 'Technology & Automation',
    description: 'The invisible system behind the guest experience: The Horeca Code, station ergonomics, batching, inventory, cost control and the balance between the machine and the human.',
    image: 'illo-m05-automation.jpg',
    practitioners: ['Bek Narzi (City Space Bar / The Horeca Code)'],
    lessons: [{
      number: '06', id: 'automation', slug: 'automation-ergonomics',
      title: 'Automation, ergonomics & the Horeca Code', duration: '15 min',
      intro: 'Technology and ergonomics should not simply make hospitality faster. They should free the team to be more present, attentive and human with the guest.',
      case: 'City Space Bar & The Horeca Code (Bek Narzi)',
      practitioners: ['Bek Narzi'],
      ideas: [
        'Automate repetition; protect human attention.',
        'The Horeca Code (Bek Narzi): standards, inventory control and preparation discipline are the invisible system behind hospitality.',
        'Station ergonomics is designed around movement, not furniture.',
        'Speed comes from preparation and batching, not from faster hands.',
        'Documented preparation protects consistency; clear inventory procedures protect profitability.',
        'The best operational system is the one guests never notice.'
      ],
      challenge: 'Practical Assignment 06 — The Invisible Operating System: map the preparation and service sequence of one signature item, mark what to automate and what to protect, and sketch the workstation. Submit the workflow diagram and the human/machine matrix in the app for feedback.'
    }]
  },
  {
    id: 'ai', number: '06', title: 'AI in Hospitality',
    description: 'AI as a creative catalyst and an operational tool: the World Class AI brief, the R&D matrix, and an ethics charter for privacy, verification, ownership and human oversight.',
    image: 'illo-m06-ai.jpg',
    practitioners: ['Simone Caporale (Sips)', 'Rémy Savage (A Bar with Shapes for a Name)', 'Felice Capasso (Sesto Senso Academy)'],
    lessons: [{
      number: '07', id: 'human-ai', slug: 'ai-creative-operational',
      title: 'AI as a creative and operational tool', duration: '17 min',
      intro: 'Efficiency is not the same as authorship. AI can widen the creative field and organise complexity — the team still decides which idea deserves to exist.',
      case: 'Diageo World Class AI brief · Sips (Simone Caporale) · Rémy Savage · Sesto Senso Academy (Felice Capasso)',
      practitioners: ['Simone Caporale', 'Rémy Savage'],
      ideas: [
        'AI can generate options, not authorship: fluent output is not original thinking.',
        'Use AI to widen research, then select, test and edit with human taste.',
        'The World Class AI brief: interpret the image, translate it into the senses, prototype, edit.',
        'Simone Caporale: experimentation needs intention, not novelty.',
        'Turn an idea into a testable question and document what the test showed.',
        'Write the ethics charter: privacy, verification, ownership and human oversight.'
      ],
      challenge: 'Practical Assignment 07 — The Human–AI Development Brief: take one real task, write the brief, document the AI output and your decisions, and add a short AI-use policy. Submit the brief, the decision log and the ethics charter in the app for feedback.'
    }]
  },
  {
    id: 'fnb', number: '07', title: 'Food & Beverage Futures',
    description: 'Ingredient-led hospitality: Kayama’s farm-to-glass apothecary, the zero-menu consultation, Tuju, Noma’s research and accountability, and experimentation that can be repeated.',
    image: 'illo-m07-fnb.jpg',
    practitioners: ['Hiroyasu Kayama (Bar Benfiddich)', 'René Redzepi (Noma)', 'Dave Arnold (Liquid Intelligence)'],
    lessons: [{
      number: '08', id: 'new-formats', slug: 'next-table-apothecary',
      title: 'The next table & Hiroyasu Kayama’s farm-to-glass apothecary', duration: '15 min',
      intro: 'When every bar buys the same bottles from the same distributors, differentiation begins with a relationship to ingredients, places, people and processes.',
      case: 'Bar Benfiddich (Hiroyasu Kayama) · Tuju · Noma · Dave Arnold · Artender',
      practitioners: ['Hiroyasu Kayama', 'René Redzepi', 'Dave Arnold'],
      ideas: [
        'Kayama runs the bar as an apothecary: ingredients and conversation shape the drink.',
        'The zero-menu experience is a consultation, not a list.',
        'Tuju’s menu responds to the environment — rain, wind, season.',
        'Noma changed a cuisine through research and preservation; leadership accountability is part of the story.',
        'Dave Arnold: experimentation becomes valuable when it is repeatable.',
        'Provenance, process and responsibility are the three foundations of a credible offer.'
      ],
      challenge: 'Practical Assignment 08 — From Origin to Memory: choose one ingredient with a real connection to a place or producer, compare two preparation methods and develop a signature serve around the stronger one. Submit the origin sheet, comparison notes and concept in the app for feedback.'
    }]
  },
  {
    id: 'entrepreneurship', number: '08', title: 'Entrepreneurship',
    description: 'From idea to operating model: unit economics, ecosystems built by Narzi, Zernov and Zarkov, a school inside the business, the 90-day launch and the metrics that connect culture to commerce.',
    image: 'illo-m08-venture.jpg',
    practitioners: ['Bek Narzi (City Space Bar)', 'Igor Zernov (El Copitas)', 'Boris Zarkov (White Rabbit Family)'],
    lessons: [{
      number: '09', id: 'from-idea', slug: 'operating-model',
      title: 'From idea to operating model & talent ecosystem', duration: '18 min',
      intro: 'A concept becomes a business only when it can be delivered consistently, by a team, within real financial constraints.',
      case: 'City Space Bar (Bek Narzi) · El Copitas & #FollowTheRabbits (Igor Zernov) · White Rabbit Family (Boris Zarkov)',
      practitioners: ['Bek Narzi', 'Igor Zernov', 'Boris Zarkov'],
      ideas: [
        'A concept becomes a business when the room, the offer, the economics and the team work as one system.',
        'Revenue is covers multiplied by average spend; unit economics make the concept legible.',
        'Igor Zernov: a small venue can grow into an ecosystem of places, education and community.',
        'Boris Zarkov: distinct concepts can share resources without losing their identity.',
        'Build a school inside the business: training and progression are part of the model.',
        'The 90-day launch turns a plan into evidence.'
      ],
      challenge: 'Practical Assignment 09 — The First Operating Model: define format, capacity and revenue streams, estimate costs and break-even, chart the team, and outline the first 90 days. Submit the one-page model and the launch outline in the app for feedback.'
    }]
  },
  {
    id: 'budget', number: '09', title: 'Budget Realisation, Scenography & Found-Object Mockup',
    description: 'Soul before budget: Joi Espresso Bar and Denis Bobkov’s salvage worlds, the real cost of found objects, and theatrical techniques that turn a tabletop into a venue.',
    image: 'illo-m09-found.jpg',
    practitioners: ['Egor Tarasenko (Joi Espresso Bar)', 'Denis Bobkov (Black Swan / Bambule)'],
    lessons: [
      {
        number: '10', id: 'budget-builds', slug: 'soul-before-budget',
        title: 'Soul before budget: Joi Espresso Bar & Denis Bobkov’s salvage worlds', duration: '16 min',
        intro: 'A venue does not need a large budget to feel alive. It needs a point of view, a coherent visual language and the patience to find objects that express it.',
        case: 'Joi Espresso Bar (Egor Tarasenko) · Black Swan & Bambule (Denis Bobkov)',
        practitioners: ['Egor Tarasenko', 'Denis Bobkov'],
        ideas: [
          'Character cannot be ordered from a catalogue.',
          'Joi Espresso Bar was assembled from the street and flea markets, not built from a fit-out budget.',
          'Write the feeling before you go hunting; let the concept guide every purchase.',
          'Denis Bobkov: salvage and patina create a world with a history the guest can feel.',
          'Total acquisition cost = price + transport + repair + adaptation + installation.',
          'Edit with discipline: a coherent collection, not a storage room.'
        ],
        challenge: 'Practical Assignment 10 — The Salvage & Sourcing Plan: define the material language, name three anchor objects, research sourcing routes and calculate the real acquisition cost. Submit the moodboard, the annotated object list and the budget table in the app for feedback.'
      },
      {
        number: '11', id: 'scenography', slug: 'theatrical-mockup',
        title: 'Theatrical techniques & the live mockup from found objects', duration: '19 min',
        intro: 'Atmosphere is constructed through carefully orchestrated details, and the machinery behind the illusion should never be visible.',
        case: 'Joi Espresso Bar (Egor Tarasenko) · Abbey Players & Black Swan (Denis Bobkov)',
        practitioners: ['Egor Tarasenko', 'Denis Bobkov'],
        ideas: [
          'Think like a theatre designer: atmosphere is constructed, and the machinery stays hidden.',
          'Build the scene from found objects instead of pristine paper.',
          'The menu is part of the scenography, not an accessory.',
          'Light is a material: one tight beam can do more than a full renovation.',
          'Compose from the guest’s seated perspective, then photograph it there.',
          'When objects, light, menu and atmosphere tell one story, the concept becomes tangible.'
        ],
        challenge: 'Practical Assignment 11 — The Live Found-Object Mockup: assemble a real tabletop scene with a physical menu prototype, light it, photograph it from guest height and reflect on what it revealed. Submit the photographs, the object list and the reflection in the app for feedback.'
      }
    ]
  },
  {
    id: 'final', number: '10', title: 'Final Challenge',
    description: 'Open & Operate: bring the concept, menu, guest journey, operating model, sourcing plan and live mockup together into one credible hospitality proposition.',
    image: 'illo-m10-mockup.jpg',
    practitioners: ['Jiro Ono', 'René Redzepi', 'Hiroyasu Kayama', 'Egor Tarasenko'],
    lessons: [{
      number: '12', source: '13', id: 'final-brief', slug: 'open-and-operate',
      title: 'Design the hospitality concept of tomorrow (“Open & Operate”)', duration: '20 min',
      intro: 'A compelling concept is a connected system: the guest you want to attract, the experience you promise, the way the team works and the money that makes it possible.',
      case: 'Jiro Ono · Noma · Bar Leone · Joi Espresso Bar',
      practitioners: ['Jiro Ono', 'René Redzepi', 'Hiroyasu Kayama', 'Simone Caporale', 'Egor Tarasenko'],
      ideas: [
        'Open & Operate: a concept is a connected system, not a beautiful room.',
        'Define the guest, the occasion and the USP in one clear sentence.',
        'The menu supports the USP; the service model supports the menu.',
        'The budget must support the design — and the mockup must prove the atmosphere.',
        'Clarity is not the enemy of creativity; it gives creativity a direction.',
        'Label estimates and assumptions; never present projections as results.'
      ],
      challenge: 'Practical Assignment 12 — The Final Open & Operate Pitch: assemble the pitch deck, the physical menu concept, the sourcing and budget plan, the mockup photographs and the operating materials, and defend them together at Final Pitch Day.'
    }]
  }
];

/* ------------------------------------------------------------------ build */

function build() {
  const blocks = mergeLessonBlocks(splitBlocks(fs.readFileSync(SOURCE, 'utf8')));
  const parsed = new Map();
  for (const block of blocks) {
    const text = block.lines.join('\n');
    const number = block.number || (text.match(/LESSON\s+(\d+)/) || [])[1] || (block.title === 'Look Beyond the Surface' ? '01' : null);
    if (!number) continue;
    parsed.set(String(number).padStart(2, '0'), { ...block, text });
  }

  const seen = new Set();
  const modules = MODULES.map(module => {
    const lessons = module.lessons.map(meta => {
      const source = parsed.get(String(meta.source || meta.number).padStart(2, '0'));
      if (!source) throw new Error(`lessons.txt has no lesson ${meta.source || meta.number} (${meta.title})`);
      seen.add(String(meta.source || meta.number).padStart(2, '0'));
      const all = toParagraphs(source.lines);
      const same = (a, b) => comparable(a) === comparable(b);
      /* Drop the title, the duration and the intro from the paragraph flow. */
      while (all.length && same(all[0], meta.title)) all.shift();
      const introIndex = all.findIndex(paragraph => same(paragraph, meta.intro));
      const bodyParagraphs = all.filter((paragraph, index) => {
        if (index === introIndex) return false;
        if (/^LESSON \d+ · \d+ MIN$/i.test(paragraph)) return false;
        if (/^EDITORIAL LESSON · CASE STUDIES · KEY IDEAS$/i.test(paragraph)) return false;
        if (/^MODULE \d+ ·/i.test(paragraph)) return false;
        /* The page prints its own “The idea — look beyond the surface” opener. */
        if (index < 3 && /^#+\s*(?:THE IDEA\b.*|LOOK BEYOND THE SURFACE\.?)$/i.test(paragraph)) return false;
        return true;
      });
      /* The source repeats the lesson title as the first heading of lesson 01. */
      while (bodyParagraphs.length && same(bodyParagraphs[0], meta.title)) bodyParagraphs.shift();
      /* The standfirst also opens the reading in the source; the page prints it itself. */
      while (bodyParagraphs.length && same(bodyParagraphs[0], meta.intro)) bodyParagraphs.shift();
      return {
        id: meta.id,
        title: meta.title,
        duration: meta.duration,
        intro: meta.intro,
        body: bodyParagraphs.join('\n\n'),
        ideas: meta.ideas,
        case: meta.case,
        practitioners: meta.practitioners,
        challenge: meta.challenge
      };
    });
    return {
      id: module.id,
      number: module.number,
      title: module.title,
      description: module.description,
      image: module.image,
      practitioners: module.practitioners,
      lessons
    };
  });

  const missing = [...parsed.keys()].filter(number => !seen.has(number));
  if (missing.length) throw new Error(`lessons.txt lessons not published: ${missing.join(', ')}`);

  const serial = value => `'${String(value)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, '\\\'')
    .replace(/\n/g, '\\n')}'`;

  const out = modules.map(module => `    {
      id: ${serial(module.id)},
      number: ${serial(module.number)},
      title: ${serial(module.title)},
      description: ${serial(module.description)},
      image: ${serial(module.image)},
      practitioners: [${module.practitioners.map(serial).join(', ')}],
      lessons: [
${module.lessons.map(lesson => `        {
          id: ${serial(lesson.id)},
          title: ${serial(lesson.title)},
          duration: ${serial(lesson.duration)},
          intro: ${serial(lesson.intro)},
          body: ${serial(lesson.body)},
          ideas: [
${lesson.ideas.map(idea => `            ${serial(idea)}`).join(',\n')}
          ],
          case: ${serial(lesson.case)},
          practitioners: [${lesson.practitioners.map(serial).join(', ')}],
          challenge: ${serial(lesson.challenge)}
        }`).join(',\n')}
      ]
    }`).join(',\n');

  const data = fs.readFileSync(DATA, 'utf8');
  const start = data.indexOf('  modules: [');
  const end = data.indexOf('\n  cases: [');
  if (start === -1 || end === -1) throw new Error('course-data.js: modules array not found');
  const next = `${data.slice(0, start)}  modules: [\n${out}\n  ],${data.slice(end)}`;

  const summary = modules.flatMap(module => module.lessons.map(lesson =>
    `${lesson.title} — ${lesson.body.split('\n\n').length} paragraphs, ${lesson.body.length} chars`));
  console.log(summary.join('\n'));
  console.log(`\n${modules.length} modules · ${modules.flatMap(module => module.lessons).length} lessons`);
  if (process.env.DUMP) {
    const index = Number(process.env.DUMP);
    const lesson = modules.flatMap(module => module.lessons)[index];
    console.log(`\n----- ${lesson.title} -----\n${lesson.body}`);
  }
  if (DRY) return;
  fs.writeFileSync(DATA, next);
  console.log('course-data.js updated');
}

build();
