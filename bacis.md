# Expense Tracker with Node.js and PostgreSQL (Without ORM)

Here's a comprehensive guide to building a backend for your expense tracker using Node.js and PostgreSQL directly (without ORMs like Sequelize or TypeORM).

## Project Structure

```
/expense-tracker
  ├── /config
  │   └── db.js          # Database connection setup
  ├── /migrations        # SQL migration files
  ├── /queries           # All SQL queries
  │   ├── users.js
  │   ├── categories.js
  │   └── expenses.js
  ├── /routes
  │   ├── auth.js        # Authentication routes
  │   ├── categories.js  # Category routes
  │   └── expenses.js    # Expense routes
  ├── /utils
  │   ├── auth.js        # Auth utilities
  │   └── validators.js  # Request validation
  ├── app.js             # Main application file
  └── package.json
```

## Step 1: Database Setup

### 1. Install PostgreSQL
Make sure you have PostgreSQL installed. You can download it from [postgresql.org](https://www.postgresql.org/download/).

### 2. Create Database
```sql
CREATE DATABASE expense_tracker;
```

### 3. Create Tables
Create a migration file (`migrations/001_initial_tables.sql`):

```sql
-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Expenses table
CREATE TABLE expenses (
  expense_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_categories_user_id ON categories(user_id);
```

Run this migration with psql:
```bash
psql -U your_username -d expense_tracker -f migrations/001_initial_tables.sql
```

## Step 2: Node.js Setup

### 1. Initialize project
```bash
mkdir expense-tracker
cd expense-tracker
npm init -y
```

### 2. Install dependencies
```bash
npm install express pg bcryptjs jsonwebtoken dotenv cors
npm install --save-dev nodemon
```

### 3. Database Configuration (`config/db.js`)
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL:', err);
  } else {
    console.log('Connected to PostgreSQL at:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // in case you need to access the pool directly
};
```

## Step 3: Query Files

### Example: `queries/expenses.js`
```javascript
const db = require('../config/db');

module.exports = {
  // Create a new expense
  createExpense: async (userId, { category_id, amount, description, date }) => {
    const query = `
      INSERT INTO expenses (user_id, category_id, amount, description, date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [userId, category_id, amount, description, date];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Get all expenses for a user with optional filters
  getExpenses: async (userId, { startDate, endDate, categoryId, limit, offset }) => {
    let query = `
      SELECT e.*, c.name as category_name 
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.user_id = $1
    `;
    const values = [userId];
    let paramCount = 2;

    if (startDate) {
      query += ` AND e.date >= $${paramCount++}`;
      values.push(startDate);
    }
    if (endDate) {
      query += ` AND e.date <= $${paramCount++}`;
      values.push(endDate);
    }
    if (categoryId) {
      query += ` AND e.category_id = $${paramCount++}`;
      values.push(categoryId);
    }

    query += ' ORDER BY e.date DESC';

    if (limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(limit);
    }
    if (offset) {
      query += ` OFFSET $${paramCount++}`;
      values.push(offset);
    }

    const { rows } = await db.query(query, values);
    return rows;
  },

  // Get expense summary by category
  getExpenseSummaryByCategory: async (userId, { startDate, endDate }) => {
    const query = `
      SELECT 
        c.category_id,
        c.name as category_name,
        SUM(e.amount) as total_amount,
        COUNT(e.expense_id) as expense_count
      FROM expenses e
      LEFT JOIN categories c ON e.category_id = c.category_id
      WHERE e.user_id = $1
      ${startDate ? 'AND e.date >= $2' : ''}
      ${endDate ? 'AND e.date <= $3' : ''}
      GROUP BY c.category_id, c.name
      ORDER BY total_amount DESC
    `;
    
    const values = [userId];
    if (startDate) values.push(startDate);
    if (endDate) values.push(endDate);

    const { rows } = await db.query(query, values);
    return rows;
  },

  // Update an expense
  updateExpense: async (userId, expenseId, updates) => {
    const { category_id, amount, description, date } = updates;
    const query = `
      UPDATE expenses
      SET 
        category_id = COALESCE($3, category_id),
        amount = COALESCE($4, amount),
        description = COALESCE($5, description),
        date = COALESCE($6, date)
      WHERE expense_id = $1 AND user_id = $2
      RETURNING *
    `;
    const values = [expenseId, userId, category_id, amount, description, date];
    const { rows } = await db.query(query, values);
    return rows[0];
  },

  // Delete an expense
  deleteExpense: async (userId, expenseId) => {
    const query = `
      DELETE FROM expenses
      WHERE expense_id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await db.query(query, [expenseId, userId]);
    return rows[0];
  },

  // Truncate all expenses (for testing or reset)
  truncateExpenses: async () => {
    await db.query('TRUNCATE TABLE expenses RESTART IDENTITY CASCADE');
  }
};
```

## Step 4: Route Setup (`routes/expenses.js`)

```javascript
const express = require('express');
const router = express.Router();
const expenseQueries = require('../queries/expenses');
const { authenticate } = require('../utils/auth');

// Create a new expense
router.post('/', authenticate, async (req, res) => {
  try {
    const expense = await expenseQueries.createExpense(req.user.user_id, req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all expenses with optional filters
router.get('/', authenticate, async (req, res) => {
  try {
    const expenses = await expenseQueries.getExpenses(req.user.user_id, req.query);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense summary by category
router.get('/summary', authenticate, async (req, res) => {
  try {
    const summary = await expenseQueries.getExpenseSummaryByCategory(req.user.user_id, req.query);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an expense
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updated = await expenseQueries.updateExpense(
      req.user.user_id,
      req.params.id,
      req.body
    );
    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete an expense
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deleted = await expenseQueries.deleteExpense(req.user.user_id, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

## Step 5: Main Application File (`app.js`)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const expenseRoutes = require('./routes/expenses');
const { authenticate } = require('./utils/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', authenticate, categoryRoutes);
app.use('/api/expenses', authenticate, expenseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 6: Authentication Utilities (`utils/auth.js`)

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ user_id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { rows } = await db.query('SELECT * FROM users WHERE user_id = $1', [decoded.user_id]);
    
    if (!rows.length) {
      throw new Error('User not found');
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  authenticate
};
```

## Step 7: Environment Variables (`.env`)

```
DB_USER=your_db_username
DB_HOST=localhost
DB_NAME=expense_tracker
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Key Concepts Implemented

1. **Direct PostgreSQL Integration**: Using the `pg` library to interact with PostgreSQL without ORM
2. **Migrations**: SQL files for database schema setup
3. **Query Separation**: All SQL queries are separated in the `queries` directory
4. **Authentication**: JWT-based authentication with bcrypt password hashing
5. **Relational Data**: Proper foreign key relationships between users, categories, and expenses
6. **CRUD Operations**: Full CRUD for expenses with proper user ownership checks
7. **Complex Queries**: Examples of joins, filtering, and aggregation

## Running the Application

1. Start PostgreSQL server
2. Create the database and run migrations
3. Start the Node.js server:
```bash
nodemon app.js
```

This architecture gives you full control over your SQL queries while maintaining a clean, organized codebase. You can extend it by adding more features like reporting, recurring expenses, or budget tracking.
