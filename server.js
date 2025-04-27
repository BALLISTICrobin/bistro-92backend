const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_CWQosN8S1RqX@ep-square-poetry-a1u8yqpw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false } // Required for Neon
});

// Test database connection
pool.connect((err) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});


app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 100');
    res.status(200).json({ orders: result.rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// POST endpoint to handle orders
app.post('/api/orders', async (req, res) => {
  const { table_number, items } = req.body;

  if (!table_number || !items) {
    return res.status(400).send('Table number and items are required');
  }

  try {
    const query = 'INSERT INTO orders (table_number, items) VALUES ($1, $2) RETURNING *';
    const values = [table_number, items];
    const result = await pool.query(query, values);
    res.status(201).json({ message: 'Order inserted successfully', order: result.rows[0] });
  } catch (err) {
    console.error('Error inserting order:', err.stack);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});