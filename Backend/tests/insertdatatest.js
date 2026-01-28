import pool from '../config/database.js';

async function testInsert() {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password, clerk_id) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (email) DO NOTHING
           RETURNING *`,
            ['Afif', 'afif1234@example.com', 'testing...123', 'afif_12345']
        );

        console.log("Successful");
        console.table(result.rows);

    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}

testInsert();