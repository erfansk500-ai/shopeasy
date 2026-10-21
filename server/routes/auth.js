const auth = require('../middleware/auth');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');


const router = express.Router();

// REGISTER
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, hash);

  res.status(201).json({ message: 'Registered successfully', userId: result.lastInsertRowid });
});

// LOGIN
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});
// CURRENT USER
router.get('/me', auth, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role, phone, address FROM users WHERE id = ?')
    .get(req.user.id);
  res.json(user);
});
// UPDATE PROFILE
router.put('/me', auth, (req, res) => {
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const address = (req.body.address || '').trim();

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (phone && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone must be 10 digits' });
  }

  db.prepare('UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?')
    .run(name, phone, address, req.user.id);

  const user = db
    .prepare('SELECT id, name, email, role, phone, address FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ message: 'Profile updated', user });
});
module.exports = router;