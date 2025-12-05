/********************************************
 * TIP FUNCTIONS — FINAL WORKING VERSION
 ********************************************/

const API_BASE = "http://localhost:4000/api";
let jwtToken = localStorage.getItem("jwtToken");

/*************** CREATE TIP ***************/
document.addEventListener("DOMContentLoaded", () => {
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
        const data = await res.json();
        alert(data.message || "Error creating tip");
      }
    });
  }
});


/*************** LOAD TIPS ***************/
async function refreshTips() {
  console.log("REFRESH TIPS FUNCTION FIRED");

  const tipsList = document.getElementById("tips-list");
  if (!tipsList) {
    console.log("⚠️ No #tips-list element found");
    return;
  }

  const res = await fetch(`${API_BASE}/tips`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  if (!res.ok) {
    console.log("⚠️ Failed to load tips:", res.status);
    return;
  }

  const data = await res.json();

  tipsList.innerHTML = ""; // Clear list

  if (data.length === 0) {
    tipsList.innerHTML = "<p>No tips recorded.</p>";
    return;
  }

  data.forEach((tip) => {
    const div = document.createElement("div");
    div.className = "tip-item";

    div.innerHTML = `
      <div class="tip-main">
        <strong>${new Date(tip.date).toLocaleDateString()}</strong> — $${tip.tipsAmount}<br>
        <span>Restaurant: ${tip.restaurantName}</span><br>
        <span>Hours: ${tip.hoursWorked}</span><br>
        <span>${tip.notes || ""}</span>
      </div>

      <div class="tip-actions">
        <button onclick="goEditTip('${tip._id}')" class="btn">Edit</button>
        <button onclick="deleteTip('${tip._id}')" class="btn-danger">Delete</button>
      </div>
    `;

    tipsList.appendChild(div);
  });
}


/*************** REFRESH BUTTON ***************/
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-tips-btn");

  if (refreshBtn) {
    console.log("Refresh button found. Adding listener.");
    refreshBtn.addEventListener("click", () => {
      console.log("Refresh button clicked");
      refreshTips();
    });
  } else {
    console.log("⚠️ Refresh button NOT found");
  }
});


/*************** DELETE TIP ***************/
async function deleteTip(id) {
  if (!confirm("Delete this entry?")) return;

  await fetch(`${API_BASE}/tips/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });

  refreshTips();
}


/*************** EDIT TIP PAGE ***************/
function goEditTip(id) {
  window.location.href = `./edit-tip.html?id=${id}`;
}
