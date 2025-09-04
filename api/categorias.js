// api/categorias.js - API para manejo de categorías
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

// GET - Obtener categorías
async function handleGet(req, res) {
  const { id, incluir_productos } = req.query;

  try {
    let queryText;
    let params = [];

    if (id) {
      queryText = 'SELECT * FROM categorias WHERE id = $1';
      params = [id];
    } else {
      queryText = 'SELECT * FROM categorias ORDER BY nombre';
    }

    const result = await query(queryText, params);
    let categorias = result.rows;

    // Si se solicita incluir productos
    if (incluir_productos === 'true' && categorias.length > 0) {
      const categoriasIds = categorias.map(c => c.id);
      const productosQuery = `
        SELECT * FROM productos 
        WHERE categoria_id = ANY($1) AND activo = true
        ORDER BY nombre
      `;
      const productosResult = await query(productosQuery, [categoriasIds]);
      
      // Agrupar productos por categoría
      categorias = categorias.map(categoria => ({
        ...categoria,
        productos: productosResult.rows.filter(p => p.categoria_id === categoria.id)
      }));
    }

    res.status(200).json({ categorias });
  } catch (error) {
    throw error;
  }
}

// POST - Crear categoría
async function handlePost(req, res) {
  const { nombre, descripcion, icono } = req.body;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es requerido' });
  }

  try {
    const insertQuery = `
      INSERT INTO categorias (nombre, descripcion, icono)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await query(insertQuery, [nombre, descripcion, icono]);

    res.status(201).json({ 
      message: 'Categoría creada exitosamente', 
      categoria: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    } else {
      throw error;
    }
  }
}

// PUT - Actualizar categoría
async function handlePut(req, res) {
  const { id } = req.query;
  const { nombre, descripcion, icono } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID de la categoría requerido' });
  }

  try {
    const updateQuery = `
      UPDATE categorias 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          icono = COALESCE($3, icono),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await query(updateQuery, [nombre, descripcion, icono, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({ 
      message: 'Categoría actualizada exitosamente', 
      categoria: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    } else {
      throw error;
    }
  }
}

// DELETE - Eliminar categoría
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de la categoría requerido' });
  }

  try {
    // Verificar si hay productos en esta categoría
    const productosResult = await query(
      'SELECT COUNT(*) as count FROM productos WHERE categoria_id = $1 AND activo = true',
      [id]
    );

    if (parseInt(productosResult.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }

    const deleteQuery = 'DELETE FROM categorias WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(200).json({ 
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    throw error;
  }
}
