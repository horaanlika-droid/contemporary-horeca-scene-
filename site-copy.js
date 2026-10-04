/* Public editable site copy for Contemporary Horeca Scene.
   These are the defaults rendered on the password gate (start page) and the landing
   hero / quote band. The administrator edits them from the Russian Telegram admin
   console (scope "site"); the server merges active overrides at GET /api/site and
   the open app applies them over window.SITE. Keep this file English-only. */
window.SITE = {
  gate: {
    eyebrow: 'DIGITAL PRODUCT · 2026 EDITION',
    titleTop: 'Contemporary',
    titleAccent: 'Horeca',
    titleBottom: 'Scene',
    lead: 'A living digital elective on the venues, 50 Best menu concepts, industry leaders, found-object mockups and budgets shaping the contemporary horeca scene.',
    aboutCourse: 'ABOUT THE COURSE ↓',
    aboutAuthor: 'ABOUT THE AUTHOR ↗',
    formEyebrow: 'ENTER THE COURSE',
    formTitle: 'Password',
    formAccent: 'required.',
    formLead: 'Enter the individual password sent by the course bot after your payment is confirmed by Tribute. One password opens every module, lesson and assignment.',
    infoEyebrow: 'ABOUT THE ELECTIVE',
    infoTitleTop: 'Ten modules on what',
    infoTitleAccent: 'shapes',
    infoTitleBottom: 'the scene.',
    infoLead: 'reads the industry as a living scene — and ends with a hospitality concept and a physical mockup you build and defend yourself.',
  },
  landing: {
    heroEyebrow: 'A LIVING DIGITAL ELECTIVE · 2026 EDITION',
    heroLead: '10 modules on the venues, ideas, techniques and budgets shaping the contemporary horeca scene — and a final challenge that ends with your own concept built by hand, as a mockup, like stage scenery.',
    whyBig: 'The next generation of hospitality will be shaped by the way we connect people, place and possibility — and by what we can afford to build.',
    whyBigAccent: 'people, place and possibility',
    quoteEyebrow: 'THE PRINCIPLE',
    quoteText: 'A bar or a restaurant is a sweet fairy tale. For two hours the guest agrees to believe in a world you built — and any small detail can instantly wake them from that dream.',
    quoteAccent: 'fairy tale',
    quoteLead: 'One harsh light, one plastic tray, one visible printer — and the',
    quoteTail: 'ends.',
    quoteTail2: 'Design is the discipline of keeping the guest inside the story.',
  },
};
