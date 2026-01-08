// database.js
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Execute schema on first connection (optional, for development)
const initializeDatabase = async () => {
    try {
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('Database schema initialized');
    } catch (error) {
        console.error('Schema initialization error:', error);
    }
};

// Uncomment to run on startup
// initializeDatabase();

module.exports = { pool, initializeDatabase };
