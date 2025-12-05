/********************************************
 * FINAL WORKING TIPTRACKER FRONTEND
 ********************************************/

console.log("APP.JS LOADED");

// Change this to your backend port
const API_BASE = "http://127.0.0.1:5000/api";

let jwtToken = localStorage.getItem("jwtToken") || null;
let currentUser = JSON.parse(localStorage.getItem("user")) || null;

/********************************************
 * NAVBAR
 ********************************************/
function loadNavbar() {
  const nav = document.getElementById("navbar");
  if (!nav) return;

  const loggedIn = !!jwtToken;

  nav.innerHTML = `
    <div class="nav-container">
      <a href="./index.html" class="nav-logo">💸 TipTracker</a>

      <div class="nav-links">
        ${
          loggedIn
            ? `
              <a href="./index.html">Dashboard</a>
              <a href="./tips.html">My Tips</a>
              <a href="./profile.html">Profile</a>
              <a id="logout-btn">Logout</a>
            `
            : `
              <a href="./login.html">Login</a>
              <a href="./register.html">Register</a>
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
 * SAVE AUTH INFO
 ********************************************/
function saveAuth(token, user) {
  localStorage.setItem("jwtToken", token);
  localStorage.setItem("user", JSON.stringify(user));
  jwtToken = token;
  currentUser = user;
}

/********************************************
 * REGISTER (FULL WORKING VERSION)
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");

  if (registerForm) {
    console.log("REGISTER FORM FOUND");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("REGISTER BUTTON CLICKED");

      const body = {
        name: document.getElementById("register-name").value,
        email: document.getElementById("register-email").value,
        password: document.getElementById("register-password").value,
        hourlyWage: document.getElementById("register-hourlyWage").value,
      };

      console.log("Sending body:", body);

      try {
        const r = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        console.log("Response:", r);

        const data = await r.json();
        console.log("JSON:", data);

        if (!r.ok) {
          alert(data.message || "Registration failed");
          return;
        }

        saveAuth(data.token, data.user);
        window.location.href = "./index.html";

      } catch (err) {
        console.error("REGISTER ERROR:", err);
        alert("Could not reach backend");
      }
    });
  }
});

/********************************************
 * LOGIN (WORKING)
 ********************************************/
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        const r = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await r.json();

        if (!r.ok) {
          alert(data.message || "Invalid credentials");
          return;
        }

        saveAuth(data.token, data.user);
        window.location.href = "./index.html";

      } catch (err) {
        alert("Could not reach backend");
      }
    });
  }
});
