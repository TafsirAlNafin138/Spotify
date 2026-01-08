import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();


const {PGUSER, PGPASSWORD, PGHOST, PGDATABASE} = process.env;

const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`);

// Create a pool-like interface for compatibility
const pool = {
    query: async (text, params) => {
        return { rows: await sql(text, params || []) };
    },
    connect: async () => {
        return {
            query: async (text, params) => {
                return { rows: await sql(text, params || []) };
            },
            release: () => {},
            lastQuery: null
        };
    },
    end: async () => {
        console.log('Neon serverless connection closed');
    },
    on: () => {} // Neon serverless doesn't emit events
};

export const neonPool = sql;

// Test the database connection
pool.on('connect', () => {
  console.log('Connected to Neon PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

// Helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to get a client from the pool for transactions
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  //to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };

  client.release = () => {
    // Clear timeout
    clearTimeout(timeout);
    // Set the methods back to their old version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
};

// Transaction helper function
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection function
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as now');
    console.log('Database connection successful!');
    console.log('Server time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    // Check if users table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('Database tables not found. Please run the schema.sql file.');
      return false;
    }

    console.log('Database tables verified');
    return true;
  } catch (error) {
    console.error('Error checking database tables:', error.message);
    return false;
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log(' Database pool has ended');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closePool();
  process.exit(0);
});

// Export functions
export {
  query,
  pool,
  neonPool,
  getClient,
  transaction,
  testConnection,
  initializeTables,
  closePool
};

export default pool;

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Simple Query
const db = require('./config/database');

const getUsers = async () => {
  const result = await db.query('SELECT * FROM users LIMIT 10');
  return result.rows;
};

// Example 2: Query with Parameters (Prevents SQL Injection)
const getUserById = async (userId) => {
  const result = await db.query(
    'SELECT id, name, email FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
};

// Example 3: Insert Data
const createUser = async (name, email, password) => {
  const result = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password]
  );
  return result.rows[0];
};

// Example 4: Update Data
const updateUser = async (userId, name) => {
  const result = await db.query(
    'UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [name, userId]
  );
  return result.rows[0];
};

// Example 5: Delete Data
const deleteUser = async (userId) => {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
};

// Example 6: Using Transactions
const transferFollower = async (userId, fromArtistId, toArtistId) => {
  return await db.transaction(async (client) => {
    // Delete old follow
    await client.query(
      'DELETE FROM followers WHERE user_id = $1 AND artist_id = $2',
      [userId, fromArtistId]
    );
    
    // Add new follow
    await client.query(
      'INSERT INTO followers (user_id, artist_id) VALUES ($1, $2)',
      [userId, toArtistId]
    );
    
    return { success: true };
  });
};

// Example 7: Complex Join Query
const getTracksWithDetails = async (limit = 20) => {
  const result = await db.query(`
    SELECT 
      t.id,
      t.name as track_name,
      t.duration,
      t.path,
      a.name as album_name,
      a.image as album_image,
      ar.name as artist_name,
      ar.image as artist_image,
      COUNT(DISTINCT l.user_id) as like_count
    FROM tracks t
    LEFT JOIN albums a ON t.album_id = a.id
    LEFT JOIN artists ar ON a.artist_id = ar.id
    LEFT JOIN likes l ON t.id = l.track_id
    GROUP BY t.id, a.name, a.image, ar.name, ar.image
    ORDER BY like_count DESC
    LIMIT $1
  `, [limit]);
  
  return result.rows;
};

// Example 8: Search with ILIKE (Case-insensitive search)
const searchTracks = async (searchTerm) => {
  const result = await db.query(`
    SELECT t.*, a.name as album_name, ar.name as artist_name
    FROM tracks t
    LEFT JOIN albums a ON t.album_id = a.id
    LEFT JOIN artists ar ON a.artist_id = ar.id
    WHERE t.name ILIKE $1 OR ar.name ILIKE $1
    LIMIT 50
  `, [`%${searchTerm}%`]);
  
  return result.rows;
};

// Example 9: Pagination
const getTracksPaginated = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const result = await db.query(`
    SELECT * FROM tracks
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  
  const countResult = await db.query('SELECT COUNT(*) FROM tracks');
  const total = parseInt(countResult.rows[0].count);
  
  return {
    tracks: result.rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Example 10: Aggregation
const getUserStats = async (userId) => {
  const result = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM playlists WHERE user_id = $1) as playlist_count,
      (SELECT COUNT(*) FROM likes WHERE user_id = $1) as liked_tracks_count,
      (SELECT COUNT(*) FROM followers WHERE user_id = $1) as following_count
  `, [userId]);
  
  return result.rows[0];
};

// Example 11: Checking if record exists
const checkIfUserExists = async (email) => {
  const result = await db.query(
    'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)',
    [email]
  );
  return result.rows[0].exists;
};

// Example 12: Bulk Insert
const bulkInsertTracks = async (tracks) => {
  const values = tracks.map((_, index) => 
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  ).join(',');
  
  const params = tracks.flatMap(t => [t.album_id, t.name, t.duration]);
  
  const result = await db.query(`
    INSERT INTO tracks (album_id, name, duration)
    VALUES ${values}
    RETURNING *
  `, params);
  
  return result.rows;
};

*/