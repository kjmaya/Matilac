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
      SELECT id, fecha, categoria_costo, descripcion, valor, created_at
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
  const { fecha, categoria_costo, descripcion, valor } = req.body;

  if (!fecha || !categoria_costo || valor === undefined) {
    return res.status(400).json({ error: 'Campos requeridos: fecha, categoria_costo, valor' });
  }

  try {
    const insertQuery = `
      INSERT INTO costos (fecha, categoria_costo, descripcion, valor, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    
    const params = [fecha, categoria_costo, descripcion, parseFloat(valor)];
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
