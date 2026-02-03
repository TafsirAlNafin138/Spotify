import pool from '../config/database.js';

async function listTables() {
    try {
        console.log("Listing all tables in database...");
        const result = await pool.query(
            `SELECT table_name 
             FROM information_schema.tables 
             WHERE table_schema = 'public' 
             ORDER BY table_name;`
        );
        console.table(result.rows);
    } catch (err) {
        console.error("Error listing tables:", err);
    } finally {
        await pool.end();
    }
}

listTables();
