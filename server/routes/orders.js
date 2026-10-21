const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// PLACE ORDER (checkout)
router.post('/', (req, res) => {
  const { name, phone, address, city, pin } = req.body;

  if (!name || !phone || !address || !city || !pin) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone must be 10 digits' });
  }
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN code must be 6 digits' });
  }

  const placeOrder = db.transaction(() => {
    const items = db
      .prepare(
        'SELECT ci.quantity, p.id AS product_id, p.name, p.price, p.stock ' +
        'FROM cart_items ci JOIN products p ON ci.product_id = p.id ' +
        'WHERE ci.user_id = ? AND p.is_active = 1'
      )
      .all(req.user.id);

    if (items.length === 0) throw new Error('Your cart is empty');

    let total = 0;
    for (const i of items) {
      if (i.quantity > i.stock) {
        throw new Error('Not enough stock for ' + i.name + ' (only ' + i.stock + ' left)');
      }
      total += i.quantity * i.price;
    }

    const fullAddress = address + ', ' + city + ' - ' + pin;
    const order = db
      .prepare(
        'INSERT INTO orders (user_id, total_amount, shipping_name, shipping_phone, shipping_address) ' +
        'VALUES (?, ?, ?, ?, ?)'
      )
      .run(req.user.id, total, name, phone, fullAddress);
    const orderId = order.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)'
    );
    const reduceStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

    for (const i of items) {
      insertItem.run(orderId, i.product_id, i.quantity, i.price);
      reduceStock.run(i.quantity, i.product_id);
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
    return orderId;
  });

  try {
    const orderId = placeOrder();
    res.status(201).json({ message: 'Order placed', orderId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// MY ORDERS
router.get('/', (req, res) => {
  const orders = db
    .prepare('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC')
    .all(req.user.id);
  res.json(orders);
});

// ORDER DETAIL (owner ya admin)
router.get('/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not allowed' });
  }

  const items = db
    .prepare(
      'SELECT oi.quantity, oi.unit_price, p.name, (oi.quantity * oi.unit_price) AS line_total ' +
      'FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?'
    )
    .all(order.id);

  res.json({ order, items });
});
// CANCEL ORDER (customer, sirf Placed status mein)
router.patch('/:id/cancel', (req, res) => {
  const cancelOrder = db.transaction(() => {
    const order = db
      .prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);

    if (!order) throw new Error('NOT_FOUND');
    if (order.status !== 'Placed') {
      throw new Error('Only orders with status Placed can be cancelled');
    }

    const items = db
      .prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?')
      .all(order.id);

    const restoreStock = db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?');
    for (const i of items) {
      restoreStock.run(i.quantity, i.product_id);
    }

    db.prepare("UPDATE orders SET status = 'Cancelled' WHERE id = ?").run(order.id);
  });

  try {
    cancelOrder();
    res.json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;