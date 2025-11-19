// frontend/app.js

const API_BASE = "http://localhost:4000/api";

// ---- Session State ----
let jwtToken = null;

function showTipsSection(show) {
  const tipsSection = document.getElementById("tips-section");
  tipsSection.style.display = show ? "block" : "none";
}

function setToken(token) {
  jwtToken = token;
  if (token) {
    console.log("Logged in, token:", token);
    showTipsSection(true);
  } else {
    console.log("Logged out");
    showTipsSection(false);
  }
}

// ---- Register ----
document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const hourlyWage =
      document.getElementById("register-hourlyWage").value || null;

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, hourlyWage }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Registered successfully! You can now log in.");
      } else {
        alert(data.message || "Registration error");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during registration");
    }
  });

// ---- Login ----
document
  .getElementById("login-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        alert("Logged in!");
        // Load existing tips after login
        await refreshTips();
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during login");
    }
  });

// ---- Logout ----
document.getElementById("logout-btn").addEventListener("click", () => {
  setToken(null);
  alert("Logged out!");
});

// ---- Create Tip ----
document
  .getElementById("create-tip-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!jwtToken) return alert("Please log in first!");

    const body = {
      date: document.getElementById("tip-date").value,
      shiftType: document.getElementById("tip-shiftType").value,
      hoursWorked: Number(document.getElementById("tip-hoursWorked").value),
      tipsAmount: Number(document.getElementById("tip-amount").value),
      notes: document.getElementById("tip-notes").value,
    };

    try {
      const response = await fetch(`${API_BASE}/tips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Tip added!");
        e.target.reset();
        await refreshTips();
      } else {
        alert(data.message || "Error creating tip");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while creating tip");
    }
  });

// ---- Fetch Tips ----
document
  .getElementById("refresh-tips-btn")
  .addEventListener("click", async () => {
    await refreshTips();
  });

async function refreshTips() {
  if (!jwtToken) return alert("Login first!");

  try {
    const res = await fetch(`${API_BASE}/tips`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Error loading tips");
      return;
    }

    const box = document.getElementById("tips-list");
    box.innerHTML = "";

    if (!data.length) {
      box.textContent = "No tip entries yet.";
      return;
    }

    data.forEach((tip) => {
      const div = document.createElement("div");
      div.className = "tip-card";
      const dateStr = new Date(tip.date).toLocaleDateString();

      div.innerHTML = `
        <strong>${dateStr}</strong> – $${tip.tipsAmount} <br>
        Shift: ${tip.shiftType}, Hours: ${tip.hoursWorked} <br>
        Notes: ${tip.notes || "—"} <br>
        <button class="delete-btn" data-id="${tip._id}">Delete</button>
      `;

      box.appendChild(div);
    });

    // Wire delete buttons
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteTip(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    alert("Network error while loading tips");
  }
}

// ---- Delete Tip ----
async function deleteTip(id) {
  if (!jwtToken) return alert("Login first!");

  if (!confirm("Delete this tip entry?")) return;

  try {
    const res = await fetch(`${API_BASE}/tips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (res.ok) {
      alert("Deleted!");
      await refreshTips();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network error while deleting tip");
  }
}

// Hide tips section on first load
showTipsSection(false);
