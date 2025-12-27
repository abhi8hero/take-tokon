const API_BASE = "http://localhost:5000/api/tokens";

function initCustomer() {
  const createBtn = document.getElementById("createTokenBtn");
  const nameInput = document.getElementById("customerName");
  const statusElem = document.getElementById("currentToken");

  // Create token
  createBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) return alert("Enter your name");

    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name }),
    });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  });

  // Auto-refresh current token
  setInterval(async () => {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    if (data) {
      statusElem.textContent = `Token ${data.tokenNumber} - ${data.customerName || 'N/A'} - ${data.status}`;
    } else {
      statusElem.textContent = "No tokens in queue";
    }
  }, 3000);
}

function initManager() {
  const completeBtn = document.getElementById("completeNextBtn");
  const statusElem = document.getElementById("currentToken");

  async function refreshStatus() {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    statusElem.textContent = data
      ? JSON.stringify(data, null, 2)
      : "No tokens in queue";
  }

  completeBtn.addEventListener("click", async () => {
    const res = await fetch(`${API_BASE}/next`, { method: "POST" });
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
    refreshStatus();
  });

  // Auto-refresh every 3 seconds
  setInterval(refreshStatus, 3000);
  refreshStatus();
}
