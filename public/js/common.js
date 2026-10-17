function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getToken()
  };
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

async function updateNavbar() {
  const loginLink = document.getElementById('loginLink');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (user && loginLink) {
    loginLink.textContent = 'Logout (' + user.name + ')';
    loginLink.href = '#';
    loginLink.onclick = (e) => { e.preventDefault(); logout(); };
  }

  const countEl = document.getElementById('cartCount');
  if (user && countEl) {
    try {
      const res = await fetch('/api/cart', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        countEl.textContent = data.count;
      }
    } catch (e) {}
  }
}

updateNavbar();