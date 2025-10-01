import express from 'express';
import { Telegraf } from 'telegraf';
import bodyParser from 'body-parser';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('Не найден BOT_TOKEN в переменных окружения!');
}

const PORT = process.env.PORT || 10000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://telegram-calendar-app-1.onrender.com'; // URL вашего сервиса

const bot = new Telegraf(BOT_TOKEN);

// Минихранилище событий
let events = [];

// /start - показываем приветствие и кнопку миниаппа
bot.start((ctx) => {
  ctx.reply('Добро пожаловать в ваш календарь! Используйте миниапп для управления событиями.');
});

// Обработка сообщений из миниаппа
bot.on('web_app_data', (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    if (data.action === 'save_event') {
      const newEvent = {
        id: Date.now(),
        title: data.title,
        date: data.date,
        time: data.time,
        repeat: data.repeat, // { type: 'weekly', days: [1,3,5] } или null
        done: false
      };
      events.push(newEvent);

      ctx.reply('✅ Событие сохранено!');
      // Отправляем список текущих событий
      const listText = events
        .filter(e => !e.done)
        .map(e => {
          let repeatText = '';
          if (e.repeat) {
            if (e.repeat.type === 'weekly') {
              repeatText = ` (повторяется по дням: ${e.repeat.days.join(', ')})`;
            }
          }
          return `• ${e.title} ${e.date} ${e.time}${repeatText}`;
        })
        .join('\n') || 'Нет запланированных событий';
      ctx.reply(listText);
    } else if (data.action === 'delete_event') {
      events = events.filter(e => e.id !== data.id);
      ctx.reply('❌ Событие удалено');
    }
  } catch (err) {
    console.error(err);
  }
});

// EXPRESS
const app = express();
app.use(bodyParser.json());

// Отвечаем на GET / чтобы не было Cannot GET /
app.get('/', (req, res) => {
  res.send('Telegram Web App Backend работает!');
});

// Telegram webhook
app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
  bot.handleUpdate(req.body, res)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

// Устанавливаем webhook для Telegram
(async () => {
  try {
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook/${BOT_TOKEN}`);
    console.log('Webhook установлен:', `${WEBHOOK_URL}/webhook/${BOT_TOKEN}`);
  } catch (err) {
    console.error('Ошибка установки webhook:', err);
  }
})();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
