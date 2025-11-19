// Simple frontend for TipTracker backend
// Adjust this if your backend runs on a different URL/port
const API_BASE = 'http://localhost:4000';

let authToken = null;

// ---------- Helpers ----------
function log(message, data) {
  const debugLog = document.getElementById('debug-log');
  const time = new Date().toLocaleTimeString();
  const line = data
    ? `[${time}] ${message} -> ${JSON.stringify(data, null, 2)}`
    : `[${time}] ${message}`;
  debugLog.textContent = line + '\n' + debugLog.textContent;
}

function setAuthState(token, user) {
  authToken = token;
  const statusSpan = document.getElementById('auth-status');
  const tokenBox = document.getElementById('token-display');
  const tipsSection = document.getElementById('tips-section');

  if (token) {
    statusSpan.textContent = `Logged in as ${user?.name || user?.email}`;
    tokenBox.value = token;
    tipsSection.classList.remove('hidden');
  } else {
    statusSpan.textContent = 'Not logged in';
    tokenBox.value = '';
    tipsSection.classList.add('hidden');
  }
}

// ---------- Auth Requests ----------
async function registerUser(e) {
  e.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const hourlyWage = document.getElementById('register-hourlyWage').value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        hourlyWage: hourlyWage ? Number(hourlyWage) : undefined,
      }),
    });

    const data = await res.json();
    log('Register response', data);

    if (!res.ok) {
      alert('Registration failed: ' + (data.message || 'Unknown error'));
      return;
    }

    alert('Registration successful! You can now log in.');
  } catch (err) {
    log('Register error', err);
    alert('Network error during registration');
  }
}

async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    log('Login response', data);

    if (!res.ok) {
      alert('Login failed: ' + (data.message || 'Unknown error'));
      return;
    }

    setAuthState(data.token, data.user);
    await fetchTips(); // load tips immediately after login
  } catch (err) {
    log('Login error', err);
    alert('Network error during login');
  }
}

function logoutUser() {
  setAuthState(null, null);
}

// ---------- Tips CRUD ----------
async function createTip(e) {
  e.preventDefault();
  if (!authToken) {
    return alert('You must be logged in to create tips.');
  }

  const date = document.getElementById('tip-date').value;
  const shiftType = document.getElementById('tip-shiftType').value;
  const hoursWorked = Number(document.getElementById('tip-hoursWorked').value);
  const tipsAmount = Number(document.getElementById('tip-amount').value);
  const notes = document.getElementById('tip-notes').value;

  try {
    const res = await fetch(`${API_BASE}/api/tips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        date,
        shiftType,
        hoursWorked,
        tipsAmount,
        notes,
      }),
    });

    const data = await res.json();
    log('Create tip response', data);

    if (!res.ok) {
      alert('Create tip failed: ' + (data.message || 'Unknown error'));
      return;
    }

    (e.target).reset();
    await fetchTips();
  } catch (err) {
    log('Create tip error', err);
    alert('Network error when creating tip');
  }
}

async function fetchTips() {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/tips`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    log('Fetch tips response', data);

    if (!res.ok) {
      alert('Fetch tips failed: ' + (data.message || 'Unknown error'));
      return;
    }

    renderTips(data);
  } catch (err) {
    log('Fetch tips error', err);
    alert('Network error when fetching tips');
  }
}

function renderTips(tips) {
  const container = document.getElementById('tips-list');
  container.innerHTML = '';

  if (!tips || tips.length === 0) {
    container.textContent = 'No tip entries yet.';
    return;
  }

  tips.forEach((tip) => {
    const div = document.createElement('div');
    div.className = 'tip-item';

    const main = document.createElement('div');
    main.className = 'tip-main';
    main.innerHTML = `
      <strong>${new Date(tip.date).toLocaleDateString()} — ${tip.shiftType}</strong><br/>
      $${tip.tipsAmount} for ${tip.hoursWorked}h
      <div class="tip-meta">
        Notes: ${tip.notes || '—'}<br/>
        Hourly: $${(tip.tipsAmount / (tip.hoursWorked || 1)).toFixed(2)}
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'tip-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Quick +10$';
    editBtn.onclick = () => updateTipQuick(tip);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete';
    deleteBtn.onclick = () => deleteTip(tip._id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(main);
    div.appendChild(actions);
    container.appendChild(div);
  });
}

async function updateTipQuick(tip) {
  if (!authToken) return;

  try {
    const res = await fetch(`${API_BASE}/api/tips/${tip._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        tipsAmount: tip.tipsAmount + 10,
        hoursWorked: tip.hoursWorked,
        notes: tip.notes,
        date: tip.date,
        shiftType: tip.shiftType,
      }),
    });

    const data = await res.json();
    log('Update tip response', data);

    if (!res.ok) {
      alert('Update tip failed: ' + (data.message || 'Unknown error'));
      return;
    }

    await fetchTips();
  } catch (err) {
    log('Update tip error', err);
    alert('Network error when updating tip');
  }
}

async function deleteTip(id) {
  if (!authToken) return;
  if (!confirm('Delete this tip entry?')) return;

  try {
    const res = await fetch(`${API_BASE}/api/tips/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    log('Delete tip response', data);

    if (!res.ok) {
      alert('Delete tip failed: ' + (data.message || 'Unknown error'));
      return;
    }

    await fetchTips();
  } catch (err) {
    log('Delete tip error', err);
    alert('Network error when deleting tip');
  }
}

// ---------- Event wiring ----------
document.getElementById('register-form').addEventListener('submit', registerUser);
document.getElementById('login-form').addEventListener('submit', loginUser);
document.getElementById('logout-btn').addEventListener('click', logoutUser);
document.getElementById('create-tip-form').addEventListener('submit', createTip);
document.getElementById('refresh-tips-btn').addEventListener('click', fetchTips);

// Initial log
log('Frontend loaded. Make sure your backend is running on ' + API_BASE);
