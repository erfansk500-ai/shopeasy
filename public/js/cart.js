const cartBox = document.getElementById('cartBox');
const message = document.getElementById('message');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadCart() {
  if (!getToken()) {
    message.textContent = 'Please login to see your cart.';
    cartBox.innerHTML = '<a href="/login.html">Go to Login</a>';
    return;
  }

  const res = await fetch('/api/cart', { headers: authHeaders() });
  if (res.status === 401) {
    logout();
    return;
  }
  const data = await res.json();

  if (data.items.length === 0) {
    message.textContent = 'Your cart is empty.';
    cartBox.innerHTML = '<a href="/">Continue shopping</a>';
    return;
  }
  message.textContent = '';

  const rows = data.items.map(i => `
    <tr>
      <td>${escapeHtml(i.name)}</td>
      <td>₹${i.price}</td>
      <td>
        <button onclick="changeQty(${i.id}, ${i.quantity - 1})" ${i.quantity <= 1 ? 'disabled' : ''}>-</button>
        <span class="qty">${i.quantity}</span>
        <button onclick="changeQty(${i.id}, ${i.quantity + 1})">+</button>
      </td>
      <td>₹${i.line_total}</td>
      <td><button class="remove" onclick="removeItem(${i.id})">Remove</button></td>
    </tr>
  `).join('');

  cartBox.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Total</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h3 class="grand">Grand Total: ₹${data.grandTotal}</h3>
    <a href="/checkout.html" class="checkout-btn">Proceed to Checkout</a>
  `;
}

async function changeQty(itemId, quantity) {
  const res = await fetch('/api/cart/' + itemId, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ quantity })
  });
  const data = await res.json();
  if (!res.ok) alert(data.error);
  loadCart();
  updateNavbar();
}

async function removeItem(itemId) {
  await fetch('/api/cart/' + itemId, { method: 'DELETE', headers: authHeaders() });
  loadCart();
  updateNavbar();
}

loadCart();