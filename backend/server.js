console.log("app.js LOADED ✅");

// ✅ IMPORTANT: must include /api
const API_BASE = "https://tip-tracker.onrender.com/api";

let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/* ======================
   NAVBAR
====================== */
function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const isLoggedIn = !!jwtToken;
  const path = window.location.pathname.split("/").pop();

  const active = (page) =>
    path === page ? "nav-link active" : "nav-link";

  nav.innerHTML = `
    <div class="nav-container">
      <div class="nav-links">
        <a href="./index.html" class="${active("index.html")}">Home</a>

        ${
          isLoggedIn
            ? `
          <a href="./tips.html" class="${active("tips.html")}">My Tips</a>
          <a href="./profile.html" class="${active("profile.html")}">My Profile</a>
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
    document
      .getElementById("logout-btn")
      ?.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "./login.html";
      });
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);

/* ======================
   AUTH HELPERS
====================== */
function setSession(token, user) {
  jwtToken = token;
  currentUser = user;
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/* ======================
   REGISTER
====================== */
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("register-name").value.trim(),
      email: document.getElementById("register-email").value.trim(),
      password: document.getElementById("register-password").value.trim(),
      hourlyWage: document.getElementById("register-hourlyWage").value || 0,
    };

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      setSession(data.token, data.user);
      window.location.href = "./index.html";
    } catch (err) {
      alert("Server error. Try again.");
    }
  });
}

/* ======================
   LOGIN
====================== */
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document
      .getElementById("login-password")
      .value.trim();

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      setSession(data.token, data.user);
      window.location.href = "./index.html";
    } catch {
      alert("Server error. Try again.");
    }
  });
}

/* ======================
   HOME DASHBOARD
====================== */
async function loadHomeStats() {
  const loggedInBox = document.getElementById("home-logged-in");
  const loggedOutBox = document.getElementById("home-logged-out");

  if (!loggedInBox || !loggedOutBox) return;

  if (!jwtToken) {
    loggedInBox.classList.add("hidden");
    loggedOutBox.classList.remove("hidden");
    return;
  }

  loggedOutBox.classList.add("hidden");
  loggedInBox.classList.remove("hidden");

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const tips = await res.json();

  let totalTips = 0;
  let totalHours = 0;

  tips.forEach((t) => {
    totalTips += t.tipsAmount;
    totalHours += t.hoursWorked;
  });

  document.getElementById("stat-total-tips").textContent = `$${totalTips}`;
  document.getElementById(
    "stat-total-hours"
  ).textContent = `${totalHours} hrs`;
  document.getElementById(
    "stat-total-entries"
  ).textContent = tips.length;
}

document.addEventListener("DOMContentLoaded", loadHomeStats);

/* ======================
   TIPS LIST
====================== */
const tipsList = document.getElementById("tips-list");

async function refreshTips() {
  if (!tipsList) return;

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const tips = await res.json();
  tipsList.innerHTML = "";

  tips.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "tip-item";

    div.innerHTML = `
      <strong>${new Date(tip.date).toLocaleDateString()}</strong> — $${tip.tipsAmount}
      <br>
      ${tip.restaurantName} | ${tip.hoursWorked} hrs
      <div class="tip-actions">
        <button onclick="goEditTip('${tip._id}')">Edit</button>
        <button onclick="deleteTip('${tip._id}')">Delete</button>
      </div>
    `;

    tipsList.appendChild(div);
  });
}

if (window.location.pathname.includes("tips.html")) {
  refreshTips();
}

/* ======================
   DELETE TIP
====================== */
async function deleteTip(id) {
  if (!confirm("Delete this tip?")) return;

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  refreshTips();
}

function goEditTip(id) {
  window.location.href = `./edit-tip.html?id=${id}`;
}

/* ======================
   PROFILE
====================== */
if (window.location.pathname.includes("profile.html")) {
  if (!jwtToken) window.location.href = "./login.html";

  document.getElementById("profile-name").textContent =
    currentUser?.name;
  document.getElementById("profile-email").textContent =
    currentUser?.email;
  document.getElementById("profile-wage").textContent =
    currentUser?.hourlyWage || 0;
}
