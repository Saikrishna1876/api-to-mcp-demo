import { Pool, PoolConfig } from "pg";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in the environment variables.");
}

console.log(DATABASE_URL);

const pool_config: PoolConfig = {
  connectionString: DATABASE_URL,
};

if (process.env.NODE_ENV == "production") {
  pool_config.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(pool_config);

export const clientPool = pool;
export const db = drizzle(pool);

export async function query(text: string, params: any[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
