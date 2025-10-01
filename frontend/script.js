const form = document.getElementById("reminderForm");

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
});
