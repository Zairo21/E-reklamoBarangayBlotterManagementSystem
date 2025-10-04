document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('initial-hide');

  const id = (s) => document.getElementById(s);
  const signupForm = id('signupForm');
  const loginForm = id('loginForm');
  const showCreate = id('showCreate');
  const showLogin = id('showLogin');
  const titleEl = id('title');

  function showForm(which) {
    if (loginForm) loginForm.classList.toggle('active', which === 'login');
    if (signupForm) signupForm.classList.toggle('active', which === 'signup');
    if (titleEl) titleEl.innerText = which === 'signup' ? 'Create Admin' : 'Admin Login';
  }

  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameEl = id('signupUsername');
      const passwordEl = id('signupPassword');
      const passwordConfirmEl = id('signupPasswordConfirm');
      const username = usernameEl ? usernameEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';
      const passConf = passwordConfirmEl ? passwordConfirmEl.value : '';

      if (password !== passConf) { alert('Passwords do not match.'); return; }
      if (!username) { alert('Please enter a username'); return; }
      if (password.length < 8) { alert('Password must be at least 8 characters long.'); return; }

      try {
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_password', password);
      } catch (err) {
        alert('Failed to save account: ' + (err && err.message ? err.message : err));
        return;
      }

      alert('Admin account created. Please log in.');
      signupForm.reset();
      showForm('login');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameEl = id('loginUsername');
      const passwordEl = id('loginPassword');
      const username = usernameEl ? usernameEl.value.trim() : '';
      const password = passwordEl ? passwordEl.value : '';

      const storedUsername = localStorage.getItem('admin_username');
      const storedPassword = localStorage.getItem('admin_password');

      if (!storedUsername || !storedPassword) {
        alert('No admin account found. Please create one first.');
        showForm('signup');
        return;
      }

      if (username === storedUsername && password === storedPassword) {
        try { localStorage.setItem('bbms_session_user', username); } catch (err) {}
        document.body.classList.add('fade-out');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 450);
      } else {
        alert('Invalid username or password. Try again.');
      }
    });
  }

  document.querySelectorAll('.pwd-toggle').forEach(btn => {
    btn.addEventListener('click', (ev) => {
      const targetId = btn.getAttribute('data-target');
     const inp = document.getElementById(targetId);
      if (!inp) return;
      const isPwd = inp.type === 'password';
     inp.type = isPwd ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(isPwd));
      btn.textContent = isPwd ? '🔒' : '🔓';
    });
  });


  if (showCreate) showCreate.addEventListener('click', (e) => { e.preventDefault(); showForm('signup'); });
  if (showLogin) showLogin.addEventListener('click', (e) => { e.preventDefault(); showForm('login'); });
});
