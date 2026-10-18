const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();
router.use(auth, adminOnly);

// DASHBOARD COUNTS
router.get('/stats', (req, res) => {
  const products = db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1').get().c;
  const orders = db.prepare('SELECT COUNT(*) AS c FROM orders').get().c;
  const customers = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'customer'").get().c;
  const sales = db
    .prepare("SELECT COALESCE(SUM(total_amount), 0) AS s FROM orders WHERE status != 'Cancelled'")
    .get().s;
  res.json({ products, orders, customers, sales });
});

// ALL ORDERS
router.get('/orders', (req, res) => {
  const orders = db
    .prepare(
      'SELECT o.id, o.total_amount, o.status, o.created_at, u.name AS customer_name ' +
      'FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC'
    )
    .all();
  res.json(orders);
});

// UPDATE ORDER STATUS (Placed -> Shipped -> Delivered)
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const flow = { Placed: 'Shipped', Shipped: 'Delivered' };

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (flow[order.status] !== status) {
    return res.status(400).json({
      error: 'Invalid change. ' + order.status + ' can only move to ' + (flow[order.status] || 'nothing')
    });
  }

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, order.id);
  res.json({ message: 'Status updated', status });
});

// ALL PRODUCTS (including deactivated) for admin table
router.get('/products', (req, res) => {
  const products = db
    .prepare(
      'SELECT p.*, c.name AS category_name FROM products p ' +
      'JOIN categories c ON p.category_id = c.id ORDER BY p.id DESC'
    )
    .all();
  res.json(products);
});

module.exports = router;