-- Limpiar duplicados de admin y crear uno correcto
-- 1. Eliminar empleados existentes de admin
DELETE FROM empleados WHERE usuario = 'admin';

-- 2. Eliminar personas duplicadas (mantener solo la primera)
DELETE FROM personas WHERE email = 'admin@matilac.com' AND id > 1;

-- 3. Insertar admin correctamente
WITH admin_person AS (
  INSERT INTO personas (nombres, apellidos, cedula, telefono, email) 
  VALUES ('Admin', 'Sistema', '00000000', '0000000000', 'admin@matilac.com')
  ON CONFLICT (email) DO UPDATE SET 
    nombres = EXCLUDED.nombres,
    apellidos = EXCLUDED.apellidos
  RETURNING id
)
INSERT INTO empleados (persona_id, rol_id, usuario, password_hash, activo) 
VALUES (
  (SELECT id FROM admin_person), 
  1, 
  'admin', 
  '$2b$10$xKs1wQuryaspSUZ0omvqXuoIdrQcDN84s/6wQ4GLcfd8ejESfh3vC', 
  true
)
ON CONFLICT (usuario) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  activo = true;

-- Verificar que quedó solo un admin
SELECT 
  p.id, p.nombres, p.apellidos, p.email,
  e.usuario, e.activo
FROM personas p 
LEFT JOIN empleados e ON p.id = e.persona_id 
WHERE p.email = 'admin@matilac.com';
