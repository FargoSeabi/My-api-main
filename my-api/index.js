const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Seazaqw@12',           // ← Change this in production / use .env
  database: 'tech'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database ✅');
});

// Root route (for testing)
app.get('/', (req, res) => {
  res.send('Tech Support Ticket API is running 🚀');
});

// GET all tickets
app.get('/tickets', (req, res) => {
  db.query('SELECT * FROM tickets ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// GET single ticket
app.get('/tickets/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Ticket not found' });
    res.json(results[0]);
  });
});

// POST – Create new ticket
app.post('/tickets', (req, res) => {
  const { customer, title, description, priority } = req.body;

  if (!customer || !title || !priority) {
    return res.status(400).json({ message: 'customer, title, and priority are required' });
  }

  const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority value' });
  }

  const query = `
    INSERT INTO tickets (customer, title, description, priority, status)
    VALUES (?, ?, ?, ?, 'Open')
  `;

  db.query(query, [customer, title, description || null, priority], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create ticket' });
    }

    const newTicket = {
      id: result.insertId,
      customer,
      title,
      description: description || null,
      priority,
      status: 'Open',
      created_at: new Date().toISOString()
    };

    res.status(201).json(newTicket);
  });
});

// PUT – Update ticket (status, priority, etc.)
app.put('/tickets/:id', (req, res) => {
  const { id } = req.params;
  const { status, priority, description, title, customer } = req.body;

  if (!status && !priority && !description && !title && !customer) {
    return res.status(400).json({ message: 'At least one field to update is required' });
  }

  let updates = [];
  let values = [];

  if (title)     { updates.push('title = ?');     values.push(title); }
  if (customer)  { updates.push('customer = ?');  values.push(customer); }
  if (description !== undefined) { updates.push('description = ?'); values.push(description); }
  if (priority)  { 
    const valid = ['Low','Medium','High','Urgent'];
    if (!valid.includes(priority)) return res.status(400).json({ message: 'Invalid priority' });
    updates.push('priority = ?'); values.push(priority); 
  }
  if (status)    { 
    const valid = ['Open','In Progress','Resolved'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    updates.push('status = ?'); values.push(status); 
  }

  values.push(id);

  const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update ticket' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    db.query('SELECT * FROM tickets WHERE id = ?', [id], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(500).json({ error: 'Error fetching updated ticket' });
      }
      res.json(rows[0]);
    });
  });
});

// DELETE ticket
app.delete('/tickets/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tickets WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Ticket not found' });
    res.status(204).send();
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});