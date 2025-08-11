import { Pool } from 'pg';
import 'dotenv/config'

const pool = new Pool({
  host: process.env.DB_HOST,          // e.g. db.<project_ref>.supabase.co 
  port: Number(process.env.DB_PORT),  // usually 5432
  database: process.env.DB_NAME,      // often 'postgres'
  user: process.env.DB_USER,          // e.g. 'postgres'
  password: process.env.DB_PASSWORD,  // your Supabase DB password
  ssl: { rejectUnauthorized: false },
  debug: process.env.DB_DEBUG === 'true', // set to true for debugging
  //connectionString: process.env.DATABASE_URL, // optional, if you prefer using a connection string
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 30000, // return an error after 2 seconds if connection could not be established
  poolMode: process.env.DB_POOL_MODE || 'transaction' // 'transaction' or 'session'
});

export default pool; 