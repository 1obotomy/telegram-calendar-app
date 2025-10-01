import express from 'express';
import bodyParser from 'body-parser';
import { Telegraf } from 'telegraf';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend'))); // статические файлы фронтенда

// Telegram Bot
const BOT_TOKEN = '8381157293:AAHsoo8VMQ9kEmPMCbGbwUO1P17jwmmFM6g';
const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Добро пожаловать! Ваш календарь готов.', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Open Calendar', web_app: { url: 'https://telegram-calendar-app-1.onrender.com' } }]
      ]
    }
  });
});

bot.launch();

// Получение данных из миниаппа
app.post('/save', (req, res) => {
  console.log('Данные из миниаппа:', req.body);
  res.send({ status: 'ok' });
});

// Отдаем фронтенд по корню
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
