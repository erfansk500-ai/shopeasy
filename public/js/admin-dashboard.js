(async function () {
  const stats = document.getElementById('stats');
  try {
    const d = await api('/api/admin/stats');
    if (!d) return;
    stats.innerHTML = `
      <div class="stat-card"><h3>${d.products}</h3><p>Products</p></div>
      <div class="stat-card"><h3>${d.orders}</h3><p>Orders</p></div>
      <div class="stat-card"><h3>${d.customers}</h3><p>Customers</p></div>
      <div class="stat-card"><h3>₹${d.sales}</h3><p>Total Sales</p></div>
    `;
  } catch (e) {
    document.getElementById('message').textContent = e.message;
  }
})();