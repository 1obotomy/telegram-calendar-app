// backend/index.js

const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// ------------------------
// Telegram Bot Setup
// ------------------------
const BOT_TOKEN = '8381157293:AAHsoo8VMQ9kEmPMCbGbwUO1P17jwmmFM6g';
const bot = new Telegraf(BOT_TOKEN);

// Обработчик команды /start
bot.start(async (ctx) => {
  try {
    // Отправляем сообщение с кнопкой "Open Mini App"
    await ctx.reply(
      'Привет! Нажми кнопку ниже, чтобы открыть мини-приложение:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Open Mini App',
                web_app: {
                  url: 'https://telegram-calendar-app-1.onrender.com' // ссылка на миниапп
                }
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    console.error('Error in /start:', err);
  }
});

// ------------------------
// Express Server for Mini App
// ------------------------
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Telegram Mini App</title>
      </head>
      <body>
        <h1>Добро пожаловать в ваш календарь!</h1>
        <p>Здесь будет интерфейс мини-приложения.</p>
      </body>
    </html>
  `);
});

// Пример эндпоинта для получения напоминаний
app.get('/reminders', (req, res) => {
  res.json({
    upcoming: [
      { id: 1, text: 'Встреча в 15:00', status: 'upcoming' }
    ],
    completed: [
      { id: 2, text: 'Звонок клиенту', status: 'completed' }
    ]
  });
});

// ------------------------
// Start Bot and Server
// ------------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Mini App running at https://telegram-calendar-app-1.onrender.com`);
});

// Используем webhook для Render
(async () => {
  try {
    await bot.telegram.setWebhook(`https://telegram-calendar-app-1.onrender.com/bot${BOT_TOKEN}`);
    app.use(bot.webhookCallback(`/bot${BOT_TOKEN}`));
    console.log('Bot webhook set successfully!');
  } catch (err) {
    console.error('Error setting webhook:', err);
  }
})();
