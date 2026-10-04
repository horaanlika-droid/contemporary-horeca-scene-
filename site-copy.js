/* Public editable site copy for Contemporary Horeca Scene.
   These are the defaults rendered on the sign-in/registration page and the course
   landing hero / quote band. The administrator edits them from the Russian Telegram
   admin console; the server merges active overrides at GET /api/site. Keep English-only. */
window.SITE = {
  gate: {
    eyebrow: 'DIGITAL PRODUCT · 2026 EDITION',
    titleTop: 'Contemporary',
    titleAccent: 'Horeca',
    titleBottom: 'Scene',
    lead: 'A living digital elective on the venues, 50 Best menu concepts, industry leaders, found-object mockups and budgets shaping the contemporary horeca scene.',
    aboutCourse: 'ABOUT THE COURSE ↓',
    aboutAuthor: 'ABOUT THE AUTHOR ↗',
    formEyebrow: 'SIGN IN OR REGISTER',
    formTitle: 'Your account',
    formAccent: 'your access.',
    formLead: 'Sign in with your email and personal password. New learners use the same shared registration page after the course admin manually approves their Telegram account. If a password is forgotten, contact support only by email.',
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
  faq: [
    {
      question: 'How do I get access after buying through Tribute?',
      answer: 'Purchases happen in Tribute, outside the course app. Open the course bot before paying. After payment, the admin verifies and approves admission in the Telegram bot. The bot then sends the same shared registration-page link to every approved learner.',
    },
    {
      question: 'Is the registration link unique or one-time?',
      answer: 'No. There is one reusable registration link. Access is controlled by the admin approving your Telegram account, not by a private token in the link. Enter the Telegram username or numeric ID you used with the course bot when you register.',
    },
    {
      question: 'What do I do after my admission is approved?',
      answer: 'Open the shared registration page, enter your name, email and Telegram username or ID, then choose your personal password. The admin approval must be in place before the account can be created. Use your email and password for future sign-ins.',
    },
    {
      question: 'Can I ask a question about my project in real time?',
      answer: 'Yes. After signing in, open Project Q&A from the course navigation, add the project or concept you mean, and send your question. The conversation is private between you and the course team; new messages appear live while the chat is open, and the team receives a Telegram notification.',
    },
    {
      question: 'What if I forget my password?',
      answer: 'The password cannot be retrieved or resent. Contact course support only by email at egor.tarasenko@him-mail.ch.',
    },
  ],
};
