const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // page reload rokta hai
  msg.className = 'form-msg';
  msg.textContent = 'Please wait...';

  const body = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    password: document.getElementById('password').value
  };

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (!res.ok) {
      msg.className = 'form-msg error';
      msg.textContent = data.error || 'Registration failed';
      return;
    }

    msg.className = 'form-msg success';
    msg.textContent = 'Registered! Redirecting to login...';
    setTimeout(() => { window.location.href = '/login.html'; }, 1200);
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = 'Server error. Please try again.';
  }
});