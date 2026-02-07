-- Datos iniciales para Matilac
-- Ejecutar después del schema.sql

-- Insertar categorías iniciales
INSERT INTO categorias (nombre, descripcion, icono) VALUES
('Lácteos', 'Productos lácteos frescos y naturales', '🥛'),
('Panadería', 'Productos de panadería artesanal', '🥖'),
('Otros', 'Otros productos alimenticios', '🍯');

-- Insertar productos base
INSERT INTO productos (nombre, descripcion, categoria_id, precio_base, imagen_url, activo) VALUES
-- Lácteos
('Yogurt', 'Natural y de sabores, casero, cremoso y delicioso', 
 (SELECT id FROM categorias WHERE nombre = 'Lácteos'), 
 10000, 
 'https://st2.depositphotos.com/3833507/7122/i/450/depositphotos_71220963-stock-photo-tasty-strawberry-yogurt.jpg', 
 true),

('Pulpa de avena', 'Pulpa de avena fresca y natural', 
 (SELECT id FROM categorias WHERE nombre = 'Lácteos'), 
 8000, 
 null, 
 true),

('Queso', 'Queso fresco artesanal de diferentes tipos', 
 (SELECT id FROM categorias WHERE nombre = 'Lácteos'), 
 13000, 
 null, 
 true),

-- Panadería
('Envueltos', 'Envueltos tradicionales hechos a mano', 
 (SELECT id FROM categorias WHERE nombre = 'Panadería'), 
 2000, 
 null, 
 true),

('Almojábanas', 'Almojábanas frescas del día', 
 (SELECT id FROM categorias WHERE nombre = 'Panadería'), 
 2500, 
 null, 
 true),

('Arepas', 'Arepas tradicionales boyacenses y de chocolo', 
 (SELECT id FROM categorias WHERE nombre = 'Panadería'), 
 4000, 
 'https://www.elespectador.com/resizer/v2/MMSF4T4WD5HFLIZBHYYDXIBWZQ.jpg?auth=364bf9108ea2fcbc7b9562a38d8ca6e803b48a0943b1ce5cb5ce398bcaba3d9b&width=1110&height=739&smart=true&quality=60', 
 true),

-- Otros
('Rellenas', 'Morcillas rellenas tradicionales', 
 (SELECT id FROM categorias WHERE nombre = 'Otros'), 
 2500, 
 null, 
 true),

('Panela', 'Panela artesanal en bloques', 
 (SELECT id FROM categorias WHERE nombre = 'Otros'), 
 30000, 
 null, 
 true),

('Huevos', 'Huevos frescos de granja', 
 (SELECT id FROM categorias WHERE nombre = 'Otros'), 
 15000, 
 null, 
 true),

('Longaniza', 'Longaniza artesanal', 
 (SELECT id FROM categorias WHERE nombre = 'Otros'), 
 7000, 
 null, 
 true);

-- Insertar variantes de productos
-- Variantes de Yogurt (sabores)
INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional) VALUES
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'sabor', 'Durazno', 0),
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'sabor', 'Fresa', 0),
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'sabor', 'Mora', 0),
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'sabor', 'Guanábana', 0),
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'sabor', 'Feijoa', 0);

-- Variantes de Yogurt (tamaños)
INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional) VALUES
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'tamaño', '1L', 0),
((SELECT id FROM productos WHERE nombre = 'Yogurt'), 'tamaño', '2L', 8000);

-- Variantes de Queso (tipos)
INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional) VALUES
((SELECT id FROM productos WHERE nombre = 'Queso'), 'tipo', 'Campesino', 0),
((SELECT id FROM productos WHERE nombre = 'Queso'), 'tipo', 'Doble Crema', 0),
((SELECT id FROM productos WHERE nombre = 'Queso'), 'tipo', 'Pera', 0);

-- Variantes de Arepas (tipos)
INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional) VALUES
((SELECT id FROM productos WHERE nombre = 'Arepas'), 'tipo', 'Boyacense', 0),
((SELECT id FROM productos WHERE nombre = 'Arepas'), 'tipo', 'de Chocolo', 1000);

-- Variantes de Envueltos (tipos)
INSERT INTO variantes_producto (producto_id, tipo_variante, nombre, precio_adicional) VALUES
((SELECT id FROM productos WHERE nombre = 'Envueltos'), 'tipo', 'Normal', 0),
((SELECT id FROM productos WHERE nombre = 'Envueltos'), 'tipo', 'Especial', 1500);

-- Insertar roles iniciales
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso completo al sistema', 
 '{"pedidos": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}, 
   "productos": {"crear": true, "leer": true, "actualizar": true, "eliminar": true}, 
   "clientes": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
   "empleados": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
   "costos": {"crear": true, "leer": true, "actualizar": true, "eliminar": true},
   "reportes": {"ver": true}}'),

('Vendedor', 'Manejo de pedidos y clientes', 
 '{"pedidos": {"crear": true, "leer": true, "actualizar": true, "eliminar": false}, 
   "productos": {"crear": false, "leer": true, "actualizar": false, "eliminar": false}, 
   "clientes": {"crear": true, "leer": true, "actualizar": true, "eliminar": false},
   "empleados": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
   "costos": {"crear": false, "leer": false, "actualizar": false, "eliminar": false},
   "reportes": {"ver": false}}');

-- Insertar configuración inicial
INSERT INTO configuracion (clave, valor, descripcion) VALUES
('nombre_empresa', 'Matilac', 'Nombre de la empresa'),
('direccion_empresa', '', 'Dirección de la empresa'),
('telefono_empresa', '', 'Teléfono de contacto'),
('email_empresa', '', 'Email de contacto'),
('moneda', 'COP', 'Moneda utilizada'),
('iva_porcentaje', '0', 'Porcentaje de IVA'),
('mensaje_pedido', 'Gracias por tu pedido', 'Mensaje mostrado en los pedidos'),
('numero_pedido_siguiente', '1', 'Próximo número de pedido a generar'),
('backup_automatico', 'true', 'Realizar backup automático de datos');

-- Crear usuario administrador por defecto
-- Nota: La contraseña 'admin123' debe ser hasheada en la aplicación
INSERT INTO personas (nombres, apellidos, cedula, telefono, email) VALUES
('Administrador', 'Sistema', '00000000', '', 'admin@matilac.com');

INSERT INTO empleados (persona_id, rol_id, usuario, password_hash, activo, salario) VALUES
((SELECT id FROM personas WHERE cedula = '00000000'),
 (SELECT id FROM roles WHERE nombre = 'Administrador'),
 'admin',
 '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
 true,
 0.00);
