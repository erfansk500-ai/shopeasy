const tableBox = document.getElementById('tableBox');
const message = document.getElementById('message');

async function loadCategories() {
  const res = await fetch('/api/categories');
  const cats = await res.json();
  const rows = cats.map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>
        <button onclick="renameCategory(${c.id}, '${escapeHtml(c.name).replace(/'/g, "\\'")}')">Rename</button>
        <button class="remove" onclick="deleteCategory(${c.id})">Delete</button>
      </td>
    </tr>`).join('');
  tableBox.innerHTML = `
    <table class="cart-table">
      <thead><tr><th>ID</th><th>Name</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function renameCategory(id, oldName) {
  const name = prompt('New name:', oldName);
  if (!name || !name.trim()) return;
  try {
    await api('/api/categories/' + id, 'PUT', { name });
    message.textContent = '';
    loadCategories();
  } catch (e) {
    message.textContent = e.message;
  }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  try {
    await api('/api/categories/' + id, 'DELETE');
    message.textContent = '';
    loadCategories();
  } catch (e) {
    message.textContent = e.message;
  }
}

document.getElementById('catForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('catName');
  try {
    await api('/api/categories', 'POST', { name: input.value });
    input.value = '';
    message.textContent = '';
    loadCategories();
  } catch (err) {
    message.textContent = err.message;
  }
});

loadCategories();