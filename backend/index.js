import express from "express";
import bodyParser from "body-parser";
import TelegramBot from "node-telegram-bot-api";
import { scheduleReminder } from "./reminders.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

// токен и ID будут храниться в Render → Environment Variables
const TOKEN = process.env.TOKEN;
const GROUP_ID = process.env.GROUP_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

// API для приёма напоминаний
app.post("/reminder", (req, res) => {
  const { text, dateTime } = req.body;

  if (!text || !dateTime) {
    return res.status(400).json({ error: "Текст и дата обязательны" });
  }

  scheduleReminder(dateTime, () => {
    bot.sendMessage(GROUP_ID, `🔔 Напоминание: ${text}`);
  });

  res.json({ status: "ok", message: "Напоминание установлено" });
});

// раздаём фронтенд
app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
