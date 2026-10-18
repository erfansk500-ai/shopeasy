const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const express = require('express');
const db = require('../db');

const router = express.Router();

// LIST PRODUCTS (search, category, page, sort)
router.get('/', (req, res) => {
  const search = req.query.search || '';
  const category = req.query.category;
  const sort = req.query.sort;
  const page = parseInt(req.query.page) || 1;
  const limit = 8;
  const offset = (page - 1) * limit;

  let where = 'WHERE p.is_active = 1 AND p.name LIKE ?';
  const params = ['%' + search + '%'];

  if (category) {
    where += ' AND p.category_id = ?';
    params.push(category);
  }

  let orderBy = 'ORDER BY p.id DESC';
  if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC';
  if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC';

  const total = db
    .prepare('SELECT COUNT(*) AS c FROM products p ' + where)
    .get(...params).c;

  const products = db
    .prepare(
      'SELECT p.*, c.name AS category_name FROM products p ' +
      'JOIN categories c ON p.category_id = c.id ' +
      where + ' ' + orderBy + ' LIMIT ? OFFSET ?'
    )
    .all(...params, limit, offset);

  res.json({
    products,
    page,
    totalPages: Math.ceil(total / limit),
    total
  });
});

// SINGLE PRODUCT
router.get('/:id', (req, res) => {
  const product = db
    .prepare(
      'SELECT p.*, c.name AS category_name FROM products p ' +
      'JOIN categories c ON p.category_id = c.id ' +
      'WHERE p.id = ? AND p.is_active = 1'
    )
    .get(req.params.id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});
// Validation helper
function validateProduct(b) {
  if (!b.name || !b.category_id) return 'Name and category are required';
  if (isNaN(b.price) || Number(b.price) < 0) return 'Price must be a valid number';
  if (!Number.isInteger(Number(b.stock)) || Number(b.stock) < 0) return 'Stock must be 0 or more';
  return null;
}

// CREATE PRODUCT (admin)
router.post('/', auth, adminOnly, (req, res) => {
  const b = req.body;
  const err = validateProduct(b);
  if (err) return res.status(400).json({ error: err });

  const result = db
    .prepare(
      'INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(b.category_id, b.name, b.description || '', b.price, b.stock, b.image_url || '');
  res.status(201).json({ message: 'Product created', id: result.lastInsertRowid });
});

// UPDATE PRODUCT (admin). is_active bhi badal sakte hain (reactivate)
router.put('/:id', auth, adminOnly, (req, res) => {
  const b = req.body;
  const err = validateProduct(b);
  if (err) return res.status(400).json({ error: err });

  const result = db
    .prepare(
      'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ?, is_active = ? WHERE id = ?'
    )
    .run(
      b.category_id, b.name, b.description || '', b.price, b.stock,
      b.image_url || '', b.is_active === 0 ? 0 : 1, req.params.id
    );
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product updated' });
});

// DELETE = deactivate (admin). Purane orders kharab na hon isliye asli delete nahi
router.delete('/:id', auth, adminOnly, (req, res) => {
  const result = db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Product not found' });
  res.json({ message: 'Product deactivated' });
});
module.exports = router;