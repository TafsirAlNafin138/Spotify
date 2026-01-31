import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ALWAYS load .env from project root
dotenv.config({
  path: path.resolve(__dirname, '../.env')
});

import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('DATABASE_URL loaded:', !!process.env.DATABASE_URL);

  await client.connect();
  const res = await client.query('SELECT 1');
  console.log('Connected:', res.rows);
} catch (err) {
  console.error('Connection failed:', err);
} finally {
  await client.end();
}
