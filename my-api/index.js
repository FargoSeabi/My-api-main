const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Seazaqw@12',
  database: 'tech'
});

db.connect(err => {
  if (err) {
    console.error('DB error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.get('/', (req, res) => {
  res.send('API is running 🚀');
});


app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

//ADD DATA USING POST (EXPLAIN EVERYTHING)
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.status(201).json({
        id: result.insertId,
        name,
        email
      });
    }
  );
});

const cors = require('cors');



app.use(cors());              // 👈 REQUIRED
app.use(express.json());
