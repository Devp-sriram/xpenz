import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
  throw new Error("❌ Missing DB_URL in environment variables");
}

// ✅ Cache the pool in globalThis to prevent creating new pools per request
let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: DB_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });

  global.pgPool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("❌ Error connecting to PostgreSQL:", err);
    } else {
      console.log("✅ Connected to PostgreSQL at:", res.rows[0].now);
    }
  });
}

pool = global.pgPool;

const query = (text, params) => pool.query(text, params);

export default {
  query,
  pool,
};
