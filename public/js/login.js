const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = 'form-msg';
  msg.textContent = 'Please wait...';

  const body = {
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value
  };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.className = 'form-msg error';
      msg.textContent = data.error || 'Login failed';
      return;
    }

    // Token aur user ko browser mein save karo
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    msg.className = 'form-msg success';
    msg.textContent = 'Login successful! Redirecting...';
    setTimeout(() => {
      window.location.href = data.user.role === 'admin' ? '/admin/dashboard.html' : '/';
    }, 800);
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = 'Server error. Please try again.';
  }
});