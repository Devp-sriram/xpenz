import db from '../config/db.ts'

async function init() {
   
  try{

    await db.pool.connect();

    await db.query(`
      CREATE TABLE users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`
    )

    await db.query(`
      CREATE TABLE categories (
        category_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name)
      )
    `)

    await db.query(`
      CREATE TABLE expenses (
        expense_id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await db.query(`
      CREATE INDEX idx_expenses_user_id ON expenses(user_id);
      CREATE INDEX idx_expenses_date ON expenses(date);
      CREATE INDEX idx_categories_user_id ON categories(user_id);
    `)
    
    console.log("✅ Tables created successfully!");
  
  } catch (err) {
  
    console.error("❌ Error creating tables:", err);
  
  } finally {

    db.pool.end();
  }
}

init();
