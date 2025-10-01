import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import cron from "node-cron";
import TelegramBot from "node-telegram-bot-api";
import fs from "fs";

const botToken = "ТВОЙ_TELEGRAM_BOT_TOKEN";
const chatId = "ID_ЧАТА_ПОЛЬЗОВАТЕЛЯ"; // Можно получать из front, если нужна поддержка мультипользователей
const bot = new TelegramBot(botToken);

const app = express();
app.use(cors());
app.use(express.json());

const EVENTS_FILE = "./events.json";
function loadEvents() {
  if(!fs.existsSync(EVENTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(EVENTS_FILE));
}
function saveEvents(events) {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events,null,2));
}

// API
app.get("/api/events", (_,res)=>{
  res.json(loadEvents().filter(ev=>!ev.done));
});

app.post("/api/events", (req,res)=>{
  const events = loadEvents();
  const event = { id: uuidv4(), ...req.body, done: false };
  events.push(event);
  saveEvents(events);
  res.json(event);
});

app.delete("/api/events/:id", (req,res)=>{
  let events = loadEvents();
  events = events.filter(ev=>ev.id!==req.params.id);
  saveEvents(events);
  res.sendStatus(200);
});

// Фоновая задача: проверять события каждую минуту и отправлять уведомления за 30 мин
cron.schedule('* * * * *', () => {
  const events = loadEvents();
  const now = dayjs();
  for(const ev of events) {
    // Разовые
    if(ev.type==="once" && !ev.done) {
      const eventTime = dayjs(ev.date);
      if(eventTime.diff(now,"minute")===30) {
        bot.sendMessage(chatId, `Напоминание: ${ev.title} через 30 минут!`);
        ev.done = true;
      }
    }
    // Повторяющиеся
    if(ev.type==="repeat") {
      const weekday = now.day(); // 0-Вс, ... 1-Пн
      if(ev.repeatDays.includes(weekday) && now.hour()===dayjs(ev.date).hour() && now.minute()===dayjs(ev.date).minute()) {
        bot.sendMessage(chatId, `Напоминание: ${ev.title} через 30 минут!`);
      }
    }
  }
  saveEvents(events);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log("Backend running on "+PORT));
