/********************************************
 * TipTracker Frontend – Final Stable Version
 ********************************************/

const API_BASE = "http://localhost:4000/api";

let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/********************************************
 * CLEAN ROUTE HANDLING (/login? → login.html)
 ********************************************/
function getPage() {
  let p = window.location.pathname.split("/").pop();
  if (!p || p === "") p = "index.html";
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
          <
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
      name: registerForm["name"].value || document.getElementById("register-name").value,
      email: registerForm["email"]?.value || document.getElementById("register-email").value,
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
    } else alert(data.message || "Error");
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
    } else alert(data.message || "Invalid Credentials");
  });
}

/********************************************
 * DASHBOARD (HOME)
 ********************************************/
async function loadDashboard() {
  const loggedOut = document.getElementById("home-logged-out");
  const loggedIn = document.getElementById("home-logged-in");

  if (!loggedOut || !loggedIn) return;

  if (!jwtToken) {
    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
    return;
  }

  loggedOut.classList.add("hidden");
  loggedIn.classList.remove("hidden");

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

  // Load current user info into the form
  async function loadEditProfile() {
    const r = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await r.json();

    if (!r.ok) {
      alert(data.message || "Failed to load profile");
      return;
    }

    // Show non-editable name + email
    document.getElementById("profile-name").textContent = data.user.name;
    document.getElementById("profile-email").textContent = data.user.email;
    // Editable hourly wage
    document.getElementById("edit-wage").value = data.user.hourlyWage || "";
  }

  loadEditProfile();

  // Save only hourly wage
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      hourlyWage: Number(document.getElementById("edit-wage").value),
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

    // Update localStorage user too
    localStorage.setItem("user", JSON.stringify(data.user));

    //  Your confirmation message here:
    alert("Changes saved");

    // Go back to profile so you can see it updated
    window.location.href = "./profile.html";
  });
}


/********************************************
 * DELETE ACCOUNT
 ********************************************/
const deleteBtn = document.getElementById("delete-account-btn");

if (deleteBtn) {
  deleteBtn.onclick = async () => {
    if (!confirm("Delete your account?")) return;

    const r = await fetch(`${API_BASE}/auth/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (r.ok) {
      localStorage.clear();
      window.location.href = "./register.html";
    } else alert("Error deleting account");
  };
}

/********************************************
 * TIPS
 ********************************************/
async function refreshTips() {
  const list = document.getElementById("tips-list");
  if (!list) return;

  const r = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const tips = await r.json();
  list.innerHTML = "";

  tips.forEach((t) => {
    list.innerHTML += `
      <div class="tip-item">
        <div><strong>${t.date.slice(0, 10)}</strong> – $${t.tipsAmount}</div>
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

async function deleteTip(id) {
  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  refreshTips();
}
