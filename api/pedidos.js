// api/pedidos.js - API para manejo de pedidos
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
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
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

// GET - Obtener pedidos
async function handleGet(req, res) {
  try {
    // Obtener lista de pedidos
    const queryText = `
      SELECT 
        p.id,
        p.numero_pedido,
        p.fecha_pedido,
        p.fecha_entrega,
        p.estado,
        p.total,
        p.notas,
        CONCAT(per.nombres, ' ', per.apellidos) as cliente_nombre,
        per.telefono as cliente_telefono
      FROM pedidos p
      LEFT JOIN personas per ON p.cliente_id = per.id
      ORDER BY p.fecha_pedido DESC, p.id DESC
    `;

    const result = await query(queryText, []);

    res.status(200).json({ 
      pedidos: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error en handleGet:', error);
    throw error;
  }
}

// POST - Crear nuevo pedido
async function handlePost(req, res) {
  const { cliente, productos, fecha_entrega, notas } = req.body;

  if (!cliente || !productos || productos.length === 0) {
    return res.status(400).json({ error: 'Cliente y productos son requeridos' });
  }

  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    await client.query('BEGIN');

    // Crear o buscar cliente
    let clienteId;
    const clienteExistente = await client.query(
      'SELECT id FROM personas WHERE telefono = $1',
      [cliente.telefono]
    );

    if (clienteExistente.rows.length > 0) {
      clienteId = clienteExistente.rows[0].id;
      
      // Actualizar información del cliente
      await client.query(
        'UPDATE personas SET nombres = $1, apellidos = $2, direccion = $3, updated_at = NOW() WHERE id = $4',
        [cliente.nombres, cliente.apellidos, cliente.direccion, clienteId]
      );
    } else {
      // Crear nuevo cliente
      const nuevoCliente = await client.query(
        'INSERT INTO personas (nombres, apellidos, telefono, direccion, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
        [cliente.nombres, cliente.apellidos, cliente.telefono, cliente.direccion]
      );
      clienteId = nuevoCliente.rows[0].id;
    }

    // Generar número de pedido
    const numeroResult = await client.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM 4) AS INTEGER)), 0) + 1 as siguiente FROM pedidos WHERE numero_pedido LIKE \'PED%\''
    );
    const numeroPedido = `PED${numeroResult.rows[0].siguiente.toString().padStart(6, '0')}`;

    // Calcular total
    const total = productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);

    // Insertar pedido principal
    const pedidoQuery = `
      INSERT INTO pedidos (numero_pedido, cliente_id, fecha_pedido, fecha_entrega, estado, total, notas, created_at, updated_at)
      VALUES ($1, $2, CURRENT_DATE, $3, 'pendiente', $4, $5, NOW(), NOW())
      RETURNING *
    `;
    
    const pedidoResult = await client.query(pedidoQuery, [
      numeroPedido, clienteId, fecha_entrega, total, notas
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Pedido creado exitosamente',
      pedido: pedidoResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en handlePost:', error);
    throw error;
  } finally {
    await client.end();
  }
}
