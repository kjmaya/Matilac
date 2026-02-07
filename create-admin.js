const bcrypt = require('bcrypt');

async function createAdmin() {
  const password = 'Matilac2025!'; // Cambia esta contraseña por la que quieras
  console.log('Generando hash para contraseña:', password);
  
  const hash = await bcrypt.hash(password, 10);
  console.log('\n=== SQL QUERIES PARA INSERTAR ADMIN ===\n');
  
  console.log('-- 1. Insertar persona');
  console.log(`INSERT INTO personas (nombres, apellidos, cedula, telefono, email) 
VALUES ('Admin', 'Principal', '12345678', '3001234567', 'admin@matilac.com')
ON CONFLICT (email) DO NOTHING
RETURNING id;`);
  
  console.log('\n-- 2. Insertar empleado (usa el ID de la persona anterior)');
  console.log(`INSERT INTO empleados (persona_id, rol_id, usuario, password_hash, activo) 
VALUES (
  (SELECT id FROM personas WHERE email = 'admin@matilac.com'), 
  1, 
  'admin', 
  '${hash}', 
  true
)
ON CONFLICT (usuario) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  activo = true;`);
  
  console.log('\n=== CREDENCIALES ===');
  console.log('Usuario: admin');
  console.log('Email: admin@matilac.com');
  console.log('Contraseña:', password);
  console.log('\n=== QUERY TODO EN UNO ===');
  
  console.log(`-- Query completa para ejecutar en Neon SQL Editor
WITH persona_inserted AS (
  INSERT INTO personas (nombres, apellidos, cedula, telefono, email) 
  VALUES ('Admin', 'Principal', '12345678', '3001234567', 'admin@matilac.com')
  ON CONFLICT (email) DO UPDATE SET nombres = EXCLUDED.nombres
  RETURNING id
)
INSERT INTO empleados (persona_id, rol_id, usuario, password_hash, activo) 
VALUES (
  (SELECT id FROM persona_inserted), 
  1, 
  'admin', 
  '${hash}', 
  true
)
ON CONFLICT (usuario) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  activo = true;`);
  
  process.exit(0);
}

createAdmin().catch(console.error);
