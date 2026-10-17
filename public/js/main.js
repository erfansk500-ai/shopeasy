const grid = document.getElementById('productGrid');
const message = document.getElementById('message');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

let currentPage = 1;
let totalPages = 1;

// XSS se bachne ke liye: text ko safe banata hai
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function loadCategories() {
  const res = await fetch('/api/categories');
  const categories = await res.json();
  categories.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.name;
    categorySelect.appendChild(option);
  });
}

async function loadProducts() {
  message.textContent = 'Loading...';
  grid.innerHTML = '';

  const params = new URLSearchParams({
    page: currentPage,
    search: searchInput.value,
    category: categorySelect.value,
    sort: sortSelect.value
  });

  try {
    const res = await fetch('/api/products?' + params.toString());
    const data = await res.json();
    totalPages = data.totalPages || 1;
    renderProducts(data.products);
    pageInfo.textContent = 'Page ' + data.page + ' of ' + totalPages;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    message.textContent = data.products.length ? '' : 'No products found.';
  } catch (err) {
    message.textContent = 'Something went wrong. Please try again.';
  }
}

function renderProducts(products) {
  grid.innerHTML = products.map(p => {
    let stockText = '';
    if (p.stock === 0) stockText = '<span class="out">Out of stock</span>';
    else if (p.stock < 5) stockText = '<span class="low">Only ' + p.stock + ' left</span>';

    return `
      <div class="card">
        <img src="${escapeHtml(p.image_url || '')}" alt="${escapeHtml(p.name)}">
        <div class="card-body">
          <span class="category">${escapeHtml(p.category_name)}</span>
          <h3>${escapeHtml(p.name)}</h3>
          <span class="price">₹${p.price}</span>
          ${stockText}
          <button ${p.stock === 0 ? 'disabled' : ''} onclick="addToCart(${p.id})">
            ${p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Abhi sirf placeholder. Cart API baad mein banayenge.
function addToCart(productId) {
  alert('Cart abhi banana baaki hai. Product ID: ' + productId);
}

// Har key par request na jaye, isliye 0.4 second ruk kar bhejte hain
let timer;
searchInput.addEventListener('input', () => {
  clearTimeout(timer);
  timer = setTimeout(() => { currentPage = 1; loadProducts(); }, 400);
});
categorySelect.addEventListener('change', () => { currentPage = 1; loadProducts(); });
sortSelect.addEventListener('change', () => { currentPage = 1; loadProducts(); });
prevBtn.addEventListener('click', () => { currentPage--; loadProducts(); });
nextBtn.addEventListener('click', () => { currentPage++; loadProducts(); });

loadCategories();
loadProducts();