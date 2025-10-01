const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.TOKEN;
const GROUP_ID = process.env.GROUP_ID;
const URL = process.env.URL;
const PORT = process.env.PORT || 10000;

if (!TOKEN || !GROUP_ID || !URL) {
  console.error('ERROR: TOKEN, GROUP_ID или URL не установлены');
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(`${URL}/bot${TOKEN}`);

let reminders = [];

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Я календарь-бот. Добавляй напоминания!');
});

bot.onText(/\/add (.+)/, (msg, match) => {
  const text = match[1];
  const time = Date.now() + 60000; // через 1 минуту
  reminders.push({ text, time, sent: false });
  bot.sendMessage(msg.chat.id, `Напоминание "${text}" добавлено!`);
});

setInterval(() => {
  const now = Date.now();
  reminders.forEach(r => {
    if (!r.sent && r.time <= now) {
      bot.sendMessage(GROUP_ID, `⏰ Напоминание: ${r.text}`);
      r.sent = true;
    }
  });
}, 10000);

bot.onText(/\/list/, (msg) => {
  if (!reminders.length) return bot.sendMessage(msg.chat.id, 'Нет напоминаний.');
  const list = reminders.map(r => `${r.sent ? '✅' : '🕒'} ${r.text}`).join('\n');
  bot.sendMessage(msg.chat.id, list);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
