const { query } = require('./api/db.js');

async function testDB() {
  try {
    console.log('Conectando a la base de datos...');
    const result = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('Tablas encontradas:', result.rows.map(r => r.table_name));
    
    // Verificar si existe la tabla empleados
    const empleados = await query("SELECT COUNT(*) FROM empleados");
    console.log('Cantidad de empleados:', empleados.rows[0].count);
    
  } catch (error) {
    console.error('Error de base de datos:', error.message);
    console.log('Necesitamos ejecutar el schema SQL');
  }
  process.exit(0);
}

testDB();
