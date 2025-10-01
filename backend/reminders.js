export function scheduleReminder(dateTime, callback) {
  const targetTime = new Date(dateTime).getTime();
  const now = Date.now();
  const delay = targetTime - now;

  if (delay > 0) {
    setTimeout(callback, delay);
  }
}
