const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const db = require('./db');

const count = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c;
if (count > 0) {
  console.log('Data already exists. Seed skipped.');
  process.exit();
}

const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
db.exec(seedSql);

const hash = bcrypt.hashSync('admin123', 10);
db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
).run('Admin', 'admin@shopeasy.com', hash, 'admin');

console.log('Seed done! Admin: admin@shopeasy.com / admin123');