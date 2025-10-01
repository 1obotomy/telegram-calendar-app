import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = '8381157293:AAHsoo8VMQ9kEmPMCbGbwUO1P17jwmmFM6g';
const WEBAPP_URL = process.env.WEBAPP_URL || `https://your-render-url.com`; // заменить на URL фронта

app.use(bodyParser.json());
app.use(express.static('public')); // если фронт лежит в public

// Хранилище событий в памяти
let events = [];

// Вспомогательные функции
function checkExpiredEvents() {
  const now = new Date();
  events = events.filter(ev => {
    if (!ev.repeat) {
      const evDateTime = new Date(`${ev.date}T${ev.time}`);
      return evDateTime >= now;
    }
    return true; // повторяемые события не удаляем автоматически
  });
}

function sendWebAppMessage(chat_id, message) {
  return fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id,
      text: message
    })
  });
}

// Webhook для Telegram
app.post(`/webhook/${BOT_TOKEN}`, (req, res) => {
  const update = req.body;

  if (update.message && update.message.text === '/start') {
    const chat_id = update.message.chat.id;
    sendWebAppMessage(chat_id, `Добро пожаловать! Открывайте миниапп для работы с событиями: ${WEBAPP_URL}`);
  }

  res.sendStatus(200);
});

// API для фронтенда
app.post('/api/saveEvent', (req, res) => {
  const { title, date, time, repeat, days } = req.body;
  if (!title || !date || !time) return res.status(400).json({ error: 'Не все поля заполнены' });

  events.push({ title, date, time, repeat, days });
  checkExpiredEvents();
  res.json({ success: true, events });
});

app.get('/api/events', (req, res) => {
  checkExpiredEvents();
  res.json(events);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
