const nowServingEl = document.getElementById("nowServing");
const nowServingNameEl = document.getElementById("nowServingName");
const queueListEl = document.getElementById("queueList");

const completeBtn = document.getElementById("completeBtn");
const nextBtn = document.getElementById("nextBtn");

let currentToken = null;
let completed = false;

// ------------------------------
// Fetch current token + queue
// ------------------------------
async function fetchManagerData() {
  try {
    // -------- Now Serving --------
    const statusRes = await fetch("/api/tokens/status");
    const current = await statusRes.json();

    if (current) {
      currentToken = current.tokenNumber;
      nowServingEl.textContent = current.tokenNumber;
      nowServingNameEl.textContent = current.customerName;

      completeBtn.disabled = false;
      nextBtn.disabled = !completed;
    } else {
      nowServingEl.textContent = "--";
      nowServingNameEl.textContent = "---";
      completeBtn.disabled = true;
      nextBtn.disabled = true;
      currentToken = null;
    }

    // -------- Queue List --------
    const queueRes = await fetch("/api/tokens/queue");
    const queue = await queueRes.json();

    queueListEl.innerHTML = "";

    if (queue.length === 0) {
      queueListEl.innerHTML = "<li>No tokens in queue</li>";
      return;
    }

    queue.forEach(token => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="queue-item">
          <span>
            <strong>#${token.tokenNumber}</strong> – ${token.customerName}
          </span>
          <span class="status">${token.status}</span>
          ${
            token.status === "WAITING"
              ? `<button onclick="cancelToken(${token.tokenNumber})">Cancel</button>`
              : ""
          }
        </div>
      `;

      queueListEl.appendChild(li);
    });

  } catch (err) {
    console.error("Manager fetch error:", err);
  }
}

// ------------------------------
// Mark token as completed
// ------------------------------
completeBtn.addEventListener("click", async () => {
  if (!currentToken) return;

  await fetch(`/api/tokens/complete/${currentToken}`, {
    method: "POST"
  });

  completed = true;
  completeBtn.disabled = true;
  nextBtn.disabled = false;

  // ✅ NEW: make Next button green
  nextBtn.classList.add("next-active");

  fetchManagerData();
});

// ------------------------------
// Come Next
// ------------------------------
nextBtn.addEventListener("click", async () => {
  await fetch("/api/tokens/next", {
    method: "POST"
  });

  completed = false;
  nextBtn.disabled = true;

  // ✅ Remove green after moving next
  nextBtn.classList.remove("next-active");

  fetchManagerData();
});

// ------------------------------
// Cancel token (Manager)
// ------------------------------
async function cancelToken(tokenNumber) {
  if (!confirm(`Cancel token #${tokenNumber}?`)) return;

  await fetch(`/api/tokens/manager-cancel/${tokenNumber}`, {
    method: "POST"
  });

  fetchManagerData();
}

// ------------------------------
// Auto refresh
// ------------------------------
setInterval(fetchManagerData, 3000);
fetchManagerData();
