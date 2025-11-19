// frontend/app.js

const API_BASE = "http://localhost:4000/api";

// ---- Session State ----
let jwtToken = null;

function setToken(token) {
  jwtToken = token;
  document.getElementById("session-status").textContent = token ? "Logged in" : "Not logged in";
  document.getElementById("session-token").textContent = token || "";
}

// ---- Register ----
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const hourly = document.getElementById("reg-hourly").value || null;

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, hourlyWage: hourly })
  });

  const data = await response.json();
  alert(response.ok ? "Registered successfully!" : data.message || "Error");
});

// ---- Login ----
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.ok) {
    setToken(data.token);
    alert("Logged in!");
    document.getElementById("tips-section").style.display = "block";
  } else {
    alert(data.message || "Login failed");
  }
});

// ---- Logout ----
document.getElementById("logout-btn").addEventListener("click", () => {
  setToken(null);
  alert("Logged out!");
});

// ---- Create Tip ----
document.getElementById("create-tip-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!jwtToken) return alert("Please log in first!");

  const body = {
    date: document.getElementById("tip-date").value,
    shiftType: document.getElementById("tip-shift").value,
    hoursWorked: Number(document.getElementById("tip-hours").value),
    tipsAmount: Number(document.getElementById("tip-amount").value),
    notes: document.getElementById("tip-notes").value
  };

  const response = await fetch(`${API_BASE}/tips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  alert(response.ok ? "Tip added!" : data.message);
});

// ---- Fetch Tips ----
document.getElementById("refresh-tips-btn").addEventListener("click", async () => {
  if (!jwtToken) return alert("Login first!");

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` }
  });

  const data = await res.json();

  const box = document.getElementById("tips-list");
  box.innerHTML = "";

  data.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "tip-card";
    div.innerHTML = `
      <strong>${tip.date}</strong> – $${tip.tipsAmount} <br>
      Shift: ${tip.shiftType}, Hours: ${tip.hoursWorked} <br>
      Notes: ${tip.notes || "—"} <br>
      <button onclick="deleteTip('${tip._id}')">Delete</button>
    `;
    box.appendChild(div);
  });
});

// ---- Delete Tip ----
async function deleteTip(id) {
  if (!jwtToken) return alert("Login first!");

  const res = await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` }
  });

  if (res.ok) {
    alert("Deleted!");
    document.getElementById("refresh-tips-btn").click();
  } else {
    alert("Delete failed");
  }
}
