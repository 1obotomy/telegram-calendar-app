const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = 'YOUR_BOT_TOKEN'; // вставь свой токен
const WEB_APP_URL = 'https://telegram-calendar-app-1.onrender.com'; // URL твоего миниаппа

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// Хэндлер для webhook (если понадобится)
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Привет! Я календарь-бот.\nНажми кнопку ниже, чтобы открыть миниапп:", {
    reply_markup: {
      inline_keyboard: [[
        { text: "📅 Open App", web_app: { url: WEB_APP_URL } }
      ]]
    }
  });
});

// Пример простой команды для добавления напоминания
bot.onText(/\/add (.+)/, (msg, match) => {
  const reminder = match[1];
  // Здесь можно сохранять напоминания в память или базу
  bot.sendMessage(msg.chat.id, `Напоминание добавлено: ${reminder}`);
});

// Пример проверки напоминаний (можно расширять)
setInterval(() => {
  // Проверяем напоминания и отправляем, если пришло время
  // bot.sendMessage(chatId, "Напоминание!");
}, 60000); // каждые 60 секунд

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
