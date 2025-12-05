/************************************
 * TipTracker Frontend – Simplified / Stable Version
 ************************************/

const API_BASE = "http://localhost:4000/api";

let jwtToken = null;
let currentUser = null;

/************************************
 * Helpers
 ************************************/
function loadFromStorage() {
  try {
    jwtToken = localStorage.getItem("jwtToken") || null;
    const userRaw = localStorage.getItem("user");
    currentUser = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    console.error("Error reading user from storage:", e);
    jwtToken = null;
    currentUser = null;
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
  }
}

function saveToStorage(token, user) {
  jwtToken = token;
  currentUser = user;
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
}

/************************************
 * Nav + Page wiring happens AFTER DOM ready
 ************************************/
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, wiring TipTracker…");
  loadFromStorage();
  setupNavbar();
  wireAuthForms();
  protectTipsPage();
  wireTipsPage();
});

/************************************
 * NAVBAR
 ************************************/
function setupNavbar() {
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
            <span class="nav-user">Hi, ${currentUser?.name || "User"}</span>

        <a href="./index.html" class="${active("index.html")}">Home</a>
        ${
          isLoggedIn
            ? `
          <a href="./tips.html" class="${active("tips.html")}">My Tips</a>
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
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        jwtToken = null;
        currentUser = null;
        window.location.href = "./login.html";
      });
    }
  }
}

/************************************
 * AUTH FORMS (login + register)
 ************************************/
function wireAuthForms() {
  const registerForm = document.getElementById("register-form");
  const loginForm = document.getElementById("login-form");

  if (registerForm) {
    console.log("Register form found, wiring submit handler");
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Register submit clicked");

      const name = document.getElementById("register-name").value;
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const hourlyWage =
        document.getElementById("register-hourlyWage").value || null;

      try {
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, hourlyWage }),
        });

        const data = await res.json();
        console.log("Register response:", res.status, data);

        if (res.ok) {
          saveToStorage(data.token, data.user);
          alert("Account created!");
          window.location.href = "./tips.html";
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (err) {
        console.error("Register error:", err);
        alert("Network error while registering.");
      }
    });
  } else {
    console.log("No register form on this page.");
  }

  if (loginForm) {
    console.log("Login form found, wiring submit handler");
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Login submit clicked");

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("Login response:", res.status, data);

        if (res.ok) {
          saveToStorage(data.token, data.user);
          alert("Logged in!");
          window.location.href = "./tips.html";
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Network error while logging in.");
      }
    });
  } else {
    console.log("No login form on this page.");
  }
}

/************************************
 * PROTECT TIPS PAGE
 ************************************/
function protectTipsPage() {
  const isTipsPage = window.location.pathname.includes("tips.html");
  if (isTipsPage && !jwtToken) {
    console.log("No token, redirecting to login from tips page.");
    window.location.href = "./login.html";
  }
}

/************************************
 * TIPS PAGE (CRUD)
 ************************************/
function wireTipsPage() {
  const createTipForm = document.getElementById("create-tip-form");
  const tipsList = document.getElementById("tips-list");
  const refreshBtn = document.getElementById("refresh-tips-btn");

  // Not on tips page
  if (!createTipForm && !tipsList) {
    return;
  }

  if (createTipForm) {
    console.log("Tips form found, wiring create handler");
    createTipForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const tip = {
        date: document.getElementById("tip-date").value,
        restaurantName: document.getElementById("tip-restaurant").value,
        hoursWorked: Number(
          document.getElementById("tip-hoursWorked").value || 0
        ),
        tipsAmount: Number(document.getElementById("tip-amount").value || 0),
        notes: document.getElementById("tip-notes").value,
      };

      try {
        const res = await fetch(`${API_BASE}/tips`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(tip),
        });

        const data = await res.json();
        console.log("Create tip response:", res.status, data);

        if (res.ok) {
          alert("Tip added!");
          createTipForm.reset();
          refreshTips();
        } else {
          alert(data.message || "Error creating tip");
        }
      } catch (err) {
        console.error("Create tip error:", err);
        alert("Network error while creating tip.");
      }
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", refreshTips);
  }

  // Auto-load tips on page load
  refreshTips();
}

async function refreshTips() {
  const tipsList = document.getElementById("tips-list");
  if (!tipsList) return;

  try {
    const res = await fetch(`${API_BASE}/tips`, {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await res.json();
    console.log("Fetched tips:", data);

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
          <button class="delete" data-id="${tip._id}">Delete</button>
        </div>
      `;

      tipsList.appendChild(card);
    });

    // Wire delete buttons
    tipsList.querySelectorAll("button.delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        deleteTip(id);
      });
    });
  } catch (err) {
    console.error("Error loading tips:", err);
    alert("Failed to load tips.");
  }
}

async function deleteTip(id) {
  const ok = confirm("Delete this entry?");
  if (!ok) return;

  try {
    const res = await fetch(`${API_BASE}/tips/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    if (res.ok) {
      refreshTips();
    } else {
      alert("Failed to delete tip");
    }
  } catch (err) {
    console.error("Delete tip error:", err);
    alert("Network error while deleting tip.");
  }
}
