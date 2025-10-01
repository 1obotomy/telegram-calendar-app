// backend/index.js
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

// ✅ Устанавливаем кнопку "📅 Open App" в меню бота
bot.setChatMenuButton({
  menu_button: {
    type: "web_app",
    text: "📅 Open App",
    web_app: { url: URL }
  }
});

// Webhook endpoint
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Команда /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Привет! Я календарь-бот. Добавляй напоминания!');
});

// Добавление напоминания
bot.onText(/\/add (.+)/, (msg, match) => {
  const text = match[1];
  const time = Date.now() + 60000; // через 1 минуту
  reminders.push({ text, time, sent: false });
  bot.sendMessage(msg.chat.id, `Напоминание "${text}" добавлено!`);
});

// Проверка и отправка напоминаний каждые 10 секунд
setInterval(() => {
  const now = Date.now();
  reminders.forEach(r => {
    if (!r.sent && r.time <= now) {
      bot.sendMessage(GROUP_ID, `⏰ Напоминание: ${r.text}`);
      r.sent = true;
    }
  });
}, 10000);

// Список напоминаний
bot.onText(/\/list/, (msg) => {
  if (!reminders.length) return bot.sendMessage(msg.chat.id, 'Нет напоминаний.');
  const list = reminders.map(r => `${r.sent ? '✅' : '🕒'} ${r.text}`).join('\n');
  bot.sendMessage(msg.chat.id, list);
});

// Веб-интерфейс для списка напоминаний
app.get("/", (req, res) => {
  if (!reminders.length) {
    return res.send("<h2>Нет напоминаний</h2>");
  }

  const upcoming = reminders.filter(r => !r.sent);
  const done = reminders.filter(r => r.sent);

  res.send(`
    <html>
      <head>
        <title>Telegram Calendar</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
          h2 { color: #333; }
          ul { list-style: none; padding: 0; }
          li { background: white; margin: 5px 0; padding: 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .done { color: green; }
          .upcoming { color: orange; }
        </style>
      </head>
      <body>
        <h2>Предстоящие напоминания</h2>
        <ul>
          ${upcoming.map(r => `<li class="upcoming">🕒 ${r.text}</li>`).join("") || "<li>Нет</li>"}
        </ul>
        <h2>Состоявшиеся напоминания</h2>
        <ul>
          ${done.map(r => `<li class="done">✅ ${r.text}</li>`).join("") || "<li>Нет</li>"}
        </ul>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
