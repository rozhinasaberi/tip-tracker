/********************************************
 * TipTracker Frontend – Full Final Version
 * Supports:
 * - Login
 * - Register
 * - Dashboard
 * - MyProfile
 * - Edit Profile
 * - Update Tip
 * - Full CRUD for Tips
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

  const isLoggedIn = !!jwtToken;
  const path = window.location.pathname.split("/").pop();

  const active = (page) => (path === page ? "nav-link active" : "nav-link");

  nav.innerHTML = `
    <div class="nav-container">
      <a href="./index.html" class="nav-logo">💸 TipTracker</a>
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
    document.getElementById("logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      window.location.href = "./login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);

/********************************************
 * AUTH HELPERS
 ********************************************/
function setToken(token, user) {
  jwtToken = token;
  currentUser = user;
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
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

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      setToken(data.token, data.user);
      window.location.href = "./index.html";
    } else {
      alert(data.message || "Registration failed");
    }
  });
}

// ---- LOGIN HANDLER ----
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    // Save JWT + user info
    localStorage.setItem("jwtToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect to dashboard/home page
    window.location.href = "index.html";
  });
}
// ---- AUTO LOAD USER ON HOME PAGE ----
const userDisplayName = document.getElementById("userNameDisplay");

async function loadDashboard() {
  const token = localStorage.getItem("jwtToken");
  if (!token) return; // not logged in

  const res = await fetch("http://localhost:4000/api/auth/me", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();
  if (!res.ok) {
    console.log("Not logged in");
    return;
  }

  // Display username on dashboard
  if (userDisplayName) userDisplayName.textContent = data.user.name;
}

loadDashboard();


/********************************************
 * DASHBOARD (Home Page)
 ********************************************/
async function loadDashboard() {
  const loggedInBox = document.getElementById("home-logged-in");
  const loggedOutBox = document.getElementById("home-logged-out");

  if (!loggedInBox || !loggedOutBox) return;

  if (!jwtToken) {
    loggedInBox.classList.add("hidden");
    loggedOutBox.classList.remove("hidden");
    return;
  }

  loggedInBox.classList.remove("hidden");
  loggedOutBox.classList.add("hidden");

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
  document.getElementById("stat-total-hours").textContent = `${totalHours} hrs`;
  document.getElementById("stat-total-entries").textContent = tips.length;
}

document.addEventListener("DOMContentLoaded", loadDashboard);

/********************************************
 * LOAD PROFILE INFO
 ********************************************/
if (window.location.pathname.includes("profile.html")) {
  if (!jwtToken) window.location.href = "./login.html";

  document.getElementById("profile-name").textContent = currentUser?.name;
  document.getElementById("profile-email").textContent = currentUser?.email;
  document.getElementById("profile-wage").textContent =
    currentUser?.hourlyWage || 0;

  document
    .getElementById("delete-account-btn")
    ?.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete your account?")) return;

      await fetch(`${API_BASE}/user/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      localStorage.clear();
      window.location.href = "./register.html";
    });
}

/********************************************
 * EDIT PROFILE PAGE
 ********************************************/
const editProfileForm = document.getElementById("edit-profile-form");

if (editProfileForm) {
  if (!jwtToken) window.location.href = "./login.html";

  // Prefill with current user data
  document.getElementById("edit-name").value = currentUser?.name || "";
  document.getElementById("edit-email").value = currentUser?.email || "";
  document.getElementById("edit-wage").value = currentUser?.hourlyWage || "";

  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("edit-name").value,
      email: document.getElementById("edit-email").value,
      hourlyWage: document.getElementById("edit-wage").value,
      password: document.getElementById("edit-password").value || null,
    };

    const res = await fetch(`${API_BASE}/user/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token, data.user);
      alert("Profile updated!");
      window.location.href = "./profile.html";
    } else {
      alert(data.message || "Update failed");
    }
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

    if (res.ok) {
      alert("Tip added!");
      refreshTips();
      createTipForm.reset();
    } else {
      alert("Error adding tip");
    }
  });
}

/********************************************
 * LOAD TIPS
 ********************************************/
const tipsList = document.getElementById("tips-list");

async function refreshTips() {
  if (!tipsList) return;

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const data = await res.json();
  tipsList.innerHTML = "";

  data.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "tip-item";

    div.innerHTML = `
      <div class="tip-main">
        <strong>${new Date(tip.date).toLocaleDateString()}</strong> — $${tip.tipsAmount}<br>
        <span class="tip-meta">Restaurant: ${tip.restaurantName}</span><br>
        <span class="tip-meta">Hours: ${tip.hoursWorked}</span><br>
        <span class="tip-meta">${tip.notes || ""}</span>
      </div>

      <div class="tip-actions">
        <button onclick="goEditTip('${tip._id}')" class="btn">Edit</button>
        <button onclick="deleteTip('${tip._id}')" class="btn-danger">Delete</button>
      </div>
    `;

    tipsList.appendChild(div);
  });
}

if (window.location.pathname.includes("tips.html")) {
  if (!jwtToken) window.location.href = "./login.html";
  refreshTips();
}

/********************************************
 * DELETE TIP
 ********************************************/
async function deleteTip(id) {
  if (!confirm("Delete this entry?")) return;

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  refreshTips();
}

/********************************************
 * GO TO EDIT TIP PAGE
 ********************************************/
function goEditTip(id) {
  window.location.href = `./edit-tip.html?id=${id}`;
}

/********************************************
 * EDIT TIP PAGE LOGIC
 ********************************************/
const editTipForm = document.getElementById("edit-tip-form");

if (editTipForm) {
  if (!jwtToken) window.location.href = "./login.html";

  // Get tip ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tipId = urlParams.get("id");

  async function loadTip() {
    const res = await fetch(`${API_BASE}/tips/${tipId}`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const tip = await res.json();

    document.getElementById("edit-tip-date").value = tip.date.slice(0, 10);
    document.getElementById("edit-tip-restaurant").value = tip.restaurantName;
    document.getElementById("edit-tip-hours").value = tip.hoursWorked;
    document.getElementById("edit-tip-amount").value = tip.tipsAmount;
    document.getElementById("edit-tip-notes").value = tip.notes || "";
  }

  loadTip();

  editTipForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      date: document.getElementById("edit-tip-date").value,
      restaurantName: document.getElementById("edit-tip-restaurant").value,
      hoursWorked: Number(document.getElementById("edit-tip-hours").value),
      tipsAmount: Number(document.getElementById("edit-tip-amount").value),
      notes: document.getElementById("edit-tip-notes").value,
    };

    await fetch(`${API_BASE}/tips/${tipId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    alert("Tip updated!");
    window.location.href = "./tips.html";
  });
}
