// index.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const showCreate = document.getElementById('showCreate');
  const showLogin = document.getElementById('showLogin');
  const createBtn = document.getElementById('createBtn');
  const loginBtn = document.getElementById('loginBtn');

  showCreate.addEventListener('click', (e) => { e.preventDefault(); toggle(false) });
  showLogin.addEventListener('click', (e) => { e.preventDefault(); toggle(true) });

  createBtn.addEventListener('click', () => {
    const u = document.getElementById('suUser').value.trim();
    const p = document.getElementById('suPass').value;
    if (!u || !p) return alert('Please complete all fields.');
    // Save admin (demo only). In production hash passwords.
    localStorage.setItem('bbms_admin_user', u);
    localStorage.setItem('bbms_admin_pass', p);
    alert('Admin account created. Please login.');
    toggle(true);
  });

  loginBtn.addEventListener('click', () => {
    const u = document.getElementById('loginUser').value.trim();
    const p = document.getElementById('loginPass').value;
    const su = localStorage.getItem('bbms_admin_user');
    const sp = localStorage.getItem('bbms_admin_pass');
    if (!su) return alert('No admin account found. Create one first.');
    if (u === su && p === sp) {
      // Mark session
      localStorage.setItem('bbms_session_user', u);
      window.location.href = 'dashboard.html';
    } else {
      alert('Invalid credentials.');
    }
  });

  function toggle(showLoginForm){
    document.getElementById('title').innerText = showLoginForm ? 'Admin Login' : 'Create Admin';
    loginForm.classList.toggle('active', showLoginForm);
    signupForm.classList.toggle('active', !showLoginForm);
  }

  // Start with login visible
  toggle(true);
});
