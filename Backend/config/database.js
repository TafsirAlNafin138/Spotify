import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;
import { neon } from '@neondatabase/serverless';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// The Pool is better for long-running apps than the 'neon' HTTP client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
});

// Test connection on startup
pool.on('connect', () => {
  console.log(' Connected to Neon DB');
});

pool.on('error', (err) => {
  console.error(' Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

