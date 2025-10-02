const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000; // Cambio a 3000 para testing local

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory fallback data
let fallbackProducts = [
  {
    id: 1,
    name: 'Laptop Pro',
    category: 'Electronics',
    quantity: 15,
    price: 1299.99,
    description: 'High-performance laptop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    category: 'Electronics',
    quantity: 45,
    price: 29.99,
    description: 'Ergonomic wireless mouse',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Office Chair',
    category: 'Furniture',
    quantity: 8,
    price: 199.99,
    description: 'Comfortable office chair',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let nextId = 4;
let useMemoryMode = false;

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.RDS_HOSTNAME || 'localhost',
  user: process.env.RDS_USERNAME || 'postgres',
  password: process.env.RDS_PASSWORD || '5788',
  database: process.env.RDS_DB_NAME || 'inventory_db',
  port: process.env.RDS_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const result = await client.query('SELECT COUNT(*) as count FROM products');
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      const sampleProducts = [
        ['Laptop Pro', 'Electronics', 15, 1299.99, 'High-performance laptop'],
        ['Wireless Mouse', 'Electronics', 45, 29.99, 'Ergonomic wireless mouse'],
        ['Office Chair', 'Furniture', 8, 199.99, 'Comfortable office chair'],
        ['Coffee Beans', 'Food', 120, 12.99, 'Premium coffee beans'],
        ['Notebook Set', 'Office Supplies', 200, 8.99, 'Pack of 3 notebooks']
      ];

      for (const product of sampleProducts) {
        await client.query(
          'INSERT INTO products (name, category, quantity, price, description) VALUES ($1, $2, $3, $4, $5)',
          product
        );
      }
      console.log('Sample data inserted successfully');
    }

    client.release();
    console.log('✅ PostgreSQL database initialized successfully');
    useMemoryMode = false;
  } catch (error) {
    console.log('⚠️  PostgreSQL not available, using memory mode');
    console.log('💾 Using in-memory storage for testing');
    useMemoryMode = true;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    mode: useMemoryMode ? 'memory' : 'postgresql'
  });
});

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    if (useMemoryMode) {
      res.json(fallbackProducts);
    } else {
      const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useMemoryMode) {
      const product = fallbackProducts.find(p => p.id === parseInt(id));
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(product);
    } else {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, quantity, price, description } = req.body;

    if (!name || !category || quantity === undefined || price === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (useMemoryMode) {
      const newProduct = {
        id: nextId++,
        name,
        category,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        description: description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      fallbackProducts.push(newProduct);
      res.json({ id: newProduct.id, message: 'Product created successfully' });
    } else {
      const result = await pool.query(
        'INSERT INTO products (name, category, quantity, price, description) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [name, category, quantity, price, description]
      );
      res.json({ id: result.rows[0].id, message: 'Product created successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, price, description } = req.body;

    if (useMemoryMode) {
      const productIndex = fallbackProducts.findIndex(p => p.id === parseInt(id));
      if (productIndex === -1) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      fallbackProducts[productIndex] = {
        ...fallbackProducts[productIndex],
        name,
        category,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        description: description || '',
        updated_at: new Date().toISOString()
      };
      res.json({ message: 'Product updated successfully' });
    } else {
      const result = await pool.query(
        'UPDATE products SET name = $1, category = $2, quantity = $3, price = $4, description = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6',
        [name, category, quantity, price, description, id]
      );
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ message: 'Product updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (useMemoryMode) {
      const productIndex = fallbackProducts.findIndex(p => p.id === parseInt(id));
      if (productIndex === -1) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      fallbackProducts.splice(productIndex, 1);
      res.json({ message: 'Product deleted successfully' });
    } else {
      const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ message: 'Product deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    if (useMemoryMode) {
      const totalProducts = fallbackProducts.length;
      const totalItems = fallbackProducts.reduce((sum, p) => sum + p.quantity, 0);
      const categories = [...new Set(fallbackProducts.map(p => p.category))].length;
      const totalValue = fallbackProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);

      res.json({
        total_products: totalProducts,
        total_items: totalItems,
        categories: categories,
        total_value: totalValue
      });
    } else {
      const result = await pool.query(`
        SELECT
          COUNT(*) as total_products,
          COALESCE(SUM(quantity), 0) as total_items,
          COUNT(DISTINCT category) as categories,
          COALESCE(SUM(quantity * price), 0) as total_value
        FROM products
      `);
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to view the app`);
    console.log(`💾 Mode: ${useMemoryMode ? 'In-Memory (Testing)' : 'PostgreSQL (Production)'}`);
  });
}).catch(error => {
  console.error('Failed to initialize:', error);
  process.exit(1);
});