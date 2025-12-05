/********************************************
 * TipTracker – CLEAN WORKING FRONTEND
 ********************************************/
console.log("APP.JS IS RUNNING");

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
 * AUTH HELPERS
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
    } else alert(data.message || "Registration failed");
  });
}

console.log("LOGIN BLOCK LOADED");

try {
  const loginForm = document.getElementById("login-form");
  console.log("loginForm =", loginForm);

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Login clicked!");

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      console.log("Sending login request...");

      try {
        const r = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        console.log("Received response:", r);
        const data = await r.json();
        console.log("Response data:", data);
      } catch (error) {
        console.error("Login fetch error:", error);
      }
    });
  }
} catch (error) {
  console.error("LOGIN BLOCK ERROR:", error);
}


/********************************************
 * DASHBOARD
 ********************************************/
async function loadDashboard() {
  const out = document.getElementById("home-logged-out");
  const inside = document.getElementById("home-logged-in");

  if (!out || !inside) return;

  if (!jwtToken) {
    out.classList.remove("hidden");
    inside.classList.add("hidden");
    return;
  }

  out.classList.add("hidden");
  inside.classList.remove("hidden");

  const r = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const tips = await r.json();

  let totalTips = 0;
  let totalHours = 0;

  tips.forEach((t) => {
    totalTips += t.tipsAmount;
    totalHours += t.hoursWorked;
  });

  document.getElementById("stat-total-tips").textContent = `$${totalTips}`;
  document.getElementById("stat-total-hours").textContent = `${totalHours} hrs`;
  document.getElementById("stat-total-entries").textContent = tips.length;
}
document.addEventListener("DOMContentLoaded", loadDashboard);

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
    if (!r.ok) return alert("Could not load profile");

    document.getElementById("profile-name").textContent = data.user.name;
    document.getElementById("profile-email").textContent = data.user.email;
    document.getElementById("profile-wage").textContent =
      data.user.hourlyWage ?? "N/A";
  }

  loadProfile();
}

/********************************************
 * EDIT PROFILE
 ********************************************/
if (window.location.pathname.includes("edit-profile.html")) {
  const token = localStorage.getItem("jwtToken");
  if (!token) window.location.href = "./login.html";

  const form = document.getElementById("edit-profile-form");

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

    const body = { hourlyWage: document.getElementById("edit-wage").value };

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
      alert("Failed to update");
    }
  });
}

/********************************************
 * TIPS
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

async function deleteTip(id) {
  const token = localStorage.getItem("jwtToken");

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  refreshTips();
}
