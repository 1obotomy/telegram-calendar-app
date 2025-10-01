import express from 'express';
import { Telegraf } from 'telegraf';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

// ---- Настройки ----
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = 'https://telegram-calendar-app-1.onrender.com';
const PORT = process.env.PORT || 10000;

const bot = new Telegraf(BOT_TOKEN);

// ---- Хранилище событий ----
let events = []; // { id, title, date, time, repeat: { weekly: true, days: [1,3,5] }, done: false }

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

// ---- Express сервер ----
const app = express();
app.use(bodyParser.json());

// Редирект с корня на миниапп
app.get('/', (req, res) => {
  res.redirect('/miniapp');
});

// Статическая отдача миниаппа
app.use('/miniapp', express.static('frontend'));

// Webhook endpoint для Telegram
app.post(`/webhook/${bot.secretPathComponent()}`, (req, res) => {
  bot.handleUpdate(req.body, res);
  res.sendStatus(200);
});

// ---- API для миниаппа ----

// Получение списка активных событий
app.get('/miniapp/events', (req, res) => {
  // только несостоявшиеся
  const active = events.filter(e => !e.done);
  res.json(active);
});

// Добавление нового события
app.post('/miniapp/events', (req, res) => {
  const { title, date, time, repeat } = req.body;
  if (!title || !date || !time) return res.status(400).json({ error: 'title, date и time обязательны' });

  const event = {
    id: uuidv4(),
    title,
    date,
    time,
    repeat: repeat || null,
    done: false,
  };

  events.push(event);
  res.json({ success: true, event });
});

// Удаление события
app.delete('/miniapp/events/:id', (req, res) => {
  const { id } = req.params;
  events = events.filter(e => e.id !== id);
  res.json({ success: true });
});

// ---- Автоочистка выполненных событий ----
setInterval(() => {
  const now = new Date();
  events.forEach(e => {
    const eventDate = new Date(`${e.date}T${e.time}`);
    if (!e.done && eventDate <= now && !e.repeat) {
      e.done = true;
    }
  });
}, 60 * 1000); // проверяем каждую минуту

// ---- Запуск сервера ----
app.listen(PORT, async () => {
  console.log(`Server started on port ${PORT}`);

  // Устанавливаем webhook
  try {
    await bot.telegram.setWebhook(`${WEBHOOK_URL}/webhook/${bot.secretPathComponent()}`);
    console.log('Webhook установлен!');
  } catch (err) {
    console.error('Ошибка установки webhook:', err);
  }
});
