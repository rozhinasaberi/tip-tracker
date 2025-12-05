// app.js
console.log("app.js loaded ✅");

const API_BASE = "http://localhost:4000/api";

// ===========================
// AUTH STATE
// ===========================
let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = null;

try {
  currentUser = JSON.parse(localStorage.getItem("user")) || null;
} catch (e) {
  currentUser = null;
}

// ===========================
// NAVBAR RENDER
// ===========================
function renderNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  if (currentUser && jwtToken) {
    nav.innerHTML = `
      <div class="nav-inner">
        <span>TipTracker</span>
        <span>Hi, ${currentUser.name || "User"}</span>
        <button id="logout-btn">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        jwtToken = null;
        currentUser = null;
        alert("You have been logged out.");
        window.location.href = "login.html";
      });
    }
  } else {
    nav.innerHTML = `
      <div class="nav-inner">
        <span>TipTracker</span>
        <a href="login.html">Login</a>
        <a href="register.html">Register</a>
      </div>
    `;
  }
}

renderNavbar();

// ===========================
// LOGIN FORM HANDLER
// ===========================
const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Login submitted");

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${API_BASE}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (!res.ok) {
        alert(data.message || "Invalid credentials");
        return;
      }

      // Save auth
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      jwtToken = data.token;
      currentUser = data.user;

      alert("Login successful!");
      window.location.href = "index.html"; // or wherever your dashboard is
    } catch (err) {
      console.error(err);
      alert("Something went wrong during login.");
    }
  });
}

// ===========================
// REGISTER FORM HANDLER
// ===========================
const registerForm = document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Register submitted");

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const hourlyWageValue = document.getElementById("register-hourlyWage").value;

    // Optional field: only send if filled
    const body = { name, email, password };
    if (hourlyWageValue) {
      body.hourlyWage = Number(hourlyWageValue);
    }

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("Register response:", data);

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Account created! Please log in.");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Something went wrong during registration.");
    }
  });
}
