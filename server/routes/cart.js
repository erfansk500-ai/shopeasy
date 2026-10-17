const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Is router ke saare routes par login zaroori hai
router.use(auth);

// GET CART
router.get('/', (req, res) => {
  const items = db
    .prepare(
      'SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url, ' +
      '(ci.quantity * p.price) AS line_total ' +
      'FROM cart_items ci JOIN products p ON ci.product_id = p.id ' +
      'WHERE ci.user_id = ?'
    )
    .all(req.user.id);

  const grandTotal = items.reduce((sum, i) => sum + i.line_total, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ items, grandTotal, count });
});

// ADD TO CART
router.post('/', (req, res) => {
  const productId = parseInt(req.body.productId);
  const quantity = parseInt(req.body.quantity) || 1;

  if (!productId || quantity < 1) {
    return res.status(400).json({ error: 'Valid productId and quantity required' });
  }

  const product = db
    .prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
    .get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (product.stock === 0) return res.status(400).json({ error: 'Product is out of stock' });

  const existing = db
    .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?')
    .get(req.user.id, productId);

  const newQty = (existing ? existing.quantity : 0) + quantity;
  if (newQty > product.stock) {
    return res.status(400).json({ error: 'Only ' + product.stock + ' available in stock' });
  }

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(newQty, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(req.user.id, productId, quantity);
  }
  res.status(201).json({ message: 'Added to cart' });
});

// UPDATE QUANTITY
router.put('/:itemId', (req, res) => {
  const quantity = parseInt(req.body.quantity);
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  const item = db
    .prepare(
      'SELECT ci.id, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id ' +
      'WHERE ci.id = ? AND ci.user_id = ?'
    )
    .get(req.params.itemId, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });
  if (quantity > item.stock) {
    return res.status(400).json({ error: 'Only ' + item.stock + ' available in stock' });
  }

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, item.id);
  res.json({ message: 'Quantity updated' });
});

// REMOVE ITEM
router.delete('/:itemId', (req, res) => {
  const result = db
    .prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?')
    .run(req.params.itemId, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Cart item not found' });
  res.json({ message: 'Item removed' });
});

module.exports = router;