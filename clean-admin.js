// clean-admin.js - Ejecuta la limpieza de duplicados admin
const { Client } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_Cc7B8nSIjtKO@ep-patient-field-adc7pmyn-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";

async function cleanAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos');

    // 1. Eliminar empleados existentes de admin
    console.log('🧹 Eliminando empleados admin existentes...');
    await client.query('DELETE FROM empleados WHERE usuario = $1', ['admin']);

    // 2. Eliminar personas duplicadas (mantener solo la primera)
    console.log('🧹 Eliminando personas duplicadas...');
    await client.query('DELETE FROM personas WHERE email = $1 AND id > 1', ['admin@matilac.com']);

    // 3. Insertar admin correctamente
    console.log('👤 Creando admin correcto...');
    
    // Verificar si existe persona admin
    const existingPerson = await client.query(`
      SELECT id FROM personas WHERE email = 'admin@matilac.com' LIMIT 1
    `);
    
    let personId;
    if (existingPerson.rows.length > 0) {
      personId = existingPerson.rows[0].id;
      console.log('✅ Usando persona existente con ID:', personId);
    } else {
      // Insertar nueva persona
      const personResult = await client.query(`
        INSERT INTO personas (nombres, apellidos, cedula, telefono, email) 
        VALUES ('Admin', 'Sistema', '00000000', '0000000000', 'admin@matilac.com')
        RETURNING id
      `);
      personId = personResult.rows[0].id;
      console.log('✅ Persona nueva creada con ID:', personId);
    }
    
    // Insertar empleado
    await client.query(`
      INSERT INTO empleados (persona_id, rol_id, usuario, password_hash, activo) 
      VALUES ($1, 1, 'admin', '$2b$10$xKs1wQuryaspSUZ0omvqXuoIdrQcDN84s/6wQ4GLcfd8ejESfh3vC', true)
    `, [personId]);

    // 4. Verificar resultado
    console.log('🔍 Verificando resultado...');
    const result = await client.query(`
      SELECT 
        p.id, p.nombres, p.apellidos, p.email,
        e.usuario, e.activo
      FROM personas p 
      LEFT JOIN empleados e ON p.id = e.persona_id 
      WHERE p.email = 'admin@matilac.com'
    `);

    console.log('\n=== RESULTADO ===');
    console.table(result.rows);
    
    console.log('\n✅ Limpieza completada');
    console.log('🔑 Credenciales: admin / Matilac2025!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

cleanAdmin();
