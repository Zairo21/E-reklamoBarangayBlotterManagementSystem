document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");

  function toggle(showLoginForm) {
    loginForm.classList.toggle("active", showLoginForm);
    signupForm.classList.toggle("active", !showLoginForm);
  }

  showSignup.addEventListener("click", e => { e.preventDefault(); toggle(false); });
  showLogin.addEventListener("click", e => { e.preventDefault(); toggle(true); });

  signupBtn.addEventListener("click", () => {
    const user = document.getElementById("suUser").value;
    const pass = document.getElementById("suPass").value;
    localStorage.setItem("user_"+user, pass);
    alert("Account created! Please log in.");
    toggle(true);
  });

  loginBtn.addEventListener("click", () => {
    const user = document.getElementById("loginUser").value;
    const pass = document.getElementById("loginPass").value;
    const saved = localStorage.getItem("user_"+user);
    if (saved && saved === pass) {
      localStorage.setItem("current_user", user);
      window.location.href = "user_dashboard.html";
    } else {
      alert("Invalid login.");
    }
  });

  toggle(true);
});
