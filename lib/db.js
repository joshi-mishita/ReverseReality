import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } catch (err) {
    console.error("DB ERROR:", err);
    throw err;
  } finally {
    client.release();
  }
}