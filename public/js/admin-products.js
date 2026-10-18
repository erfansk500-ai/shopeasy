const tableBox = document.getElementById('tableBox');
const message = document.getElementById('message');
const form = document.getElementById('productForm');
const formMsg = document.getElementById('formMsg');
const categorySelect = document.getElementById('pcategory');
let products = [];

async function loadCategories() {
  const res = await fetch('/api/categories');
  const cats = await res.json();
  categorySelect.innerHTML = cats
    .map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

async function loadProducts() {
  try {
    products = await api('/api/admin/products');
    if (!products) return;
    const rows = products.map(p => `
      <tr class="${p.stock < 5 ? 'lowrow' : ''}">
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(p.category_name)}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}${p.stock < 5 ? ' ⚠ low' : ''}</td>
        <td>${p.is_active ? 'Active' : 'Inactive'}</td>
        <td>
          <button onclick="editProduct(${p.id})">Edit</button>
          ${p.is_active ? `<button class="remove" onclick="deleteProduct(${p.id})">Delete</button>` : ''}
        </td>
      </tr>`).join('');
    tableBox.innerHTML = `
      <table class="cart-table">
        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (e) {
    message.textContent = e.message;
  }
}

function openForm(p) {
  form.style.display = 'block';
  formMsg.textContent = '';
  document.getElementById('formTitle').textContent = p ? 'Edit Product' : 'Add Product';
  document.getElementById('pid').value = p ? p.id : '';
  document.getElementById('pname').value = p ? p.name : '';
  categorySelect.value = p ? p.category_id : categorySelect.options[0]?.value;
  document.getElementById('pdesc').value = p ? p.description || '' : '';
  document.getElementById('pprice').value = p ? p.price : '';
  document.getElementById('pstock').value = p ? p.stock : '';
  document.getElementById('pimage').value = p ? p.image_url || '' : '';
  document.getElementById('pactive').checked = p ? !!p.is_active : true;
  form.scrollIntoView({ behavior: 'smooth' });
}

function editProduct(id) {
  openForm(products.find(p => p.id === id));
}

async function deleteProduct(id) {
  if (!confirm('Deactivate this product?')) return;
  try {
    await api('/api/products/' + id, 'DELETE');
    loadProducts();
  } catch (e) {
    alert(e.message);
  }
}

document.getElementById('addBtn').addEventListener('click', () => openForm(null));
document.getElementById('cancelBtn').addEventListener('click', () => { form.style.display = 'none'; });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.className = 'form-msg';
  formMsg.textContent = 'Saving...';

  const id = document.getElementById('pid').value;
  const body = {
    name: document.getElementById('pname').value.trim(),
    category_id: Number(categorySelect.value),
    description: document.getElementById('pdesc').value.trim(),
    price: Number(document.getElementById('pprice').value),
    stock: Number(document.getElementById('pstock').value),
    image_url: document.getElementById('pimage').value.trim(),
    is_active: document.getElementById('pactive').checked ? 1 : 0
  };

  try {
    if (id) await api('/api/products/' + id, 'PUT', body);
    else await api('/api/products', 'POST', body);
    form.style.display = 'none';
    loadProducts();
  } catch (err) {
    formMsg.className = 'form-msg error';
    formMsg.textContent = err.message;
  }
});

loadCategories();
loadProducts();