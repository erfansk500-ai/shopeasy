const form = document.getElementById('profileForm');
const msg = document.getElementById('msg');

async function loadProfile() {
  if (!getToken()) { window.location.href = '/login.html'; return; }

  const res = await fetch('/api/auth/me', { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  const u = await res.json();

  document.getElementById('email').value = u.email;
  document.getElementById('name').value = u.name || '';
  document.getElementById('phone').value = u.phone || '';
  document.getElementById('address').value = u.address || '';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = 'form-msg';
  msg.textContent = 'Saving...';

  const body = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  try {
    const res = await fetch('/api/auth/me', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      msg.className = 'form-msg error';
      msg.textContent = data.error || 'Could not save';
      return;
    }
    // Navbar mein naya naam dikhe
    localStorage.setItem('user', JSON.stringify(data.user));
    updateNavbar();
    msg.className = 'form-msg success';
    msg.textContent = 'Profile updated!';
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = 'Server error. Please try again.';
  }
});

loadProfile();