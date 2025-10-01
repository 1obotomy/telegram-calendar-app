let reminders = [];

export function addReminder(text, dateTime, callback) {
  const reminder = { text, dateTime, status: "upcoming" };
  reminders.push(reminder);

  const targetTime = new Date(dateTime).getTime();
  const now = Date.now();
  const delay = targetTime - now;

  if (delay > 0) {
    setTimeout(() => {
      reminder.status = "done";
      callback();
    }, delay);
  } else {
    reminder.status = "done"; // если время уже прошло
  }
}

export function getReminders() {
  return reminders;
}
