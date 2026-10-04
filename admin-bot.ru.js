/* ============================================================================
   РУССКАЯ АДМИН-ПАНЕЛЬ В TELEGRAM · Contemporary Horeca Scene
   Inline-кнопки: заявки, студенты, платежи, материалы, анонсы и редактор
   существующих блоков курса (стартовая страница, лицевая, модули, уроки,
   кейсы, персоны, проекты). Текст вводится сообщением после нажатия кнопки;
   /cancel (или /отмена) отменяет ввод. Строки этого файла намеренно на
   русском языке — это внутренний инструмент администратора; студенческий
   интерфейс продукта остаётся английским (см. tests/english-content.test.js).
   Подключается только из server.js и никогда не отдаётся в браузер.
   ========================================================================== */
'use strict';

function createAdminConsole(deps) {
  const esc = deps.escapeHtml;
  const store = deps.store;

  /* ---------- справочники полей ---------- */
  const FIELD_LABELS = {
    title: 'Заголовок', description: 'Описание', image: 'Обложка',
    intro: 'Вступление', body: 'Основной текст', challenge: 'Задание',
    name: 'Название', role: 'Роль', summary: 'Сводка', tagline: 'Подзаголовок',
    lessonAngle: 'Угол для урока', takeaway: 'Вывод', context: 'Контекст',
    what: 'Что произошло', why: 'Почему важно',
  };
  const SITE_LABELS = {
    gate: {
      eyebrow: 'Надпись-«бровь»', titleTop: 'Заголовок: строка 1', titleAccent: 'Заголовок: акцент',
      titleBottom: 'Заголовок: строка 3', lead: 'Лид-текст под заголовком',
      aboutCourse: 'Кнопка «О курсе»', aboutAuthor: 'Кнопка «Об авторе»',
      formEyebrow: 'Надпись над формой', formTitle: 'Заголовок формы', formAccent: 'Акцент формы',
      formLead: 'Текст формы', infoEyebrow: 'Надпись «About the elective»',
      infoTitleTop: 'Инфо-заголовок: строка 1', infoTitleAccent: 'Инфо-заголовок: акцент',
      infoTitleBottom: 'Инфо-заголовок: строка 3', infoLead: 'Инфо-текст (после названия курса)',
    },
    landing: {
      heroEyebrow: '«Бровь» хиро', heroLead: 'Текст хиро', whyBig: 'Большое утверждение «why»',
      whyBigAccent: 'Акцент в утверждении', quoteEyebrow: 'Надпись цитаты',
      quoteText: 'Цитата: текст', quoteAccent: 'Цитата: акцент', quoteLead: 'Цитата: начало', quoteTail: 'Цитата: «ends.»', quoteTail2: 'Цитата: вторая строка',
    },
  };
  const SCOPE_FIELDS = {
    module: ['title', 'description', 'image'],
    lesson: ['title', 'intro', 'body', 'challenge'],
    case: ['title', 'context', 'what', 'why', 'takeaway'],
    figure: ['name', 'role', 'summary', 'lessonAngle', 'takeaway'],
    project: ['name', 'role', 'tagline', 'summary'],
  };

  /* ---------- помощники ---------- */
  const trunc = (value, n) => { const s = String(value ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? `${s.slice(0, n - 1)}…` : s; };
  const kb = rows => ({ inline_keyboard: rows });
  const btn = (text, callback_data) => ({ text, callback_data });

  function resolveTarget(scope, targetId) {
    const D = deps.courseData();
    if (!D) return null;
    if (scope === 'module') return D.modules.find(m => m.id === targetId) || null;
    if (scope === 'lesson') return D.modules.flatMap(m => m.lessons).find(l => l.id === targetId) || null;
    if (scope === 'case') { const i = Number(targetId); return Number.isInteger(i) ? (D.cases || [])[i] || null : null; }
    if (scope === 'figure') return (D.figures || []).find(f => f.id === targetId) || null;
    if (scope === 'project') return ((D.projects && D.projects.items) || []).find(p => p.id === targetId) || null;
    if (scope === 'site') return (deps.siteDefaults() || {})[targetId] || null;
    return null;
  }
  const allowedFields = (scope, targetId) => scope === 'site'
    ? Object.keys((deps.siteDefaults() || {})[targetId] || {}).filter(k => typeof (deps.siteDefaults() || {})[targetId][k] === 'string')
    : (SCOPE_FIELDS[scope] || []);

  function targetLabel(scope, targetId) {
    const t = resolveTarget(scope, targetId);
    if (scope === 'module' && t) return `Модуль ${t.number} · ${t.title}`;
    if (scope === 'lesson' && t) return `Урок · ${t.title}`;
    if (scope === 'case' && t) return `Кейс · ${t.title}`;
    if (scope === 'figure' && t) return `Персона · ${t.name}`;
    if (scope === 'project' && t) return `Проект · ${t.name}`;
    if (scope === 'site') return targetId === 'gate' ? 'Стартовая страница' : 'Лицевая страница (лендинг)';
    return targetId;
  }
  const fieldLabel = (scope, targetId, field) => (scope === 'site' ? (SITE_LABELS[targetId] || {})[field] : FIELD_LABELS[field]) || field;

  const overrideFor = (scope, targetId, field) =>
    store().editor.overrides.find(o => o.scope === scope && o.targetId === targetId && o.field === field) || null;
  const currentText = (scope, targetId, field) => overrideFor(scope, targetId, field)?.text ?? null;

  function upsertOverride(scope, targetId, field, text) {
    const previous = overrideFor(scope, targetId, field);
    if (previous) {
      previous.text = text;
      previous.updatedAt = new Date().toISOString();
      deps.saveStore();
      return previous;
    }
    const override = { id: deps.editorId('ovr'), scope, targetId, field, text, updatedAt: new Date().toISOString() };
    store().editor.overrides.unshift(override);
    deps.saveStore();
    return override;
  }
  function removeOverrides(scope, targetId) {
    const s = store();
    const before = s.editor.overrides.length;
    s.editor.overrides = s.editor.overrides.filter(o => !(o.scope === scope && o.targetId === targetId));
    deps.saveStore();
    return before - s.editor.overrides.length;
  }
  const revertOverride = id => {
    const s = store();
    const i = s.editor.overrides.findIndex(o => o.id === id);
    if (i === -1) return null;
    const [removed] = s.editor.overrides.splice(i, 1);
    deps.saveStore();
    return removed;
  };

  /* ---------- отложенный ввод текста ---------- */
  const setPending = (chatId, pending) => { store().adminBot.pending[chatId] = { ...pending, startedAt: Date.now() }; deps.saveStore(); };
  const getPending = chatId => store().adminBot.pending?.[chatId] || null;
  const clearPending = chatId => { if (store().adminBot.pending?.[chatId]) { delete store().adminBot.pending[chatId]; deps.saveStore(); } };

  const backDataFor = (scope, targetId) => {
    if (scope === 'module') return `m:${targetId}`;
    if (scope === 'lesson') { const m = deps.courseData()?.modules.find(x => x.lessons.some(l => l.id === targetId)); return m ? `m:${m.id}` : 'B'; }
    if (scope === 'site') return `S:${targetId}`;
    if (scope === 'case') return `c:${targetId}`;
    if (scope === 'figure') return `f:${targetId}`;
    if (scope === 'project') return `j:${targetId}`;
    return 'B';
  };
  const backLabelFor = (scope, targetId) => {
    if (scope === 'module') return '◀️ К модулю';
    if (scope === 'lesson') return '◀️ К уроку';
    if (scope === 'site') return '◀️ К блоку';
    if (scope === 'case') return '◀️ К кейсу';
    if (scope === 'figure') return '◀️ К персоне';
    if (scope === 'project') return '◀️ К проекту';
    return '◀️ Назад';
  };

  /* ---------- экраны ---------- */
  function mainMenu(extra = '') {
    const s = store();
    const waiting = s.submissions.filter(x => x.status === 'WAITING FOR REVIEW').length;
    const students = s.students.filter(x => String(x.source || '').startsWith('tribute-')).length;
    const logins = s.students.filter(x => x.login).length;
    const text = `${extra ? `${extra}\n\n` : ''}🎛 <b>Админ-панель</b> · Contemporary Horeca Scene\n📋 Заявок: ${waiting} · 👥 Студентов: ${students} · 🔑 Логинов: ${logins} · ↩️ Правок: ${s.editor.overrides.length}\n\nВыбирайте раздел кнопками.`;
    return {
      text,
      keyboard: kb([
        [btn(`📋 Заявки${waiting ? ` (${waiting})` : ''}`, 'P'), btn(`↩️ Правки (${s.editor.overrides.length})`, 'O:0')],
        [btn('🧱 Блоки курса', 'B')],
        [btn('📚 Материалы', 'T:0'), btn('📣 Анонсы', 'N:0')],
        [btn('👥 Студенты', 'U'), btn('💳 Платежи', 'D')],
        [btn('🔑 Логины', 'W:0'), btn('⚙️ Статус', 'K')],
        [btn('ℹ️ Команды', 'H')],
      ]),
    };
  }

  function blocksMenu() {
    const rows = [[btn('🏠 Стартовая страница', 'S:gate'), btn('📰 Лицевая', 'S:landing')]];
    for (const m of deps.courseModules()) rows.push([btn(`${m.number} · ${trunc(m.title, 26)}`, `m:${m.id}`)]);
    rows.push([btn('🧑‍ Персоны', 'FL:0'), btn('🗂 Кейсы', 'CL:0'), btn('🗃 Проекты', 'JL:0')]);
    rows.push([btn('◀️ Назад', 'M')]);
    return { text: '🧱 <b>Блоки курса</b>\nЧто редактируем: стартовая и лицевая страницы, модули и уроки, персоны, кейсы, проекты.', keyboard: kb(rows) };
  }

  function fieldButtons(scope, targetId) {
    return allowedFields(scope, targetId).map(field => {
      const edited = currentText(scope, targetId, field) !== null ? '🟢' : '✏️';
      return [btn(`${edited} ${fieldLabel(scope, targetId, field)}`, `E:${scope}:${targetId}:${field}`)];
    });
  }

  function moduleScreen(id) {
    const m = deps.courseData()?.modules.find(x => x.id === id);
    if (!m) return null;
    const desc = currentText('module', id, 'description') ?? m.description;
    const rows = fieldButtons('module', id);
    rows.push([btn('↩️ Сбросить правки модуля', `R:module:${id}`)]);
    for (const l of m.lessons) rows.push([btn(`📖 ${trunc(l.title, 34)}`, `l:${l.id}`)]);
    rows.push([btn('◀️ К блокам', 'B')]);
    return {
      text: `🧩 <b>Модуль ${m.number} · ${esc(m.title)}</b>\n\n📝 ${esc(trunc(desc, 320))}\n🖼 Обложка: <code>${esc(m.image)}</code>${currentText('module', id, 'image') ? `\n🟢 Обложка заменена: <code>${esc(currentText('module', id, 'image'))}</code>` : ''}\n\n🟢 — поле уже переопределено.`,
      keyboard: kb(rows),
    };
  }

  function lessonScreen(id) {
    const D = deps.courseData();
    const module = D?.modules.find(x => x.lessons.some(l => l.id === id));
    const lesson = module?.lessons.find(l => l.id === id);
    if (!lesson) return null;
    const rows = fieldButtons('lesson', id);
    rows.push([btn('↩️ Сбросить правки урока', `R:lesson:${id}`)]);
    rows.push([btn(`◀️ Модуль ${module.number}`, `m:${module.id}`), btn('🧱 Блоки', 'B')]);
    const body = currentText('lesson', id, 'body') ?? lesson.body;
    return { text: `📖 <b>${esc(lesson.title)}</b>\nМодуль ${module.number} · ${esc(module.title)}\n\n${esc(trunc(body, 320))}`, keyboard: kb(rows) };
  }

  function siteScreen(targetId) {
    const group = (deps.siteDefaults() || {})[targetId];
    if (!group) return null;
    const rows = fieldButtons('site', targetId);
    rows.push([btn('↩️ Сбросить блок', `R:site:${targetId}`), btn('◀️ К блокам', 'B')]);
    const title = targetId === 'gate' ? '🏠 <b>Стартовая страница</b> (экран пароля)' : '📰 <b>Лицевая страница</b> (хиро и цитата)';
    const leadKey = targetId === 'gate' ? 'lead' : 'heroLead';
    return { text: `${title}\n\nТекущий лид: ${esc(trunc(currentText('site', targetId, leadKey) ?? group[leadKey], 260))}\n\n🟢 — поле уже переопределено.`, keyboard: kb(rows) };
  }

  function paged(listKind, page, items, makeBtn, backData, title) {
    const perPage = 6;
    const pages = Math.max(1, Math.ceil(items.length / perPage));
    const p = Math.min(Math.max(0, page), pages - 1);
    const rows = items.map((item, globalIndex) => ({ item, globalIndex }))
      .slice(p * perPage, (p + 1) * perPage)
      .map(({ item, globalIndex }) => makeBtn(item, globalIndex));
    const nav = [];
    if (p > 0) nav.push(btn('←', `${listKind}:${p - 1}`));
    nav.push(btn(`${p + 1}/${pages}`, 'NO'));
    if (p < pages - 1) nav.push(btn('→', `${listKind}:${p + 1}`));
    rows.push(nav, [btn('◀️ К блокам', backData)]);
    return { text: `${title} · страница ${p + 1} из ${pages}`, keyboard: kb(rows) };
  }

  const caseList = page => paged('CL', page, deps.courseData()?.cases || [], (c, i) => [btn(`🗂 ${trunc(c.title, 30)}`, `c:${i}`)], 'B', '🗂 <b>Кейсы</b>');
  const figureList = page => paged('FL', page, deps.courseData()?.figures || [], f => [btn(`🧑🎨 ${trunc(f.name, 28)}`, `f:${f.id}`)], 'B', '🧑‍🎨 <b>Персоны индустрии</b>');
  const projectList = page => paged('JL', page, deps.courseData()?.projects?.items || [], p => [btn(`🗃 ${trunc(p.name, 28)}`, `j:${p.id}`)], 'B', '🗃 <b>Проекты автора</b>');

  function caseScreen(index) {
    const c = (deps.courseData()?.cases || [])[Number(index)];
    if (!c) return null;
    const rows = fieldButtons('case', String(index));
    rows.push([btn('↩️ Сбросить', `R:case:${index}`), btn('◀️ Кейсы', 'CL:0')]);
    return { text: `🗂 <b>${esc(c.title)}</b>\n${esc(c.location || '')}\n\n${esc(trunc(currentText('case', String(index), 'why') ?? c.why, 300))}`, keyboard: kb(rows) };
  }
  function figureScreen(id) {
    const f = (deps.courseData()?.figures || []).find(x => x.id === id);
    if (!f) return null;
    const rows = fieldButtons('figure', id);
    rows.push([btn('↩️ Сбросить', `R:figure:${id}`), btn('◀️ Персоны', 'FL:0')]);
    return { text: `🧑🎨 <b>${esc(f.name)}</b> · ${esc(f.role || '')}\n\n${esc(trunc(currentText('figure', id, 'summary') ?? f.summary, 300))}`, keyboard: kb(rows) };
  }
  function projectScreen(id) {
    const p = (deps.courseData()?.projects?.items || []).find(x => x.id === id);
    if (!p) return null;
    const rows = fieldButtons('project', id);
    rows.push([btn('↩️ Сбросить', `R:project:${id}`), btn('◀️ Проекты', 'JL:0')]);
    return { text: `🗃 <b>${esc(p.name)}</b> · ${esc(p.year || '')}\n\n${esc(trunc(currentText('project', id, 'tagline') ?? p.tagline, 300))}`, keyboard: kb(rows) };
  }

  function overridesScreen(page) {
    const items = store().editor.overrides;
    if (!items.length) return { text: '↩️ Активных правок нет — курс читается как опубликован.', keyboard: kb([[btn('◀️ Назад', 'M')]]) };
    return paged('O', page, items, o => [btn(`↩️ ${o.scope}:${trunc(o.targetId, 14)}.${o.field} · ${trunc(o.text, 18)}`, `o:${o.id}`)], 'M', '↩️ <b>Правки блоков</b> — нажмите, чтобы откатить');
  }

  function submissionsScreen(page) {
    const waiting = store().submissions.filter(x => x.status === 'WAITING FOR REVIEW');
    if (!waiting.length) return { text: '📋 Нет заявок, ожидающих проверки.', keyboard: kb([[btn('🔄 Обновить', 'P'), btn('◀️ Назад', 'M')]]) };
    return paged('P', page, waiting, s => [
      btn('✅', `a:${s.id}`), btn(`${trunc(s.name, 16)} · ${trunc(s.assignment, 22)}`, `V:${s.id}`), btn('✏️', `v:${s.id}`),
    ], 'M', '📋 <b>Заявки на проверку</b>\n✅ принять · ✏️ на доработку · название — подробнее');
  }
  function submissionDetail(id) {
    const s = store().submissions.find(x => x.id === id);
    if (!s) return null;
    const files = (s.files || []).map(f => f.name).join(', ') || 'нет файлов';
    return {
      text: `📋 <b>${esc(s.assignment)}</b>\nСтудент: ${esc(s.name)} (${esc(s.student)})\nФайлы: ${esc(files)}\nID: <code>${esc(s.id)}</code>\n\nОтвет:\n${esc(trunc(s.answer, 900))}`,
      keyboard: kb([[btn('✅ Принять', `a:${s.id}`), btn('✏️ На доработку', `v:${s.id}`)], [btn('◀️ К заявкам', 'P')]]),
    };
  }

  function studentsScreen() {
    const learners = store().students.filter(x => String(x.source || '').startsWith('tribute-'));
    if (!learners.length) return { text: '👥 Студентов с оплатой Tribute пока нет.', keyboard: kb([[btn('◀️ Назад', 'M')]]) };
    const rows = learners.slice(0, 12).map(s => [btn(`${deps.isStudentAccessActive(s) ? '🟢' : '⚪️'} ${trunc(s.name, 24)}`, 'NO')]);
    rows.push([btn('◀️ Назад', 'M')]);
    return { text: `👥 <b>Студенты</b> · ${learners.length}\n🟢 активен · ⚪️ неактивен`, keyboard: kb(rows) };
  }

  function ordersScreen() {
    const orders = store().tribute.orders;
    if (!orders.length) return { text: '💳 Платежных событий Tribute ещё не было.', keyboard: kb([[btn('◀️ Назад', 'M')]]) };
    const rows = orders.slice(0, 10).map(o => [btn(`${o.status === 'PAID' ? '💰' : ''} ${trunc(o.buyerName || o.telegramId || 'buyer', 20)} · ${trunc(o.deliveryStatus || '—', 10)}`, 'NO')]);
    rows.push([btn('◀️ Назад', 'M')]);
    return { text: `💳 <b>Платежи Tribute</b> · ${orders.length}`, keyboard: kb(rows) };
  }

  function credentialsScreen(page) {
    const learners = store().students.filter(x => x.login);
    if (!learners.length) {
      const pending = store().students.filter(x => !x.login && String(x.source || '').startsWith('tribute-'));
      const hint = pending.length ? `\n\nОжидают генерации: ${pending.length} (оплата есть, логин ещё не выдан). Используйте кнопки ниже или команду /issue <telegram_id>.` : '\n\nЛогины выдаются только после подтверждённой оплаты Tribute — команда /issue <telegram_id>.';
      return {
        text: `🔑 <b>Логины</b> · пока нет выданных${hint}`,
        keyboard: kb([
          [btn('➕ Выдать логин', 'CG')],
          [btn('📋 Ожидающие оплату', 'WG:0')],
          [btn('◀️ Назад', 'M')],
        ]),
      };
    }
    return paged('W', page, learners, s => {
      const active = deps.isStudentAccessActive(s) ? '🟢' : '⚪️';
      const label = `${active} ${trunc(s.login, 18)} · ${trunc(s.name, 14)}`;
      return [btn(label, `WC:${s.id}`)];
    }, 'M', '🔑 <b>Выданные логины</b> — нажмите для деталей и сброса пароля');
  }

  function credentialDetail(id) {
    const s = store().students.find(x => x.id === id);
    if (!s) return null;
    const hasPaid = store().tribute.orders.some(o => o.studentId === s.id && o.status === 'PAID');
    const active = deps.isStudentAccessActive(s) ? 'АКТИВЕН' : 'НЕАКТИВЕН';
    const text = `🔑 <b>${esc(s.login)}</b>\nСтудент: ${esc(s.name)} (${esc(s.email)})\nTelegram: ${esc(s.telegramUsername ? '@' + s.telegramUsername : s.telegramId || 'не привязан')}\nСтатус: ${active} · ${esc(s.registrationStatus || '—')}\nОплата Tribute: ${hasPaid ? 'подтверждена' : 'не найдена'}\nID: <code>${esc(s.id)}</code>\n\nПароль не показывается (хранится как hash). Нажмите «Сбросить» чтобы выдать новый.`;
    return {
      text,
      keyboard: kb([
        [btn('🔄 Сбросить пароль', `RC:${s.id}`), btn('👁 Оплата', `WC:${s.id}`)],
        [btn('◀️ К логинам', 'W:0')],
      ]),
    };
  }

  function materialsScreen(page) {
    const items = store().editor.materials;
    const rows = [[btn('➕ Добавить материал', 'A')]];
    if (items.length) {
      const perPage = 5;
      const pages = Math.max(1, Math.ceil(items.length / perPage));
      const p = Math.min(Math.max(0, page), pages - 1);
      for (const item of items.slice(p * perPage, (p + 1) * perPage)) {
        rows.push([btn('🗑', `x:${item.id}`), btn(`M${item.moduleNumber} · ${trunc(item.note, 26)}`, 'NO')]);
      }
      const nav = [];
      if (p > 0) nav.push(btn('←', `T:${p - 1}`));
      nav.push(btn(`${p + 1}/${pages}`, 'NO'));
      if (p < pages - 1) nav.push(btn('→', `T:${p + 1}`));
      rows.push(nav);
    }
    rows.push([btn('◀️ Назад', 'M')]);
    return { text: `📚 <b>Материалы</b> · ${items.length}\nДобавляются в конец блока модуля. 🗑 — удалить.`, keyboard: kb(rows) };
  }

  function postsScreen(page) {
    const items = store().editor.posts;
    const rows = [[btn('➕ Опубликовать анонс', 'AP')]];
    if (items.length) {
      const perPage = 6;
      const pages = Math.max(1, Math.ceil(items.length / perPage));
      const p = Math.min(Math.max(0, page), pages - 1);
      for (const item of items.slice(p * perPage, (p + 1) * perPage)) {
        rows.push([btn('🗑', `q:${item.id}`), btn(`${trunc(item.title, 30)}`, 'NO')]);
      }
      const nav = [];
      if (p > 0) nav.push(btn('←', `N:${p - 1}`));
      nav.push(btn(`${p + 1}/${pages}`, 'NO'));
      if (p < pages - 1) nav.push(btn('→', `N:${p + 1}`));
      rows.push(nav);
    }
    rows.push([btn('◀️ Назад', 'M')]);
    return { text: `📣 <b>Анонсы</b> · ${items.length}\nПопадают на страницу Updates курса. 🗑 — удалить.`, keyboard: kb(rows) };
  }

  function statusScreen() {
    const tribute = deps.getTributeStatus();
    const s = store();
    return {
      text: [
        '⚙️ <b>Статус</b>',
        `Tribute: ${esc(tribute.mode || '—')} · доставка: ${tribute.deliveryReady ? 'готова' : 'не готова'}`,
        `Админ-чаты бота: ${s.adminBot.adminChatIds.length}`,
        `Студентов: ${s.students.length} · Заявок: ${s.submissions.length}`,
        `Материалов: ${s.editor.materials.length} · Анонсов: ${s.editor.posts.length} · Правок: ${s.editor.overrides.length}`,
        '',
        'Последние события:',
        ...s.adminBot.logs.slice(0, 5).map(l => `· ${esc(trunc(l.text, 90))}`),
      ].join('\n'),
      keyboard: kb([[btn('🔄 Обновить', 'K'), btn('◀️ Назад', 'M')]]),
    };
  }

  const helpText = () => [
    'ℹ️ <b>Как пользоваться панелью</b>',
    'Все разделы — на inline-кнопках. Редактирование блока: раздел → блок → поле → пришлите новый текст сообщением → ✅ сохранено.',
    '/cancel или /отмена — отменить ввод. /панель — главное меню.',
    '',
    'Текстовые команды (англ.) тоже работают:',
    '/admissions · /admit <student_id> · /reject <student_id> · /students · /orders · /resend <telegram_id>',
    '/issue <telegram_id> — выдать логин+пароль (только после оплаты Tribute) · /reset <telegram_id> — новый пароль · /credentials [id] — список логинов',
    '/pending · /approve <id> <текст> · /revise <id> <текст> · /chat — открыть Project Q&A в приложении',
    '/addmat <модуль> <https url> <описание> · /materials · /editmat · /delmat',
    '/post <заголовок> | <текст> · /posts · /delpost',
    '/editmodule · /editlesson · /overrides · /revert <id>',
  ].join('\n');

  /* ---------- обработка отложенного ввода ---------- */
  async function processPending(chatId, pending, text) {
    const send = (t, k) => deps.sendTelegramMessage(chatId, t, k);
    switch (pending.kind) {
      case 'text': {
        if (!allowedFields(pending.scope, pending.targetId).includes(pending.field)) {
          clearPending(chatId);
          return send('⚠️ Поле больше недоступно. Ввод отменён.');
        }
        let value = text;
        if (pending.field === 'image') {
          const url = deps.validHttpsUrl(text);
          const fileOk = /^[A-Za-z0-9._-]+\.(jpe?g|png|webp)$/i.test(text.trim());
          if (!url && !fileOk) return send('⚠️ Для обложки нужно имя файла (jpg/png/webp) из presentation/assets/ или https-ссылка. Попробуйте ещё раз.');
          value = url || text.trim();
        }
        if (value.length > 4000) return send('⚠️ Слишком длинно: максимум 4000 символов. Попробуйте ещё раз.');
        const override = upsertOverride(pending.scope, pending.targetId, pending.field, value);
        clearPending(chatId);
        deps.addBotLog('editor', `[ru-panel] ${pending.scope}:${pending.targetId}.${pending.field} edited (${override.id})`);
        return send(
          `✅ <b>Сохранено</b> · ${esc(targetLabel(pending.scope, pending.targetId))} · «${esc(fieldLabel(pending.scope, pending.targetId, pending.field))}»\n${esc(trunc(value, 260))}\n\nПравка применится в приложении при следующей загрузке контента.`,
          kb([
            [btn('🔄 Изменить ещё раз', `E:${pending.scope}:${pending.targetId}:${pending.field}`)],
            [btn('↩️ Откатить', `o:${override.id}`), btn(backLabelFor(pending.scope, pending.targetId), backDataFor(pending.scope, pending.targetId))],
            [btn('🎛 В меню', 'M')],
          ]),
        );
      }
      case 'review': {
        const result = deps.applyAdminReview({ submissionId: pending.submissionId, decision: pending.decision, feedbackText: text, via: 'admin-bot-ru' });
        clearPending(chatId);
        if (result.error) return send(`⚠️ Заявка не найдена: ${esc(pending.submissionId)}`);
        return send(`✅ Обратная связь отправлена студенту · ${esc(result.submission.name)} · статус: ${pending.decision === 'APPROVED' ? 'ПРИНЯТО' : 'НА ДОРАБОТКУ'}.`, kb([[btn('📋 К заявкам', 'P'), btn('🎛 В меню', 'M')]]));
      }
      case 'mat-url': {
        const url = deps.validHttpsUrl(text);
        if (!url) return send('⚠️ Нужна https-ссылка. Попробуйте ещё раз или /cancel.');
        setPending(chatId, { kind: 'mat-note', moduleId: pending.moduleId, url });
        return send(' Ссылка принята. Теперь пришлите короткое описание материала.');
      }
      case 'mat-note': {
        const module = deps.courseModules().find(m => m.id === pending.moduleId);
        if (!module) { clearPending(chatId); return send('⚠️ Модуль не найден. Ввод отменён.'); }
        const material = { id: deps.editorId('mat'), moduleId: module.id, moduleNumber: module.number, url: pending.url, note: text, addedAt: new Date().toISOString(), updatedAt: null };
        store().editor.materials.unshift(material);
        deps.saveStore();
        clearPending(chatId);
        deps.addBotLog('editor', `[ru-panel] material added to M${module.number}: ${text}`);
        return send(`📚 Добавлено в модуль ${module.number} (${esc(module.title)}):\n${esc(text)}\n${esc(pending.url)}`, kb([[btn('📚 К материалам', 'T:0'), btn('🎛 В меню', 'M')]]));
      }
      case 'post-title': {
        setPending(chatId, { kind: 'post-text', title: text });
        return send('📣 Заголовок принят. Теперь пришлите текст анонса.');
      }
      case 'post-text': {
        const post = { id: deps.editorId('post'), tag: 'LIVE COURSE UPDATE', title: pending.title, text, date: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }), createdAt: new Date().toISOString() };
        store().editor.posts.unshift(post);
        deps.saveStore();
        clearPending(chatId);
        deps.addBotLog('editor', `[ru-panel] post published: ${pending.title}`);
        return send(`📣 Анонс опубликован: <b>${esc(pending.title)}</b>\nПоявится на странице Updates.`, kb([[btn('📣 К анонсам', 'N:0'), btn('🎛 В меню', 'M')]]));
      }
      case 'cred-issue': {
        clearPending(chatId);
        const identifier = text.trim();
        if (!identifier) return send('⚠️ Укажите Telegram ID, @username или student_id.', kb([[btn('🎛 В меню', 'M')]]));
        const result = await deps.executeBotCommand(`/issue ${identifier}`);
        return send(result.reply, kb([[btn('🔑 К логинам', 'W:0'), btn('🎛 В меню', 'M')]]));
      }
      default:
        clearPending(chatId);
        return send('⚠️ Ввод отменён: неизвестный сценарий.');
    }
  }

  /* ---------- сообщения ---------- */
  async function handleAdminMessage(message) {
    const chatId = String(message.chat.id);
    const text = String(message.text || '').trim();
    const pending = getPending(chatId);
    const commandMatch = text.match(/^\/([A-Za-zА-Яа-яЁё_]+)/);

    if (pending) {
      if (commandMatch && /^(cancel|отмена|стоп)$/i.test(commandMatch[1])) {
        clearPending(chatId);
        return deps.sendTelegramMessage(chatId, '❌ Ввод отменён.', kb([[btn('🎛 В меню', 'M')]]));
      }
      if (!commandMatch) return processPending(chatId, pending, text);
      clearPending(chatId);
    }

    if (commandMatch) {
      const cmd = commandMatch[1].toLowerCase();
      if (['start', 'panel', 'menu', 'панель', 'меню', 'старт'].includes(cmd)) {
        const screen = mainMenu();
        return deps.sendTelegramMessage(chatId, screen.text, screen.keyboard);
      }
      if (['help', 'помощь'].includes(cmd)) return deps.sendTelegramMessage(chatId, helpText());
      if (['cancel', 'отмена'].includes(cmd)) return deps.sendTelegramMessage(chatId, 'Нет активного ввода.');
      const result = await deps.executeBotCommand(text);
      return deps.sendTelegramMessage(chatId, result.reply);
    }
    const screen = mainMenu('💬 Используйте кнопки ниже.');
    return deps.sendTelegramMessage(chatId, screen.text, screen.keyboard);
  }

  /* ---------- callbacks ---------- */
  async function handleCallback(callback) {
    const chatId = String(callback.message?.chat?.id || '');
    const msgId = callback.message?.message_id;
    const data = String(callback.data || '');
    if (!chatId) return;
    await deps.answerCallbackQuery(callback.id);
    const send = (t, k) => deps.sendTelegramMessage(chatId, t, k);
    const go = async screen => {
      if (!screen) return send('⚠️ Блок не найден.', kb([[btn('🎛 В меню', 'M')]]));
      if (msgId) await deps.editTelegramMessage(chatId, msgId, screen.text, screen.keyboard);
      else await send(screen.text, screen.keyboard);
    };
    const [head, arg1, arg2, arg3] = data.split(':');

    if (data === 'M') return go(mainMenu());
    if (data === 'B') return go(blocksMenu());
    if (data === 'P') return go(submissionsScreen(0));
    if (data === 'U') return go(studentsScreen());
    if (data === 'D') return go(ordersScreen());
    if (data === 'K') return go(statusScreen());
    if (data === 'NO') return; // informational button
    if (data === 'H') return send(helpText(), kb([[btn('◀️ Назад', 'M')]]));
    if (data === 'ZC') { clearPending(chatId); return send('❌ Ввод отменён.', kb([[btn('🎛 В меню', 'M')]])); }

    if (head === 'm') return go(moduleScreen(arg1));
    if (head === 'l') return go(lessonScreen(arg1));
    if (head === 'S') return go(siteScreen(arg1));
    if (head === 'CL') return go(caseList(Number(arg1 || 0)));
    if (head === 'FL') return go(figureList(Number(arg1 || 0)));
    if (head === 'JL') return go(projectList(Number(arg1 || 0)));
    if (head === 'c') return go(caseScreen(arg1));
    if (head === 'f') return go(figureScreen(arg1));
    if (head === 'j') return go(projectScreen(arg1));
    if (head === 'O') return go(overridesScreen(Number(arg1 || 0)));
    if (head === 'T') return go(materialsScreen(Number(arg1 || 0)));
    if (head === 'N') return go(postsScreen(Number(arg1 || 0)));
    if (head === 'V') return go(submissionDetail(arg1));

    if (head === 'E') {
      const scope = arg1, targetId = arg2, field = arg3;
      if (!resolveTarget(scope, targetId) || !allowedFields(scope, targetId).includes(field)) {
        return send('⚠️ Блок или поле не найдены.');
      }
      const original = resolveTarget(scope, targetId)[field];
      const current = currentText(scope, targetId, field) ?? (typeof original === 'string' ? original : '');
      setPending(chatId, { kind: 'text', scope, targetId, field });
      return send(
        `✏️ <b>Новое значение</b>\nБлок: ${esc(targetLabel(scope, targetId))}\nПоле: «${esc(fieldLabel(scope, targetId, field))}»\nСейчас: ${esc(trunc(current, 200))}\n\nПришлите новый текст одним сообщением.${field === 'image' ? '\nДля обложки: имя файла из presentation/assets/ (например project-joi-bar.jpg) или https-ссылка.' : ''}\n/cancel — отмена.`,
        kb([[btn('❌ Отмена', 'ZC')]]),
      );
    }

    if (head === 'R') {
      const scope = arg1, targetId = arg2;
      const n = removeOverrides(scope, targetId);
      await deps.answerCallbackQuery(callback.id, `Сброшено правок: ${n}`);
      deps.addBotLog('editor', `[ru-panel] reverted ${n} override(s) for ${scope}:${targetId}`);
      if (scope === 'module') return go(moduleScreen(targetId));
      if (scope === 'lesson') return go(lessonScreen(targetId));
      if (scope === 'site') return go(siteScreen(targetId));
      if (scope === 'case') return go(caseScreen(targetId));
      if (scope === 'figure') return go(figureScreen(targetId));
      if (scope === 'project') return go(projectScreen(targetId));
      return go(mainMenu());
    }

    if (head === 'o') {
      const removed = revertOverride(arg1);
      if (!removed) return send('⚠️ Правка не найдена.');
      deps.addBotLog('editor', `[ru-panel] reverted ${removed.scope}:${removed.targetId}.${removed.field}`);
      return go(overridesScreen(0));
    }

    if (head === 'a') {
      const result = deps.applyAdminReview({ submissionId: arg1, decision: 'APPROVED', feedbackText: 'Отличная работа! Задание принято.', via: 'admin-bot-ru' });
      if (result.error) return send(`⚠️ Заявка не найдена: ${esc(arg1)}`);
      await send(`✅ Принято: ${esc(result.submission.name)} · ${esc(result.submission.assignment)}. Студент получил уведомление.`);
      return go(submissionsScreen(0));
    }
    if (head === 'v') {
      setPending(chatId, { kind: 'review', submissionId: arg1, decision: 'REVISION REQUESTED' });
      return send(`✏️ <b>Доработка</b> · заявка <code>${esc(arg1)}</code>\nПришлите текст обратной связи для студента одним сообщением.\n/cancel — отмена.`, kb([[btn('❌ Отмена', 'ZC')]]));
    }

    if (head === 'A') {
      const rows = deps.courseModules().map(m => [btn(`${m.number} · ${trunc(m.title, 22)}`, `AM:${m.id}`)]);
      rows.push([btn('❌ Отмена', 'ZC')]);
      return send('📚 <b>Новый материал</b>\nВ какой модуль добавить?', kb(rows));
    }
    if (head === 'AM') {
      const module = deps.courseModules().find(m => m.id === arg1);
      if (!module) return send('⚠️ Модуль не найден.');
      setPending(chatId, { kind: 'mat-url', moduleId: module.id });
      return send(`📚 Модуль ${module.number} · ${esc(module.title)}\nПришлите https-ссылку на материал.\n/cancel — отмена.`, kb([[btn('❌ Отмена', 'ZC')]]));
    }
    if (head === 'AP') {
      setPending(chatId, { kind: 'post-title' });
      return send('📣 <b>Новый анонс</b>\nПришлите заголовок одним сообщением.\n/cancel — отмена.', kb([[btn('❌ Отмена', 'ZC')]]));
    }
    if (head === 'x') {
      const s = store();
      const i = s.editor.materials.findIndex(m => m.id === arg1);
      if (i === -1) return send('⚠️ Материал не найден.');
      const [removed] = s.editor.materials.splice(i, 1);
      deps.saveStore();
      deps.addBotLog('editor', `[ru-panel] material removed: ${removed.id}`);
      return go(materialsScreen(0));
    }
    if (head === 'q') {
      const s = store();
      const i = s.editor.posts.findIndex(p => p.id === arg1);
      if (i === -1) return send('⚠️ Анонс не найден.');
      const [removed] = s.editor.posts.splice(i, 1);
      deps.saveStore();
      deps.addBotLog('editor', `[ru-panel] post removed: ${removed.id}`);
      return go(postsScreen(0));
    }
    if (data === 'W:0' || head === 'W') return go(credentialsScreen(Number(arg1 || 0)));
    if (head === 'WC') return go(credentialDetail(arg1));
    if (head === 'RC') {
      const s = store().students.find(x => x.id === arg1);
      if (!s) return send('⚠️ Студент не найден.');
      const result = await deps.executeBotCommand(`/reset ${s.telegramId || s.id}`);
      await send(result.reply);
      return go(credentialDetail(arg1));
    }
    if (data === 'CG') {
      setPending(chatId, { kind: 'cred-issue' });
      return send('🔑 <b>Выдача логина</b>\nПришлите Telegram ID, @username или student_id. Логин и пароль будут выданы только если есть подтверждённая оплата Tribute.\n/cancel — отмена.', kb([[btn('❌ Отмена', 'ZC')]]));
    }
    if (head === 'WG') {
      const pending = store().students.filter(x => !x.login && String(x.source || '').startsWith('tribute-')).slice(0, 20);
      if (!pending.length) return send('Нет ожидающих генерации логина.', kb([[btn('🔑 К логинам', 'W:0'), btn('◀️ Назад', 'M')]]));
      const rows = pending.map(s => [btn(`${trunc(s.name, 20)} · ${s.telegramId || 'no telegram'}`, `WC:${s.id}`)]);
      rows.push([btn('◀️ К логинам', 'W:0')]);
      return go({ text: `📋 <b>Ожидают логин</b> — оплата подтверждена, логин ещё не выдан (или студент не найден):`, keyboard: kb(rows) });
    }
    return;
  }

  /* ---------- уведомления о заявках ---------- */
  async function notifySubmission(submission) {
    const fileNames = (submission.files || []).map(f => f.name).join(', ') || 'нет файлов';
    const summary = `📩 <b>Новая заявка: ${esc(submission.assignment)}</b>\nСтудент: ${esc(submission.name)} (${esc(submission.student)})\nФайлы: ${esc(fileNames)}\nID: <code>${esc(submission.id)}</code>\n\nОтвет:\n${esc(String(submission.answer || '').slice(0, 600))}`;
    for (const chatId of store().adminBot.adminChatIds) {
      await deps.sendTelegramMessage(chatId, summary, kb([
        [btn('✅ Принять', `a:${submission.id}`), btn('✏️ На доработку', `v:${submission.id}`)],
        [btn('👁 Подробнее', `V:${submission.id}`)],
      ]));
    }
  }

  async function showMainMenu(chatId, notice = '') {
    const screen = mainMenu(notice);
    await deps.sendTelegramMessage(chatId, screen.text, screen.keyboard);
  }

  async function showAuthorized(chatId) {
    await showMainMenu(chatId, '✅ Вы авторизованы как администратор Contemporary Horeca Scene.');
  }

  return { handleAdminMessage, handleCallback, notifySubmission, showMainMenu, showAuthorized };
}

module.exports = { createAdminConsole };
