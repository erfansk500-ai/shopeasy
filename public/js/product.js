const box = document.getElementById('productBox');
const message = document.getElementById('message');
const productId = new URLSearchParams(window.location.search).get('id');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadProduct() {
  message.textContent = 'Loading...';
  try {
    const res = await fetch('/api/products/' + productId);
    if (!res.ok) {
      message.textContent = 'Product not found.';
      return;
    }
    const p = await res.json();
    message.textContent = '';

    let stockText = '<span class="in">In stock (' + p.stock + ' available)</span>';
    if (p.stock === 0) stockText = '<span class="out">Out of stock</span>';
    else if (p.stock < 5) stockText = '<span class="low">Only ' + p.stock + ' left</span>';

    box.innerHTML = `
      <div class="detail">
        <img src="${escapeHtml(p.image_url || '')}" alt="${escapeHtml(p.name)}">
        <div class="detail-info">
          <span class="category">${escapeHtml(p.category_name)}</span>
          <h2>${escapeHtml(p.name)}</h2>
          <p>${escapeHtml(p.description || '')}</p>
          <span class="price">₹${p.price}</span>
          ${stockText}
          <div class="qty-row">
            <label>Quantity</label>
            <input type="number" id="qtyInput" value="1" min="1" max="${p.stock}" ${p.stock === 0 ? 'disabled' : ''}>
          </div>
          <button id="addBtn" ${p.stock === 0 ? 'disabled' : ''}>
            ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;

    document.getElementById('addBtn').addEventListener('click', () => addToCart(p.id));
  } catch (err) {
    message.textContent = 'Something went wrong.';
  }
}

async function addToCart(id) {
  if (!getToken()) {
    alert('Please login first');
    window.location.href = '/login.html';
    return;
  }
  const quantity = parseInt(document.getElementById('qtyInput').value) || 1;
  const res = await fetch('/api/cart', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ productId: id, quantity })
  });
  const data = await res.json();
  if (!res.ok) { alert(data.error); return; }
  updateNavbar();
  alert('Added to cart!');
}

loadProduct();