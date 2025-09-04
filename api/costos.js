// api/costos.js - API para manejo de costos
import { query } from './db.js';

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

// GET - Obtener costos
async function handleGet(req, res) {
  const { id, fecha_inicio, fecha_fin, categoria_costo, mes, ano } = req.query;

  try {
    let queryText;
    let params = [];

    if (id) {
      queryText = `
        SELECT c.*, CONCAT(per.nombres, ' ', per.apellidos) as empleado_nombre
        FROM costos c
        LEFT JOIN empleados emp ON c.empleado_id = emp.id
        LEFT JOIN personas per ON emp.persona_id = per.id
        WHERE c.id = $1
      `;
      params = [id];
    } else {
      queryText = `
        SELECT c.*, CONCAT(per.nombres, ' ', per.apellidos) as empleado_nombre
        FROM costos c
        LEFT JOIN empleados emp ON c.empleado_id = emp.id
        LEFT JOIN personas per ON emp.persona_id = per.id
        WHERE 1=1
      `;

      if (fecha_inicio && fecha_fin) {
        queryText += ` AND c.fecha BETWEEN $${params.length + 1} AND $${params.length + 2}`;
        params.push(fecha_inicio, fecha_fin);
      } else if (mes && ano) {
        queryText += ` AND EXTRACT(MONTH FROM c.fecha) = $${params.length + 1} AND EXTRACT(YEAR FROM c.fecha) = $${params.length + 2}`;
        params.push(mes, ano);
      }

      if (categoria_costo) {
        queryText += ` AND c.categoria_costo = $${params.length + 1}`;
        params.push(categoria_costo);
      }

      queryText += ` ORDER BY c.fecha DESC, c.created_at DESC`;
    }

    const result = await query(queryText, params);

    // Si es una consulta de rango, agregar totales
    if (!id && result.rows.length > 0) {
      const totalQuery = `
        SELECT 
          SUM(valor) as total_general,
          categoria_costo,
          SUM(valor) as total_categoria
        FROM costos c
        WHERE 1=1
        ${fecha_inicio && fecha_fin ? `AND fecha BETWEEN $1 AND $2` : ''}
        ${mes && ano ? `AND EXTRACT(MONTH FROM fecha) = $1 AND EXTRACT(YEAR FROM fecha) = $2` : ''}
        ${categoria_costo ? `AND categoria_costo = $${params.length}` : ''}
        GROUP BY categoria_costo
        ORDER BY total_categoria DESC
      `;

      const totalResult = await query(totalQuery, fecha_inicio && fecha_fin ? [fecha_inicio, fecha_fin] : (mes && ano ? [mes, ano] : []));
      
      res.status(200).json({ 
        costos: result.rows,
        resumen: {
          total_general: totalResult.rows.reduce((sum, row) => sum + parseFloat(row.total_categoria), 0),
          por_categoria: totalResult.rows
        }
      });
    } else {
      res.status(200).json({ costos: result.rows });
    }
  } catch (error) {
    throw error;
  }
}

// POST - Crear costo
async function handlePost(req, res) {
  const { item, valor, fecha, descripcion, categoria_costo, empleado_id } = req.body;

  if (!item || valor === undefined || !fecha) {
    return res.status(400).json({ 
      error: 'Campos requeridos: item, valor, fecha' 
    });
  }

  if (valor <= 0) {
    return res.status(400).json({ error: 'El valor debe ser mayor a 0' });
  }

  try {
    const insertQuery = `
      INSERT INTO costos (item, valor, fecha, descripcion, categoria_costo, empleado_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await query(insertQuery, [
      item, valor, fecha, descripcion, categoria_costo, empleado_id
    ]);

    res.status(201).json({ 
      message: 'Costo registrado exitosamente', 
      costo: result.rows[0] 
    });
  } catch (error) {
    throw error;
  }
}

// PUT - Actualizar costo
async function handlePut(req, res) {
  const { id } = req.query;
  const { item, valor, fecha, descripcion, categoria_costo } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID del costo requerido' });
  }

  if (valor !== undefined && valor <= 0) {
    return res.status(400).json({ error: 'El valor debe ser mayor a 0' });
  }

  try {
    const updateQuery = `
      UPDATE costos 
      SET item = COALESCE($1, item),
          valor = COALESCE($2, valor),
          fecha = COALESCE($3, fecha),
          descripcion = COALESCE($4, descripcion),
          categoria_costo = COALESCE($5, categoria_costo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await query(updateQuery, [
      item, valor, fecha, descripcion, categoria_costo, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Costo no encontrado' });
    }

    res.status(200).json({ 
      message: 'Costo actualizado exitosamente', 
      costo: result.rows[0] 
    });
  } catch (error) {
    throw error;
  }
}

// DELETE - Eliminar costo
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID del costo requerido' });
  }

  try {
    const deleteQuery = 'DELETE FROM costos WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Costo no encontrado' });
    }

    res.status(200).json({ 
      message: 'Costo eliminado exitosamente'
    });
  } catch (error) {
    throw error;
  }
}
