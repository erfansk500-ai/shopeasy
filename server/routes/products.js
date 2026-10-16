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

module.exports = router;