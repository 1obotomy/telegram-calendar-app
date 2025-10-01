const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ------------------
// Телеграм бот
// ------------------
const BOT_TOKEN = 'ВАШ_АКТУАЛЬНЫЙ_ТОКЕН_ЗДЕСЬ';
const bot = new Telegraf(BOT_TOKEN);

// Список напоминаний
let reminders = [
  { text: 'Проверить почту', status: 'upcoming' },
  { text: 'Созвон с командой', status: 'done' }
];

// Команда /start
bot.start((ctx) => {
  ctx.reply(
    'Привет! Нажми кнопку ниже, чтобы открыть миниапп:',
    Markup.inlineKeyboard([
      Markup.button.url('Открыть Mini App', 'https://telegram-calendar-app-1.onrender.com')
    ])
  );
});

// Отправка статуса напоминаний через команду /reminders
bot.command('reminders', (ctx) => {
  const message = reminders.map(r => `${r.text} — ${r.status}`).join('\n');
  ctx.reply(message);
});

// Запуск бота (polling)
bot.launch()
  .then(() => console.log('Bot started'))
  .catch(console.error);

// ------------------
// Раздача фронтенда для миниаппа
// ------------------
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ------------------
// Запуск Express
// ------------------
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
