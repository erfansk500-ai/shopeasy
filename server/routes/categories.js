const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});
// CREATE CATEGORY
router.post('/', auth, adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    const result = db.prepare('INSERT INTO categories (name) VALUES (?)').run(name);
    res.status(201).json({ message: 'Category created', id: result.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Category already exists' });
  }
});

// UPDATE CATEGORY
router.put('/:id', auth, adminOnly, (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  try {
    const result = db.prepare('UPDATE categories SET name = ? WHERE id = ?').run(name, req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category updated' });
  } catch (e) {
    res.status(400).json({ error: 'Category already exists' });
  }
});

// DELETE CATEGORY (agar products hain to nahi hoga)
router.delete('/:id', auth, adminOnly, (req, res) => {
  const used = db.prepare('SELECT COUNT(*) AS c FROM products WHERE category_id = ?').get(req.params.id).c;
  if (used > 0) {
    return res.status(400).json({ error: 'Category has products. Move or remove them first.' });
  }
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Category not found' });
  res.json({ message: 'Category deleted' });
});
module.exports = router;