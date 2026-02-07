-- Matilac Database Schema for Neon PostgreSQL
-- Execute this script in your Neon database

-- Tabla personas (base para empleados y clientes)
CREATE TABLE personas (
    id SERIAL PRIMARY KEY,
    nombres VARCHAR(200) NOT NULL,
    apellidos VARCHAR(200) NOT NULL,
    cedula VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    email VARCHAR(200),
    direccion TEXT,
    fecha_nacimiento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla roles para empleados
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla empleados
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER REFERENCES personas(id) ON DELETE CASCADE,
    rol_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    salario DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla categorías de productos
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE,
    precio_base DECIMAL(10,2),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla variantes de producto (sabores, tamaños, etc.)
CREATE TABLE variantes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    tipo_variante VARCHAR(50), -- 'sabor', 'tamaño', 'tipo'
    nombre VARCHAR(100) NOT NULL,
    precio_adicional DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    persona_id INTEGER REFERENCES personas(id) ON DELETE CASCADE,
    codigo_cliente VARCHAR(20) UNIQUE,
    tipo_cliente VARCHAR(50) DEFAULT 'regular',
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    limite_credito DECIMAL(10,2) DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'preparando', 'listo', 'entregado', 'cancelado'
    estado_pago VARCHAR(50) DEFAULT 'no_pagado', -- 'no_pagado', 'pagado_parcial', 'pagado_completo'
    monto_pagado DECIMAL(10,2) DEFAULT 0,
    fecha_pago DATE,
    metodo_pago VARCHAR(50),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla detalle de pedidos
CREATE TABLE detalle_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    detalle_producto TEXT, -- Para guardar variantes seleccionadas (sabor, tamaño, etc.)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla pagos
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL, -- 'efectivo', 'tarjeta', 'transferencia'
    fecha_pago DATE DEFAULT CURRENT_DATE,
    referencia VARCHAR(100),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla costos
CREATE TABLE costos (
    id SERIAL PRIMARY KEY,
    item VARCHAR(200) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    fecha DATE NOT NULL,
    descripcion TEXT,
    categoria_costo VARCHAR(100), -- 'materia_prima', 'servicios', 'salarios', 'otros'
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla sesiones para autenticación
CREATE TABLE sesiones (
    id SERIAL PRIMARY KEY,
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT
);

-- Tabla auditoria para seguimiento de cambios
CREATE TABLE auditoria (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    registro_id INTEGER NOT NULL,
    accion VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    empleado_id INTEGER REFERENCES empleados(id) ON DELETE SET NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla configuración para settings de la aplicación
CREATE TABLE configuracion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para optimizar consultas
CREATE INDEX idx_personas_cedula ON personas(cedula);
CREATE INDEX idx_empleados_usuario ON empleados(usuario);
CREATE INDEX idx_clientes_codigo ON clientes(codigo_cliente);
CREATE INDEX idx_pedidos_fecha ON pedidos(fecha);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_detalle_pedidos_pedido_id ON detalle_pedidos(pedido_id);
CREATE INDEX idx_costos_fecha ON costos(fecha);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha);

-- Funciones para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_empleados_updated_at BEFORE UPDATE ON empleados
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_costos_updated_at BEFORE UPDATE ON costos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
