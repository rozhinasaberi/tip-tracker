/************************************
 * TipTracker Frontend – Final Version
 * Works with your backend exactly as uploaded
 ************************************/

const API_BASE = "http://localhost:5000/api"; 
let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/************************************
 * NAVBAR (Professional Version)
 ************************************/

function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const isLoggedIn = !!jwtToken;
  const currentPage = window.location.pathname.split("/").pop();

  const active = (page) =>
    currentPage === page ? "nav-link active" : "nav-link";

  nav.innerHTML = `
    <div class="nav-container">
      <a href="./index.html" class="nav-logo">💸 TipTracker</a>

      <div class="nav-links">
        <a href="./index.html" class="${active("index.html")}">Home</a>

        ${
          isLoggedIn
            ? `
          <a href="./tips.html" class="${active("tips.html")}">My Tips</a>
          <span class="nav-user">Hi, ${currentUser?.name || "User"}</span>
          <a href="#" id="logout-btn" class="nav-link">Logout</a>
        `
            : `
          <a href="./login.html" class="${active("login.html")}">Login</a>
          <a href="./register.html" class="${active("register.html")}">Register</a>
        `
        }
      </div>
    </div>
  `;

  if (isLoggedIn) {
    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      jwtToken = null;
      currentUser = null;
      window.location.href = "./login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);

/************************************
 * AUTH HELPERS
 ************************************/
function setToken(token, user) {
  jwtToken = token;
  currentUser = user;
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/************************************
 * REGISTER USER
 ************************************/
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const hourlyWage = document.getElementById("register-hourlyWage").value;

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, hourlyWage }),
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token, data.user);
      alert("Account created!");
      window.location.href = "./tips.html";
    } else {
      alert(data.message || "Registration failed");
    }
  });
}

/************************************
 * LOGIN
 ************************************/
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", res.status, data);
    if (res.ok) {
      setToken(data.token, data.user);
      alert("Logged in!");
      window.location.href = "./tips.html";
    } else {
      alert(data.message || "Login failed");
    }
  });
}

/************************************
 * PROTECT TIPS PAGE
 ************************************/
if (window.location.pathname.includes("tips.html")) {
  if (!jwtToken) {
    window.location.href = "./login.html";
  }
}

/************************************
 * CREATE TIP ENTRY
 ************************************/
const createTipForm = document.getElementById("create-tip-form");

if (createTipForm) {
  createTipForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tip = {
      date: document.getElementById("tip-date").value,
      restaurantName: document.getElementById("tip-restaurant").value,
      hoursWorked: Number(document.getElementById("tip-hoursWorked").value),
      tipsAmount: Number(document.getElementById("tip-amount").value),
      notes: document.getElementById("tip-notes").value,
    };

    const res = await fetch(`${API_BASE}/tips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(tip),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Tip added!");
      refreshTips();
      createTipForm.reset();
    } else {
      alert(data.message || "Error creating tip");
    }
  });
}

/************************************
 * LOAD TIPS
 ************************************/
const tipsList = document.getElementById("tips-list");

async function refreshTips() {
  if (!tipsList) return;

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const data = await res.json();

  tipsList.innerHTML = "";

  data.forEach((tip) => {
    const card = document.createElement("div");
    card.className = "tip-item";

    card.innerHTML = `
      <div class="tip-main">
        <strong>${new Date(tip.date).toLocaleDateString()}</strong> — $${tip.tipsAmount}<br>
        <span class="tip-meta">Restaurant: ${tip.restaurantName}</span><br>
        <span class="tip-meta">Hours: ${tip.hoursWorked}</span><br>
        <span class="tip-meta">${tip.notes || ""}</span>
      </div>

      <div class="tip-actions">
        <button class="delete" onclick="deleteTip('${tip._id}')">Delete</button>
      </div>
    `;

    tipsList.appendChild(card);
  });
}

const refreshBtn = document.getElementById("refresh-tips-btn");
if (refreshBtn) refreshBtn.addEventListener("click", refreshTips);

/************************************
 * DELETE TIP
 ************************************/
async function deleteTip(id) {
  const ok = confirm("Delete this entry?");
  if (!ok) return;

  const res = await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  if (res.ok) {
    refreshTips();
  } else {
    alert("Failed to delete tip");
  }
}

if (window.location.pathname.includes("tips.html")) {
  refreshTips();
}
