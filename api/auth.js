// api/auth.js - Sistema de autenticación
const { query, transaction } = require('./db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'matilac-default-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

module.exports = async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        if (req.url.endsWith('/login')) {
          await handleLogin(req, res);
        } else if (req.url.endsWith('/logout')) {
          await handleLogout(req, res);
        } else if (req.url.endsWith('/verify')) {
          await handleVerifyToken(req, res);
        } else {
          res.status(404).json({ error: 'Endpoint not found' });
        }
        break;
      case 'GET':
        if (req.url.endsWith('/me')) {
          await handleGetCurrentUser(req, res);
        } else {
          res.status(404).json({ error: 'Endpoint not found' });
        }
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

// POST /api/auth/login - Iniciar sesión
async function handleLogin(req, res) {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  try {
    // Buscar usuario en la base de datos
    const userQuery = `
      SELECT 
        e.id,
        e.usuario,
        e.password_hash,
        e.activo,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        r.nombre as rol_nombre,
        r.permisos
      FROM empleados e
      JOIN personas p ON e.persona_id = p.id
      LEFT JOIN roles r ON e.rol_id = r.id
      WHERE e.usuario = $1 AND e.activo = true
    `;
    
    const userResult = await query(userQuery, [usuario]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = userResult.rows[0];

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar JWT token
    const token = jwt.sign(
      { 
        empleado_id: user.id,
        usuario: user.usuario,
        rol: user.rol_nombre 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    // Crear sesión en la base de datos
    const sessionQuery = `
      INSERT INTO sesiones (empleado_id, token, fecha_expiracion, ip_address, user_agent)
      VALUES ($1, $2, NOW() + INTERVAL '24 hours', $3, $4)
      RETURNING id
    `;

    await query(sessionQuery, [
      user.id,
      token,
      req.headers['x-forwarded-for'] || req.connection.remoteAddress || null,
      req.headers['user-agent'] || null
    ]);

    // Respuesta exitosa (sin incluir password_hash)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST /api/auth/logout - Cerrar sesión
async function handleLogout(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.substring(7);

  try {
    // Desactivar sesión en la base de datos
    await query(
      'UPDATE sesiones SET activa = false WHERE token = $1',
      [token]
    );

    res.status(200).json({ success: true, message: 'Logout exitoso' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST /api/auth/verify - Verificar token
async function handleVerifyToken(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  try {
    // Verificar JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que la sesión esté activa en la base de datos
    const sessionQuery = `
      SELECT s.*, CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo
      FROM sesiones s
      JOIN empleados e ON s.empleado_id = e.id
      JOIN personas p ON e.persona_id = p.id
      WHERE s.token = $1 AND s.activa = true AND s.fecha_expiracion > NOW()
    `;

    const sessionResult = await query(sessionQuery, [token]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    res.status(200).json({ 
      success: true, 
      valid: true, 
      user: decoded,
      session: sessionResult.rows[0]
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ error: 'Token inválido' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ error: 'Token expirado' });
    } else {
      console.error('Token verification error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

// GET /api/auth/me - Obtener usuario actual
async function handleGetCurrentUser(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const userQuery = `
      SELECT 
        e.id,
        e.usuario,
        e.activo,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        p.email,
        r.nombre as rol_nombre,
        r.permisos
      FROM empleados e
      JOIN personas p ON e.persona_id = p.id
      LEFT JOIN roles r ON e.rol_id = r.id
      WHERE e.id = $1 AND e.activo = true
    `;
    
    const userResult = await query(userQuery, [decoded.empleado_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ user: userResult.rows[0] });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}
