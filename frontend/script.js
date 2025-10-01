const form = document.getElementById("reminderForm");
const remindersList = document.getElementById("remindersList");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = document.getElementById("text").value;
  const dateTime = document.getElementById("dateTime").value;

  const response = await fetch("/reminder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, dateTime })
  });

  const result = await response.json();
  alert(result.message);

  loadReminders();
});

async function loadReminders() {
  const res = await fetch("/reminders");
  const reminders = await res.json();

  remindersList.innerHTML = "";
  reminders.forEach(r => {
    const li = document.createElement("li");
    li.textContent = `${r.text} — ${new Date(r.dateTime).toLocaleString()} [${r.status === "upcoming" ? "Предстоящее" : "Состоялось"}]`;
    remindersList.appendChild(li);
  });
}

// при загрузке страницы сразу подгружаем список
loadReminders();
