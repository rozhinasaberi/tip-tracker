// =========================
// GLOBAL CONFIG
// =========================
const API = "http://localhost:4001"; // backend root
const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

// =========================
// LOAD NAVBAR FOR ALL PAGES
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  if (navbar) loadNavbar();
  routePage();
});

function loadNavbar() {
  const loggedIn = !!token;

  document.getElementById("navbar").innerHTML = `
    <a href="./index.html" class="logo">💸 TipTracker</a>

    <div class="nav-links">
      <a href="./index.html">Home</a>
      <a href="./tips.html">My Tips</a>
      <a href="./profile.html">My Profile</a>

      ${
        loggedIn
          ? `<span>Hi, user</span> <button id="logout-btn" class="logout-btn">Logout</button>`
          : `<a href="./login.html">Login</a>`
      }
    </div>
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "./login.html";
    });
  }
}

// =========================
// PAGE ROUTING LOGIC
// =========================
function routePage() {
  const page = window.location.pathname;

  if (page.includes("index.html")) return loadHome();
  if (page.includes("login.html")) return initLogin();
  if (page.includes("register.html")) return initRegister();
  if (page.includes("profile.html")) return loadProfile();
  if (page.includes("edit-profile.html")) return initEditProfile();
  if (page.includes("tips.html")) return loadTips();
  if (page.includes("edit-tip.html")) return initEditTip();
}

// =========================
// HOME PAGE
// =========================
function loadHome() {
  const loggedOut = document.getElementById("home-logged-out");
  const loggedIn = document.getElementById("home-logged-in");

  if (!token) {
    loggedOut.classList.remove("hidden");
    return;
  }

  loggedIn.classList.remove("hidden");

  // Load dashboard stats
  fetch(`${API}/tips/user/${userId}`)
    .then((res) => res.json())
    .then((data) => {
      const totalEarned = data.reduce((sum, t) => sum + t.amountEarned, 0);
      const totalHours = data.reduce((sum, t) => sum + t.hoursWorked, 0);

      document.getElementById("stat-total-tips").innerText = `$${totalEarned}`;
      document.getElementById("stat-total-hours").innerText = `${totalHours} hrs`;
      document.getElementById("stat-total-entries").innerText = data.length;
    });
}

// =========================
// LOGIN PAGE
// =========================
function initLogin() {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    const res = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!data.token) {
      alert("Invalid login");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.user._id);

    window.location.href = "./index.html";
  });
}

// =========================
// REGISTER PAGE
// =========================
function initRegister() {
  const form = document.getElementById("register-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = {
      name: form.name.value,
      email: form.email.value,
      password: form.password.value,
      hourlyWage: form.hourlyWage.value,
    };

    const res = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (res.ok) {
      window.location.href = "./login.html";
    } else {
      alert("Error registering user");
    }
  });
}

// =========================
// PROFILE PAGE
// =========================
function loadProfile() {
  fetch(`${API}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((user) => {
      document.getElementById("profile-name").innerText = user.name;
      document.getElementById("profile-email").innerText = user.email;
      document.getElementById("profile-wage").innerText = user.hourlyWage;
    });
}

// =========================
// EDIT PROFILE PAGE
// =========================
function initEditProfile() {
  const form = document.getElementById("edit-profile-form");

  fetch(`${API}/users/${userId}`)
    .then((res) => res.json())
    .then((user) => {
      document.getElementById("edit-name").value = user.name;
      document.getElementById("edit-email").value = user.email;
      document.getElementById("edit-wage").value = user.hourlyWage;
    });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updated = {
      name: form["edit-name"].value,
      email: form["edit-email"].value,
      hourlyWage: form["edit-wage"].value,
      password: form["edit-password"].value,
    };

    await fetch(`${API}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    window.location.href = "./profile.html";
  });
}

// =========================
// TIPS PAGE
// =========================
function loadTips() {
  const list = document.getElementById("tips-list");
  const refreshBtn = document.getElementById("refresh-tips");

  async function load() {
    const res = await fetch(`${API}/tips/user/${userId}`);
    const data = await res.json();

    list.innerHTML = "";

    data.forEach((t) => {
      const item = document.createElement("div");
      item.classList.add("tip-card");

      item.innerHTML = `
        <h3>${t.date}</h3>
        <p>Hours Worked: ${t.hoursWorked}</p>
        <p>Tip Amount: $${t.tipAmount}</p>
        <p>Earned: $${t.amountEarned}</p>
        <a class="btn" href="./edit-tip.html?id=${t._id}">Edit</a>
      `;

      list.appendChild(item);
    });
  }

  load();
  refreshBtn.addEventListener("click", load);
}

// =========================
// EDIT TIP PAGE
// =========================
function initEditTip() {
  const params = new URLSearchParams(window.location.search);
  const tipId = params.get("id");
  const form = document.getElementById("edit-tip-form");

  fetch(`${API}/tips/${tipId}`)
    .then((res) => res.json())
    .then((t) => {
      document.getElementById("edit-date").value = t.date;
      document.getElementById("edit-hours").value = t.hoursWorked;
      document.getElementById("edit-tip").value = t.tipAmount;
    });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updated = {
      date: form["edit-date"].value,
      hoursWorked: form["edit-hours"].value,
      tipAmount: form["edit-tip"].value,
    };

    await fetch(`${API}/tips/${tipId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    window.location.href = "./tips.html";
  });
}
