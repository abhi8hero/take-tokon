const AVG_TIME = 5; // avg 5 min per token

// Elements
const currentTokenEl = document.getElementById("currentToken");
const yourTokenEl = document.getElementById("yourToken");
const aheadEl = document.getElementById("ahead");
const waitTimeEl = document.getElementById("waitTime");
const takeBtn = document.getElementById("takeBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Load token from localStorage
let myToken = localStorage.getItem("yourTokenNumber");

if (myToken) {
  yourTokenEl.textContent = myToken;
  cancelBtn.disabled = false;
}

// -----------------------------
// Fetch live token status
// -----------------------------
async function fetchStatus() {
  try {
    // Now serving
    const currentRes = await fetch("/api/tokens/status");
    const current = await currentRes.json();

    currentTokenEl.textContent = current ? current.tokenNumber : "--";

    // If user has a token
    if (myToken) {
      const myRes = await fetch(`/api/tokens/status/${myToken}`);
      const myData = await myRes.json();

      if (!myData) {
        resetCustomerState();
        return;
      }

      // Completed
      if (myData.status === "COMPLETED") {
        yourTokenEl.textContent = "Completed";
        aheadEl.textContent = 0;
        waitTimeEl.textContent = "Served!";
        resetCustomerState(true);
        return;
      }

      // Cancelled by manager
      if (myData.status === "CANCELLED" && myData.cancelledBy === "manager") {
        yourTokenEl.textContent = "Cancelled by Manager";
        aheadEl.textContent = "--";
        waitTimeEl.textContent = "--";
        resetCustomerState(true);
        return;
      }

      // Cancelled by customer
      if (myData.status === "CANCELLED" && myData.cancelledBy === "customer") {
        yourTokenEl.textContent = "Cancelled";
        aheadEl.textContent = "--";
        waitTimeEl.textContent = "--";
        resetCustomerState(true);
        return;
      }

      // WAITING
      const currentNumber = current ? current.tokenNumber : 0;
      const ahead = myData.tokenNumber - currentNumber;

      yourTokenEl.textContent = myData.tokenNumber;
      aheadEl.textContent = Math.max(ahead, 0);
      waitTimeEl.textContent =
        ahead > 0 ? `${ahead * AVG_TIME} min` : "Your turn!";
    }
  } catch (err) {
    console.error(err);
  }
}

// -----------------------------
// Take token
// -----------------------------
takeBtn.addEventListener("click", async () => {
  if (myToken) {
    alert("You already have a token");
    return;
  }

  const name = prompt("Enter your name");
  if (!name) return;

  const nameRegex = /^[A-Za-z ]+$/;

  if (!nameRegex.test(name.trim())) {
    alert("Please enter a valid name (letters only, no numbers)");
    return;
  }

  try {
    const res = await fetch("/api/tokens/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName: name })
    });

    const data = await res.json();

    myToken = data.tokenNumber;
    localStorage.setItem("yourTokenNumber", myToken);

    yourTokenEl.textContent = myToken;
    cancelBtn.disabled = false;

    alert(`Your token number is ${myToken}`);
  } catch (err) {
    console.error(err);
  }
});

// -----------------------------
// Cancel token (REAL cancel)
// -----------------------------
cancelBtn.addEventListener("click", async () => {
  if (!myToken) return;

  if (!confirm("Are you sure you want to cancel your token?")) return;

  try {
    const res = await fetch(`/api/tokens/cancel/${myToken}`, {
      method: "POST"
    });

    const data = await res.json();
    alert(data.message);

    resetCustomerState();
  } catch (err) {
    console.error(err);
    alert("Failed to cancel token");
  }
});

// -----------------------------
// Reset customer state
// -----------------------------
function resetCustomerState(keepMessage = false) {
  localStorage.removeItem("yourTokenNumber");
  myToken = null;

  if (!keepMessage) {
    yourTokenEl.textContent = "Not Booked";
    aheadEl.textContent = "--";
    waitTimeEl.textContent = "--";
  }

  cancelBtn.disabled = true;
}

// -----------------------------
// Auto refresh
// -----------------------------
setInterval(fetchStatus, 3000);
fetchStatus();
