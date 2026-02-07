// api/costos.js - API para manejo de costos
const { Client } = require('pg');

module.exports = async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

async function query(text, params) {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// GET - Obtener costos
async function handleGet(req, res) {
  const { fecha_inicio, fecha_fin } = req.query;

  try {
    let queryText = `
      SELECT id, item, valor, fecha, descripcion, categoria_costo, created_at
      FROM costos
      WHERE 1=1
    `;
    let params = [];

    if (fecha_inicio && fecha_fin) {
      queryText += ` AND fecha BETWEEN $1 AND $2`;
      params = [fecha_inicio, fecha_fin];
    }

    queryText += ` ORDER BY fecha DESC, created_at DESC`;

    const result = await query(queryText, params);

    // Calcular total
    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.valor || 0), 0);
    
    res.status(200).json({ 
      costos: result.rows,
      total: total,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error en handleGet:', error);
    throw error;
  }
}

// POST - Crear nuevo costo
async function handlePost(req, res) {
  const { item, valor, fecha, descripcion, categoria_costo } = req.body;

  if (!item || valor === undefined || !fecha) {
    return res.status(400).json({ error: 'Campos requeridos: item, valor, fecha' });
  }

  try {
    const insertQuery = `
      INSERT INTO costos (item, valor, fecha, descripcion, categoria_costo, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const params = [item, parseFloat(valor), fecha, descripcion, categoria_costo || 'otros'];
    const result = await query(insertQuery, params);

    res.status(201).json({ 
      message: 'Costo creado exitosamente',
      costo: result.rows[0]
    });
  } catch (error) {
    console.error('Error en handlePost:', error);
    throw error;
  }
}
