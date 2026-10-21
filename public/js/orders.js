const box = document.getElementById('ordersBox');
const message = document.getElementById('message');

async function loadOrders() {
  if (!getToken()) { window.location.href = '/login.html'; return; }

  const res = await fetch('/api/orders', { headers: authHeaders() });
  if (res.status === 401) { logout(); return; }
  const orders = await res.json();

  if (orders.length === 0) {
    message.textContent = 'You have no orders yet.';
    box.innerHTML = '<a href="/">Start shopping</a>';
    return;
  }
  message.textContent = '';

  const rows = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${new Date(o.created_at + 'Z').toLocaleDateString()}</td>
      <td>₹${o.total_amount}</td>
      <td><span class="badge ${o.status}">${o.status}</span></td>
      <td>
        <a href="/success.html?id=${o.id}">View</a>
        ${o.status === 'Placed'
          ? `<button class="remove" onclick="cancelOrder(${o.id})">Cancel</button>`
          : ''}
      </td>
    </tr>`).join('');

  box.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function cancelOrder(id) {
  if (!confirm('Cancel order #' + id + '?')) return;

  const res = await fetch('/api/orders/' + id + '/cancel', {
    method: 'PATCH',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error);
    return;
  }
  alert('Order cancelled');
  loadOrders();
}

loadOrders();