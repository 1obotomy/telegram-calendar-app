import express from "express";
import bodyParser from "body-parser";
import TelegramBot from "node-telegram-bot-api";
import { addReminder, getReminders } from "./reminders.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.TOKEN;
const GROUP_ID = process.env.GROUP_ID;

const bot = new TelegramBot(TOKEN, { polling: true });

// создание напоминания
app.post("/reminder", (req, res) => {
  const { text, dateTime } = req.body;

  if (!text || !dateTime) {
    return res.status(400).json({ error: "Текст и дата обязательны" });
  }

  addReminder(text, dateTime, () => {
    bot.sendMessage(GROUP_ID, `🔔 Напоминание: ${text}`);
  });

  res.json({ status: "ok", message: "Напоминание установлено" });
});

// список напоминаний
app.get("/reminders", (req, res) => {
  res.json(getReminders());
});

// фронтенд
app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
