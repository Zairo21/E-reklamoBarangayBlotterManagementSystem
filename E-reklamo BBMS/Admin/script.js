// ===== Handle Create Admin (Signup) =====
document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (password.length < 8) {
    alert("Password must be at least 8 characters long.");
    return;
  }

  // Save account to localStorage
  localStorage.setItem("admin_username", username);
  localStorage.setItem("admin_password", password);

  alert("Admin account created successfully! Please log in.");

  // Reset form fields
  document.getElementById("signupForm").reset();

  // Switch back to login form
  document.getElementById("signupForm").classList.remove("active");
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("title").innerText = "Admin Login";
});

// ===== Handle Admin Login =====
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  // Get stored credentials
  const storedUsername = localStorage.getItem("admin_username");
  const storedPassword = localStorage.getItem("admin_password");

  if (!storedUsername || !storedPassword) {
    alert("No admin account found. Please create one first.");
    return;
  }

  if (username === storedUsername && password === storedPassword) {
    alert("Login successful!");
    localStorage.setItem("bbms_session_user", username); // mark session
    window.location.href = "dashboard.html"; // redirect to admin dashboard
  } else {
    alert("Invalid username or password. Try again.");
  }
});

// ===== Show Signup Form =====
document.getElementById("showCreate").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("signupForm").classList.add("active");
  document.getElementById("signupForm").reset(); // clear old inputs
  document.getElementById("title").innerText = "Create Admin";
});

// ===== Show Login Form =====
document.getElementById("showLogin").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signupForm").classList.remove("active");
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("title").innerText = "Admin Login";
});


