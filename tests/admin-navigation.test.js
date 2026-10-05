'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createAdminConsole } = require('../admin-bot.ru');

test('admin credentials, navigation, payment details and reset confirmation', async () => {
  const students = [
    { id: 'paid', name: 'Paid', telegramId: '123', source: 'tribute-product' },
    { id: 'issued', name: 'Issued', login: 'learner', telegramId: '124' },
    { id: 'unpaid', name: 'Unpaid', source: 'tribute-product' },
  ];
  const state = { students, tribute: { orders: [{ id: 'digital:1', studentId: 'paid', status: 'PAID', amount: '49 EUR' }] },
    submissions: Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, name: `Student ${i}`, status: 'WAITING FOR REVIEW' })),
    editor: { overrides: [] }, adminBot: { pending: {} } };
  const sent = [], commands = [];
  const bot = createAdminConsole({ store: () => state, saveStore() {}, escapeHtml: String,
    isStudentAccessActive: () => true, answerCallbackQuery: async () => true,
    editTelegramMessage: async () => false,
    sendTelegramMessage: async (_, text, keyboard) => { sent.push({ text, keyboard }); return true; },
    executeBotCommand: async command => { commands.push(command); return { ok: true, reply: 'Done' }; },
  });
  const click = data => bot.handleCallback({ id: 'c', data, message: { chat: { id: '1' }, message_id: 3 } });
  const buttons = () => sent.at(-1).keyboard.inline_keyboard.flat().map(b => b.callback_data);
  await click('W:0');
  assert.ok(buttons().includes('CG'), 'issuance stays available with existing logins');
  await click('WG:0');
  assert.ok(buttons().includes('WC:paid'));
  assert.ok(!buttons().includes('WC:unpaid'));
  await click('WC:paid');
  assert.ok(buttons().includes('IC:paid'));
  await click('IC:paid');
  assert.equal(commands.at(-1), '/issue paid');
  await click('RC:issued');
  assert.equal(commands.length, 1, 'reset needs confirmation');
  await click('RX:issued');
  assert.equal(commands.at(-1), '/reset 124');
  await click('CG');
  assert.ok(state.adminBot.pending['1']);
  await click('M');
  assert.equal(state.adminBot.pending['1'], undefined, 'navigation cancels old input');
  await click('U');
  assert.ok(buttons().includes('WC:paid'), 'student rows open details');
  await click('D');
  assert.ok(buttons().includes('OD:0'));
  await click('OD:0');
  assert.match(sent.at(-1).text, /digital:1/);
  await click('P:1');
  assert.ok(buttons().includes('V:s6'), 'submission pagination works');
  await click('obsolete');
  assert.ok(buttons().includes('M'), 'stale buttons offer recovery');
});
