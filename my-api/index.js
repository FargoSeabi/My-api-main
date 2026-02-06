const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replaces database)
let tickets = [];
let nextId = 1;  // simple auto-increment ID

// Root route (for testing)
app.get('/', (req, res) => {
  res.send('Tech Support Ticket API (in-memory) is running 🚀');
});

// GET all tickets
app.get('/tickets', (req, res) => {
  res.json(tickets);
});

// GET single ticket
app.get('/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const ticket = tickets.find(t => t.id === id);
  
  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }
  
  res.json(ticket);
});

// POST – Create new ticket
app.post('/tickets', (req, res) => {
  const { customer, title, description, priority } = req.body;

  if (!customer || !title || !priority) {
    return res.status(400).json({ 
      message: 'customer, title, and priority are required' 
    });
  }

  const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority value' });
  }

  const newTicket = {
    id: nextId++,
    customer,
    title,
    description: description || null,
    priority,
    status: 'Open',
    created_at: new Date().toISOString()
  };

  tickets.push(newTicket);
  res.status(201).json(newTicket);
});

// PUT – Update ticket
app.put('/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const ticketIndex = tickets.findIndex(t => t.id === id);

  if (ticketIndex === -1) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  const { status, priority, description, title, customer } = req.body;

  if (!status && !priority && !description && !title && !customer) {
    return res.status(400).json({ message: 'At least one field to update is required' });
  }

  const ticket = tickets[ticketIndex];

  if (title)       ticket.title       = title;
  if (customer)    ticket.customer    = customer;
  if (description !== undefined) ticket.description = description;
  if (priority) {
    const valid = ['Low','Medium','High','Urgent'];
    if (!valid.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }
    ticket.priority = priority;
  }
  if (status) {
    const valid = ['Open','In Progress','Resolved'];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    ticket.status = status;
  }

  tickets[ticketIndex] = ticket;
  res.json(ticket);
});

// DELETE ticket
app.delete('/tickets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = tickets.length;
  
  tickets = tickets.filter(t => t.id !== id);

  if (tickets.length === initialLength) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.status(204).send();
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("→ Data is stored only in memory (lost on server restart)");
});