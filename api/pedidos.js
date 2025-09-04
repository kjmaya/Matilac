// api/pedidos.js - API para manejo de pedidos
import { query, transaction } from './db.js';

export default async function handler(req, res) {
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
}

// GET - Obtener pedidos
async function handleGet(req, res) {
  const { id, fecha, estado, cliente_id, incluir_detalles } = req.query;

  try {
    let queryText;
    let params = [];

    if (id) {
      // Obtener pedido específico
      queryText = `
        SELECT p.*, 
               CONCAT(per.nombres, ' ', per.apellidos) as cliente_nombre,
               c.codigo_cliente,
               CONCAT(emp_per.nombres, ' ', emp_per.apellidos) as empleado_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        LEFT JOIN personas per ON c.persona_id = per.id
        LEFT JOIN empleados emp ON p.empleado_id = emp.id
        LEFT JOIN personas emp_per ON emp.persona_id = emp_per.id
        WHERE p.id = $1
      `;
      params = [id];
    } else {
      // Construir query con filtros
      queryText = `
        SELECT p.*, 
               CONCAT(per.nombres, ' ', per.apellidos) as cliente_nombre,
               c.codigo_cliente,
               CONCAT(emp_per.nombres, ' ', emp_per.apellidos) as empleado_nombre
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        LEFT JOIN personas per ON c.persona_id = per.id
        LEFT JOIN empleados emp ON p.empleado_id = emp.id
        LEFT JOIN personas emp_per ON emp.persona_id = emp_per.id
        WHERE 1=1
      `;

      if (fecha) {
        queryText += ` AND p.fecha = $${params.length + 1}`;
        params.push(fecha);
      }

      if (estado) {
        queryText += ` AND p.estado = $${params.length + 1}`;
        params.push(estado);
      }

      if (cliente_id) {
        queryText += ` AND p.cliente_id = $${params.length + 1}`;
        params.push(cliente_id);
      }

      queryText += ` ORDER BY p.created_at DESC`;
    }

    const result = await query(queryText, params);
    let pedidos = result.rows;

    // Si se solicita incluir detalles
    if (incluir_detalles === 'true' && pedidos.length > 0) {
      const pedidosIds = pedidos.map(p => p.id);
      const detallesQuery = `
        SELECT dp.*, prod.nombre as producto_nombre
        FROM detalle_pedidos dp
        JOIN productos prod ON dp.producto_id = prod.id
        WHERE dp.pedido_id = ANY($1)
        ORDER BY dp.pedido_id, dp.id
      `;
      const detallesResult = await query(detallesQuery, [pedidosIds]);
      
      // Agrupar detalles por pedido
      pedidos = pedidos.map(pedido => ({
        ...pedido,
        detalles: detallesResult.rows.filter(d => d.pedido_id === pedido.id)
      }));
    }

    res.status(200).json({ pedidos });
  } catch (error) {
    throw error;
  }
}

// POST - Crear pedido
async function handlePost(req, res) {
  const { cliente_id, empleado_id, items, notas } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un item' });
  }

  try {
    const resultado = await transaction(async (client) => {
      // Generar número de pedido
      const numeroResult = await client.query(
        'SELECT valor FROM configuracion WHERE clave = $1',
        ['numero_pedido_siguiente']
      );
      const numeroPedido = numeroResult.rows[0]?.valor || '1';
      const numeroFormateado = `PED-${numeroPedido.padStart(6, '0')}`;

      // Calcular total
      let total = 0;
      const itemsConPrecio = [];

      for (const item of items) {
        const precioQuery = 'SELECT precio_base FROM productos WHERE id = $1';
        const precioResult = await client.query(precioQuery, [item.producto_id]);
        
        if (precioResult.rows.length === 0) {
          throw new Error(`Producto con ID ${item.producto_id} no encontrado`);
        }

        const precioBase = parseFloat(precioResult.rows[0].precio_base);
        const precioUnitario = precioBase + (item.precio_adicional || 0);
        const subtotal = precioUnitario * item.cantidad;
        total += subtotal;

        itemsConPrecio.push({
          ...item,
          precio_unitario: precioUnitario,
          subtotal: subtotal
        });
      }

      // Crear pedido
      const pedidoQuery = `
        INSERT INTO pedidos (numero_pedido, cliente_id, empleado_id, total, notas)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const pedidoResult = await client.query(pedidoQuery, [
        numeroFormateado, cliente_id, empleado_id, total, notas
      ]);
      const pedido = pedidoResult.rows[0];

      // Insertar detalles
      for (const item of itemsConPrecio) {
        await client.query(
          `INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario, subtotal, detalle_producto)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [pedido.id, item.producto_id, item.cantidad, item.precio_unitario, item.subtotal, item.detalle_producto]
        );
      }

      // Actualizar siguiente número de pedido
      await client.query(
        'UPDATE configuracion SET valor = $1 WHERE clave = $2',
        [(parseInt(numeroPedido) + 1).toString(), 'numero_pedido_siguiente']
      );

      return pedido;
    });

    res.status(201).json({ 
      message: 'Pedido creado exitosamente', 
      pedido: resultado 
    });
  } catch (error) {
    throw error;
  }
}

// PUT - Actualizar pedido
async function handlePut(req, res) {
  const { id } = req.query;
  const { estado, estado_pago, monto_pagado, fecha_pago, metodo_pago, notas } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID del pedido requerido' });
  }

  try {
    const updateQuery = `
      UPDATE pedidos 
      SET estado = COALESCE($1, estado),
          estado_pago = COALESCE($2, estado_pago),
          monto_pagado = COALESCE($3, monto_pagado),
          fecha_pago = COALESCE($4, fecha_pago),
          metodo_pago = COALESCE($5, metodo_pago),
          notas = COALESCE($6, notas),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await query(updateQuery, [
      estado, estado_pago, monto_pagado, fecha_pago, metodo_pago, notas, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({ 
      message: 'Pedido actualizado exitosamente', 
      pedido: result.rows[0] 
    });
  } catch (error) {
    throw error;
  }
}

// DELETE - Cancelar pedido
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID del pedido requerido' });
  }

  try {
    const updateQuery = `
      UPDATE pedidos 
      SET estado = 'cancelado', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(updateQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.status(200).json({ 
      message: 'Pedido cancelado exitosamente'
    });
  } catch (error) {
    throw error;
  }
}
