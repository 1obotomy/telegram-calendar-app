let reminders = [];

export function addReminder(text, dateTime, callback) {
  const reminder = { text, dateTime, status: "upcoming" };
  reminders.push(reminder);

  const targetTime = new Date(dateTime).getTime();
  const now = Date.now();
  const delay = targetTime - now;

  console.log(`Добавлено напоминание: ${text} на ${dateTime}, delay=${delay}`);

  if (delay > 0) {
    setTimeout(() => {
      reminder.status = "done";
      console.log(`Срабатывает напоминание: ${text}`);
      callback();
    }, delay);
  } else {
    reminder.status = "done";
  }
}

export function getReminders() {
  return reminders;
}
