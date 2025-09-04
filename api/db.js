// api/db.js - Utilidad para conexión a la base de datos Neon PostgreSQL
const { Pool } = require('pg');

// Configuración del pool de conexiones
let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20, // Máximo 20 conexiones en el pool
      idleTimeoutMillis: 30000, // Cerrar conexiones idle después de 30 segundos
      connectionTimeoutMillis: 2000, // Timeout para obtener conexión del pool
    });

    // Event handlers para debugging
    pool.on('connect', () => {
      console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  
  return pool;
}

// Función para ejecutar queries
async function query(text, params = []) {
  const client = getPool();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Función para transacciones
async function transaction(callback) {
  const client = await getPool().connect();
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
}

// Función para cerrar el pool (útil en testing)
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Función para verificar la conexión
async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    return {
      success: true,
      data: result.rows[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { query, transaction, closePool, testConnection };
