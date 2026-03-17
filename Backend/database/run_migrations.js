import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function splitSQL(sql) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;

  const lines = sql.split('\n');

  for (let line of lines) {
    // Detect $$ start/end
    if (line.includes('$$')) {
      inDollarQuote = !inDollarQuote;
    }

    current += line + '\n';

    // Only split on ; if NOT inside $$ block
    if (!inDollarQuote && line.trim().endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function runMigrations() {
  try {
    const sqlFile = path.join(__dirname, 'quries.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Running SQL migrations...\n');

    const statements = splitSQL(sql);

    for (let i = 0; i < statements.length; i++) {
      console.log(`➡️ Executing statement ${i + 1}/${statements.length}`);
      await db.query(statements[i]);
    }

    console.log('\n✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Error running migrations:', err);
  } finally {
    process.exit(0);
  }
}

runMigrations();