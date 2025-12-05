const API_BASE = "http://localhost:4000/api";


let jwtToken = null;

function setToken(token) {
  jwtToken = token;
}

// Register 
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("register-name").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const hourlyWage = document.getElementById("register-hourlyWage").value;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, hourlyWage })
  });

  const data = await res.json();
  alert(res.ok ? "Registered!" : data.message || "Error");
});

// Login 
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    setToken(data.token);
    alert("Logged in!");
    document.getElementById("tips-section").style.display = "block";
  } else {
    alert(data.message || "Invalid credentials");
  }
});

// Logout
document.getElementById("logout-btn").addEventListener("click", () => {
  setToken(null);
  alert("Logged out!");
});

// Create Tip
document.getElementById("create-tip-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!jwtToken) return alert("Log in first!");

  const tip = {
    date: document.getElementById("tip-date").value,
    restaurantName: document.getElementById("tip-restaurant").value,
    hoursWorked: Number(document.getElementById("tip-hoursWorked").value),
    tipsAmount: Number(document.getElementById("tip-amount").value),
    notes: document.getElementById("tip-notes").value
  };

  const res = await fetch(`${API_BASE}/tips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`
    },
    body: JSON.stringify(tip)
  });

  const data = await res.json();
  alert(res.ok ? "Tip added!" : data.message);
});

// Refresh Tips
document.getElementById("refresh-tips-btn").addEventListener("click", async () => {
  if (!jwtToken) return alert("Log in first!");

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` }
  });

  const data = await res.json();

  const container = document.getElementById("tips-list");
  container.innerHTML = "";

  data.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "tip-card";
    div.innerHTML = `
      <strong>${tip.date}</strong> – $${tip.tipsAmount}<br>
      Shift: ${tip.shiftType} — Hours: ${tip.hoursWorked}<br>
      Notes: ${tip.notes || "None"}<br>
      <button onclick="deleteTip('${tip._id}')">Delete</button>
    `;
    container.appendChild(div);
  });
});

//Delete Tip
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
