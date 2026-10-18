// Admin page par sirf admin aa sake
(function () {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user || user.role !== 'admin') {
    alert('Admin access only. Please login as admin.');
    window.location.href = '/login.html';
  }
})();

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text == null ? '' : text;
  return div.innerHTML;
}

// Har admin API call yahan se jayegi
async function api(url, method = 'GET', body) {
  const options = { method, headers: authHeaders() };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    logout();
    return null;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}