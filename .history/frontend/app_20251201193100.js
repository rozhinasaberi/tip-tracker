/********************************************
 * TipTracker – FINAL WORKING FRONTEND
 ********************************************/

const API_BASE = "http://localhost:4000/api";

let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/********************************************
 * CLEAN ROUTE HANDLING (fixes /login?)
 ********************************************/
function getPage() {
  let p = window.location.pathname.split("/").pop();
  if (!p) p = "index.html";
  if (p.includes("?")) p = p.split("?")[0];
  return p;
}

/********************************************
 * NAVBAR
 ********************************************/
function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const page = getPage();
  const active = (x) => (page === x ? "nav-link active" : "nav-link");
  const loggedIn = !!jwtToken;

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
    } else alert(data.message || "Registration failed");
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
    } else alert(data.message || "Invalid credentials");
  });
}

/********************************************
 * DASHBOARD (HOME)
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

  const data = await r.json();

  let totalTips = 0;
  let totalHours = 0;

  data.forEach((t) => {
    totalTips += t.tipsAmount;
    totalHours += t.hoursWorked;
  });

  document.getElementById("stat-total-tips").textContent = `$${totalTips}`;
  document.getElementById("stat-total-hours").textContent = `${totalHours} hrs`;
  document.getElementById("stat-total-entries").textContent = data.length;
}
document.addEventListener("DOMContentLoaded", loadDashboard);

/********************************************
 * PROFILE PAGE
 ********************************************/
function isProfilePage() {
  return window.location.pathname.includes("profile");
}

if (isProfilePage()) {
  if (!jwtToken) window.location.href = "./login.html";

  async function loadProfile() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Profile load error:", data);
      return;
    }

    // FILL PROFILE
    document.getElementById("profile-name").textContent = data.user.name;
    document.getElementById("profile-email").textContent = data.user.email;
    document.getElementById("profile-wage").textContent =
      data.user.hourlyWage || "N/A";
  }

  loadProfile();
}

/********************************************
 * EDIT PROFILE PAGE – ONLY HOURLY WAGE
 ********************************************/
if (getPage() === "edit-profile.html") {
  if (!jwtToken) window.location.href = "./login.html";

  const form = document.getElementById("edit-profile-form");

  // Load current user info
  async function loadEditProfile() {
    const r = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await r.json();
    if (!r.ok) {
      alert(data.message || "Failed to load profile");
      return;
    }

    // Show name + email as text only
    document.getElementById("edit-name-text").textContent = data.user.name;
    document.getElementById("edit-email-text").textContent = data.user.email;

    // Only this is editable
    document.getElementById("edit-wage").value = data.user.hourlyWage || "";
  }

  loadEditProfile();

  // Submit only hourly wage
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      hourlyWage: document.getElementById("edit-wage").value,
    };

    const r = await fetch(`${API_BASE}/auth/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.message || "Update failed");
      return;
    }

    // Update local user (only wage matters here)
    const stored = JSON.parse(localStorage.getItem("user")) || {};
    stored.hourlyWage = data.user.hourlyWage;
    localStorage.setItem("user", JSON.stringify(stored));

    alert("Hourly wage updated!");
    window.location.href = "./profile.html";
  });
}


/********************************************
 * CREATE TIP
 ********************************************/
const createTipForm = document.getElementById("create-tip-form");

if (createTipForm) {
  if (!jwtToken) window.location.href = "./login.html";

  createTipForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      date: document.getElementById("tip-date").value,
      restaurantName: document.getElementById("tip-restaurant").value,
      hoursWorked: Number(document.getElementById("tip-hoursWorked").value),
      tipsAmount: Number(document.getElementById("tip-amount").value),
      notes: document.getElementById("tip-notes").value,
    };

    const r = await fetch(`${API_BASE}/tips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    if (r.ok) {
      alert("Tip added!");
      refreshTips();
      createTipForm.reset();
    } else alert("Failed to add tip");
  });
}

/********************************************
 * REFRESH TIPS 
 ********************************************/
async function refreshTips() {
  const list = document.getElementById("tips-list");
  if (!list) return;

  jwtToken = localStorage.getItem("jwtToken");
  if (!jwtToken) return (window.location.href = "./login.html");

  const r = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const tips = await r.json();

  list.innerHTML = "";

  if (tips.length === 0) {
    list.innerHTML = "<p>No tips yet — add one!</p>";
    return;
  }

  tips.forEach((t) => {
    list.innerHTML += `
      <div class="tip-item">
        <div><strong>${t.date.slice(0, 10)}</strong> — $${t.tipsAmount}</div>
        <div>${t.restaurantName}</div>
        <div>${t.hoursWorked} hrs</div>

        <button onclick="deleteTip('${t._id}')">Delete</button>
      </div>
    `;
  });
}

if (getPage() === "tips.html") {
  if (!jwtToken) window.location.href = "./login.html";
  refreshTips();
}

/********************************************
 * DELETE TIP
 ********************************************/
async function deleteTip(id) {
  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  refreshTips();
}
