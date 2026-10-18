const box = document.getElementById('orderBox');
const message = document.getElementById('message');
const orderId = new URLSearchParams(window.location.search).get('id');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadOrder() {
  if (!getToken()) { window.location.href = '/login.html'; return; }

  const res = await fetch('/api/orders/' + orderId, { headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json();
    message.textContent = err.error || 'Could not load order';
    return;
  }
  const { order, items } = await res.json();

  const rows = items.map(i => `
    <tr>
      <td>${escapeHtml(i.name)}</td>
      <td>${i.quantity}</td>
      <td>₹${i.unit_price}</td>
      <td>₹${i.line_total}</td>
    </tr>`).join('');

  box.innerHTML = `
    <div class="success-box">
      <h2>🎉 Order #${order.id} placed!</h2>
      <p>Status: <span class="badge ${order.status}">${order.status}</span></p>
      <p>Payment: Cash on Delivery</p>
      <p>Deliver to: ${escapeHtml(order.shipping_name)}, ${escapeHtml(order.shipping_phone)}</p>
      <p>${escapeHtml(order.shipping_address)}</p>
      <table class="cart-table">
        <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <h3 class="grand">Total: ₹${order.total_amount}</h3>
      <a href="/">Continue shopping</a> | <a href="/orders.html">My Orders</a>
    </div>
  `;
}

loadOrder();