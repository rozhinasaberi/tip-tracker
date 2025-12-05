/********************************************
 * TipTracker – FINAL FIXED FRONTEND
 ********************************************/

const API_BASE = "http://localhost:4000/api";

let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/********************************************
 * NAVBAR
 ********************************************/
function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const loggedIn = !!jwtToken;
  const page = window.location.pathname.split("/").pop();
  const active = (p) => (p === page ? "nav-link active" : "nav-link");

  nav.innerHTML = `
    <div class="nav-container">
      <a href="./index.html" class="nav-logo">💸 TipTracker</a>

      <div class="nav-links">
        <a href="./index.html" class="${active("index.html")}">Home</a>

        ${
          loggedIn
            ? `
            <a href="./tips.html" class="${active("tips.html")}">My Tips</a>
            <a href="./profile.html" class="${active("profile.html")}">My Profile</a>
            <a id="logout-btn" class="nav-link">Logout</a>
          `
            : `
            <a href="./login.html" class="${active("login.html")}">Login</a>
            <a href="./register.html" class="${active("register.html")}">Register</a>
          `
        }
      </div>
    </div>
  `;

  if (loggedIn) {
    document.getElementById("logout-btn").onclick = () => {
      localStorage.clear();
      window.location.href = "./login.html";
    };
  }
}
document.addEventListener("DOMContentLoaded", loadNavbar);

/********************************************
 * SAVE AUTH
 ********************************************/
function saveAuth(token, user) {
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
  jwtToken = token;
  currentUser = user;
}

/********************************************
 * REGISTER
 ********************************************/
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("register-name").value,
      email: document.getElementById("register-email").value,
      password: document.getElementById("register-password").value,
      hourlyWage: document.getElementById("register-hourlyWage").value,
    };

    const r = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (r.ok) {
      saveAuth(data.token, data.user);
      window.location.href = "./index.html";
    } else {
      alert(data.message || "Registration failed");
    }
  });
}

/********************************************
 * LOGIN
 ********************************************/
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      email: document.getElementById("login-email").value,
      password: document.getElementById("login-password").value,
    };

    const r = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (r.ok) {
      saveAuth(data.token, data.user);
      window.location.href = "./index.html";
    } else {
      alert(data.message || "Login failed");
    }
  });
}

/********************************************
 * PROFILE PAGE
 ********************************************/
if (window.location.pathname.includes("profile.html")) {
  const token = localStorage.getItem("jwtToken");
  if (!token) window.location.href = "./login.html";

  async function loadProfile() {
    const r = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();

    if (!r.ok) {
      alert("Failed to load profile");
      return;
    }

    document.getElementById("profile-name").textContent = data.user.name;
    document.getElementById("profile-email").textContent = data.user.email;
    document.getElementById("profile-wage").textContent =
      data.user.hourlyWage ?? "N/A";
  }

  loadProfile();
}

/********************************************
 * EDIT PROFILE – only hourlyWage
 ********************************************/
if (window.location.pathname.includes("edit-profile.html")) {
  const form = document.getElementById("edit-profile-form");
  const token = localStorage.getItem("jwtToken");

  if (!token) window.location.href = "./login.html";

  async function loadEdit() {
    const r = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await r.json();

    document.getElementById("edit-name-text").textContent = data.user.name;
    document.getElementById("edit-email-text").textContent = data.user.email;
    document.getElementById("edit-wage").value = data.user.hourlyWage ?? "";
  }

  loadEdit();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      hourlyWage: document.getElementById("edit-wage").value,
    };

    const r = await fetch(`${API_BASE}/auth/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (r.ok) {
      alert("Changes saved!");
      window.location.href = "./profile.html";
    } else {
      alert(data.message || "Failed to update profile");
    }
  });
}

/********************************************
 * REFRESH TIPS
 ********************************************/
async function refreshTips() {
  const list = document.getElementById("tips-list");
  if (!list) return;

  const token = localStorage.getItem("jwtToken");
  if (!token) return;

  const r = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const tips = await r.json();

  list.innerHTML = "";
  tips.forEach((t) => {
    list.innerHTML += `
      <div class="tip-item">
        <strong>${t.date.slice(0, 10)}</strong> — $${t.tipsAmount}
        <p>${t.restaurantName}</p>
        <p>${t.hoursWorked} hrs</p>
        <button onclick="deleteTip('${t._id}')">Delete</button>
      </div>
    `;
  });
}

if (window.location.pathname.includes("tips.html")) {
  refreshTips();
}

/********************************************
 * DELETE TIP
 ********************************************/
async function deleteTip(id) {
  const token = localStorage.getItem("jwtToken");

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  refreshTips();
}
