// api/verify.js - Verificar token JWT
const jwt = require('jsonwebtoken');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado' });
  }

  // Obtener token del header o del body
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.status(200).json({
      valid: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Token expirado' });
    }
    return res.status(401).json({ valid: false, error: 'Token inválido' });
  }
};
