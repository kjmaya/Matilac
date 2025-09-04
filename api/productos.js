// api/productos.js - API para manejo de productos
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

// GET - Obtener productos
async function handleGet(req, res) {
  const { id, categoria_id, incluir_variantes } = req.query;

  try {
    let queryText;
    let params = [];

    if (id) {
      // Obtener producto específico
      queryText = `
        SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = $1 AND p.activo = true
      `;
      params = [id];
    } else if (categoria_id) {
      // Obtener productos por categoría
      queryText = `
        SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.categoria_id = $1 AND p.activo = true
        ORDER BY p.nombre
      `;
      params = [categoria_id];
    } else {
      // Obtener todos los productos
      queryText = `
        SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
        FROM productos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = true
        ORDER BY c.nombre, p.nombre
      `;
    }

    const result = await query(queryText, params);
    let productos = result.rows;

    // Si se solicita incluir variantes
    if (incluir_variantes === 'true' && productos.length > 0) {
      const productosIds = productos.map(p => p.id);
      const variantesQuery = `
        SELECT * FROM variantes_producto 
        WHERE producto_id = ANY($1) AND activo = true
        ORDER BY tipo_variante, nombre
      `;
      const variantesResult = await query(variantesQuery, [productosIds]);
      
      // Agrupar variantes por producto
      productos = productos.map(producto => ({
        ...producto,
        variantes: variantesResult.rows.filter(v => v.producto_id === producto.id)
      }));
    }

    res.status(200).json({ productos });
  } catch (error) {
    throw error;
  }
}

// POST - Crear producto
async function handlePost(req, res) {
  const { nombre, descripcion, categoria_id, precio_base, imagen_url, variantes } = req.body;

  if (!nombre || !categoria_id || precio_base === undefined) {
    return res.status(400).json({ 
      error: 'Campos requeridos: nombre, categoria_id, precio_base' 
    });
  }

  try {
    // Insertar producto
    const productoQuery = `
      INSERT INTO productos (nombre, descripcion, categoria_id, precio_base, imagen_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const productoResult = await query(productoQuery, [
      nombre, descripcion, categoria_id, precio_base, imagen_url
    ]);
    
    const producto = productoResult.rows[0];

    // Si hay variantes, insertarlas
    if (variantes && variantes.length > 0) {
      for (const variante of variantes) {
        await query(
          `INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional)
           VALUES ($1, $2, $3, $4)`,
          [producto.id, variante.tipo_variante, variante.nombre, variante.precio_adicional || 0]
        );
      }
    }

    res.status(201).json({ 
      message: 'Producto creado exitosamente', 
      producto: producto 
    });
  } catch (error) {
    throw error;
  }
}

// PUT - Actualizar producto
async function handlePut(req, res) {
  const { id } = req.query;
  const { nombre, descripcion, categoria_id, precio_base, imagen_url, activo } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID del producto requerido' });
  }

  try {
    const updateQuery = `
      UPDATE productos 
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          categoria_id = COALESCE($3, categoria_id),
          precio_base = COALESCE($4, precio_base),
          imagen_url = COALESCE($5, imagen_url),
          activo = COALESCE($6, activo),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await query(updateQuery, [
      nombre, descripcion, categoria_id, precio_base, imagen_url, activo, id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ 
      message: 'Producto actualizado exitosamente', 
      producto: result.rows[0] 
    });
  } catch (error) {
    throw error;
  }
}

// DELETE - Eliminar producto (soft delete)
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID del producto requerido' });
  }

  try {
    const deleteQuery = `
      UPDATE productos 
      SET activo = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ 
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    throw error;
  }
}
