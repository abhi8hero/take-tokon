function managerLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorEl = document.getElementById("loginError");

  errorEl.innerText = "";

  if (!username || !password) {
    errorEl.innerText = "Please enter username and password";
    return;
  }

  if (username === "admin" && password === "admin123") {
    window.location.href = "/manager.html";
  } else {
    errorEl.innerText = "Invalid manager credentials";
  }
}

function togglePassword() {
  const input = document.getElementById("password");
  input.type = input.type === "password" ? "text" : "password";
}

function goCustomer() {
  window.location.href = "/customer.html";
}
