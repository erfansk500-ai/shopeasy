require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/auth', require('./routes/auth'));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from ShopEasy!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});