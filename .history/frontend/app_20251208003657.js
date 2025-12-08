
const API_URL = "https://tip-tracker.onrender.com";


let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;


//nav bar

function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const isLoggedIn = !!jwtToken;
  const path = window.location.pathname.split("/").pop();

  const active = (page) => (path === page ? "nav-link active" : "nav-link");

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
    document.getElementById("logout-btn")?.addEventListener("click", () => {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      window.location.href = "./login.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", loadNavbar);


//auth helpers
function setToken(token, user) {
  jwtToken = token;
  currentUser = user;
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
}


//register section 
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


//login
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

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

    setToken(data.token, data.user);
    window.location.href = "./index.html";
  });
}


//creating tip

const createTipForm = document.getElementById("create-tip-form");

if (createTipForm) {
  createTipForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      date: document.getElementById("tip-date").value,
      restaurantName: document.getElementById("tip-restaurant").value,
      hoursWorked: Number(document.getElementById("tip-hoursWorked").value),
      tipsAmount: Number(document.getElementById("tip-amount").value),
      notes: document.getElementById("tip-notes").value,
    };

    await fetch(`${API_BASE}/tips`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    refreshTips();
    createTipForm.reset();
  });
}


//refresh page 

const refreshButton = document.getElementById("refresh-tips-btn");
if (refreshButton) {
  refreshButton.addEventListener("click", refreshTips);
}


// username 

async function loadUserName() {
  const userDisplayName = document.getElementById("userNameDisplay");
  if (!userDisplayName || !jwtToken) return;

  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  const data = await res.json();
  if (res.ok) userDisplayName.textContent = data.user.name;
}

document.addEventListener("DOMContentLoaded", loadUserName);


//home page 
async function loadHomeStats() {
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

document.addEventListener("DOMContentLoaded", loadHomeStats);



// profile edit 
const editProfileForm = document.getElementById("edit-profile-form");

if (editProfileForm) {
  if (!jwtToken) window.location.href = "./login.html";

  document.getElementById("edit-name").value = currentUser?.name;
  document.getElementById("edit-email").value = currentUser?.email;
  document.getElementById("edit-wage").value = currentUser?.hourlyWage;

  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      name: document.getElementById("edit-name").value,
      email: document.getElementById("edit-email").value,
      hourlyWage: document.getElementById("edit-wage").value,
      password: document.getElementById("edit-password").value, // optional
    };

    const res = await fetch(`${API_BASE}/auth/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Changes saved!");
      window.location.href = "./profile.html";
    } else {
      alert(data.message || "Update failed");
    }
  });
}


// CRUD 
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
        <span>Restaurant: ${tip.restaurantName}</span><br>
        <span>Hours: ${tip.hoursWorked}</span><br>
      </div>

      <div class="tip-actions">
        <button onclick="goEditTip('${tip._id}')" class="btn">Edit</button>
        <button onclick="deleteTip('${tip._id}')" class="btn-danger">Delete</button>
      </div>
    `;

    tipsList.appendChild(div);
  });
}

if (window.location.pathname.includes("tips.html")) refreshTips();


//delete tip 
async function deleteTip(id) {
  if (!confirm("Delete this entry?")) return;

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  refreshTips();
}


//edit tip
function goEditTip(id) {
  window.location.href = `./edit-tip.html?id=${id}`;
}

const editTipForm = document.getElementById("edit-tip-form");

if (editTipForm) {
  if (!jwtToken) window.location.href = "./login.html";

  const params = new URLSearchParams(window.location.search);
  const tipId = params.get("id");

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
//profile 
const currentPath = window.location.pathname.split("/").pop();

if (currentPath === "profile.html") {
  if (!jwtToken) window.location.href = "./login.html";

  document.getElementById("profile-name").textContent = currentUser?.name;
  document.getElementById("profile-email").textContent = currentUser?.email;
  document.getElementById("profile-wage").textContent =
    currentUser?.hourlyWage || 0;
}

// delete account 

const deleteBtn = document.getElementById("delete-account-btn");

if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    const res = await fetch(`${API_BASE}/auth/delete`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await res.json();

    if (res.ok) {
      alert("Account deleted successfully");
      localStorage.clear();
      window.location.href = "./register.html";
    } else {
      alert(data.message || "Failed to delete account");
    }
  });
}
