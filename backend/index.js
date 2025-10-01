import express from 'express';
import { Telegraf } from 'telegraf';

// ---- Настройки ----
const BOT_TOKEN = '8381157293:AAHsoo8VMQ9kEmPMCbGbwUO1P17jwmmFM6g';
const WEBHOOK_URL = 'https://telegram-calendar-app-1.onrender.com'; // ваш домен
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);

// ---- Миниапп и кнопка ----
bot.start((ctx) => {
  ctx.reply('Добро пожаловать в ваш календарь!', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть миниапп',
            web_app: { url: `${WEBHOOK_URL}/miniapp` },
          },
        ],
      ],
    },
  });
});

// ---- Пример обработки сообщений (можно расширять для событий) ----
bot.on('text', (ctx) => {
  ctx.reply('Ваше сообщение получено: ' + ctx.message.text);
});

// ---- Express сервер ----
const app = express();
app.use(express.json());

// Webhook endpoint для Telegram
app.post(`/webhook/${bot.secretPathComponent()}`, (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

// Статическая отдача миниаппа
app.use('/miniapp', express.static('frontend')); // frontend - папка с HTML/JS миниаппа

// Запуск сервера
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  // Устанавливаем webhook в Telegram
  try {
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook/${bot.secretPathComponent()}`);
    console.log('Webhook установлен!');
  } catch (err) {
    console.error('Ошибка установки webhook:', err);
  }
});
