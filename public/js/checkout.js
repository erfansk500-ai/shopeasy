const form = document.getElementById('checkoutForm');
const msg = document.getElementById('msg');
const summary = document.getElementById('summary');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadSummary() {
  if (!getToken()) {
    window.location.href = '/login.html';
    return;
  }
  const res = await fetch('/api/cart', { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  const data = await res.json();

  if (data.items.length === 0) {
    summary.innerHTML = '<p>Your cart is empty. <a href="/">Shop now</a></p>';
    form.style.display = 'none';
    return;
  }

  summary.innerHTML = '<h3>Order Summary</h3>' +
    data.items.map(i =>
      '<p>' + escapeHtml(i.name) + ' x ' + i.quantity + ' = ₹' + i.line_total + '</p>'
    ).join('') +
    '<h3>Total: ₹' + data.grandTotal + '</h3>';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.className = 'form-msg';
  msg.textContent = 'Placing order...';

  const body = {
    name: document.getElementById('name').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    address: document.getElementById('address').value.trim(),
    city: document.getElementById('city').value.trim(),
    pin: document.getElementById('pin').value.trim()
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) {
      msg.className = 'form-msg error';
      msg.textContent = data.error || 'Could not place order';
      return;
    }
    window.location.href = '/success.html?id=' + data.orderId;
  } catch (err) {
    msg.className = 'form-msg error';
    msg.textContent = 'Server error. Please try again.';
  }
});

loadSummary();