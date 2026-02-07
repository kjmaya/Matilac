// api/test-db.js - Endpoint para probar la conexión a la base de datos
import { testConnection, query } from './db.js';

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Probar conexión básica
    const connectionTest = await testConnection();
    
    if (!connectionTest.success) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: connectionTest.error
      });
    }

    // Probar consultas básicas
    const tests = [];

    // Test 1: Verificar tablas principales
    try {
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      const tablesResult = await query(tablesQuery);
      tests.push({
        name: 'Tables exist',
        success: true,
        tables: tablesResult.rows.map(row => row.table_name)
      });
    } catch (error) {
      tests.push({
        name: 'Tables exist',
        success: false,
        error: error.message
      });
    }

    // Test 2: Verificar categorías
    try {
      const categoriasResult = await query('SELECT COUNT(*) as count FROM categorias');
      tests.push({
        name: 'Categories count',
        success: true,
        count: parseInt(categoriasResult.rows[0].count)
      });
    } catch (error) {
      tests.push({
        name: 'Categories count',
        success: false,
        error: error.message
      });
    }

    // Test 3: Verificar productos
    try {
      const productosResult = await query('SELECT COUNT(*) as count FROM productos');
      tests.push({
        name: 'Products count',
        success: true,
        count: parseInt(productosResult.rows[0].count)
      });
    } catch (error) {
      tests.push({
        name: 'Products count',
        success: false,
        error: error.message
      });
    }

    // Test 4: Verificar usuario admin
    try {
      const adminResult = await query('SELECT COUNT(*) as count FROM empleados WHERE usuario = $1', ['admin']);
      tests.push({
        name: 'Admin user exists',
        success: true,
        exists: parseInt(adminResult.rows[0].count) > 0
      });
    } catch (error) {
      tests.push({
        name: 'Admin user exists',
        success: false,
        error: error.message
      });
    }

    const allTestsPassed = tests.every(test => test.success);

    res.status(200).json({
      database_connection: connectionTest.success,
      database_info: connectionTest.data,
      tests: tests,
      all_tests_passed: allTestsPassed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      error: 'Database test failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
