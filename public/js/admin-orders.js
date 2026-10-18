const tableBox = document.getElementById('tableBox');
const message = document.getElementById('message');
const nextStatus = { Placed: 'Shipped', Shipped: 'Delivered' };

async function loadOrders() {
  try {
    const orders = await api('/api/admin/orders');
    if (!orders) return;
    if (orders.length === 0) {
      message.textContent = 'No orders yet.';
      return;
    }
    const rows = orders.map(o => {
      const next = nextStatus[o.status];
      const action = next
        ? `<button onclick="updateStatus(${o.id}, '${next}')">Mark ${next}</button>`
        : '-';
      return `
        <tr>
          <td>#${o.id}</td>
          <td>${escapeHtml(o.customer_name)}</td>
          <td>${new Date(o.created_at + 'Z').toLocaleDateString()}</td>
          <td>₹${o.total_amount}</td>
          <td><span class="badge ${o.status}">${o.status}</span></td>
          <td>${action}</td>
        </tr>`;
    }).join('');
    tableBox.innerHTML = `
      <table class="cart-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (e) {
    message.textContent = e.message;
  }
}

async function updateStatus(id, status) {
  try {
    await api('/api/admin/orders/' + id + '/status', 'PATCH', { status });
    loadOrders();
  } catch (e) {
    alert(e.message);
  }
}

loadOrders();