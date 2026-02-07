// api/login.js - Autenticación con JWT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET no configurado en el servidor' });
  }

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'GitHub no configurado en el servidor' });
  }

  const usersFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/users.json`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    // Leer usuarios desde matilac-data
    const getRes = await fetch(usersFileUrl, { headers });
    
    if (!getRes.ok) {
      if (getRes.status === 404) {
        return res.status(401).json({ error: 'No hay usuarios registrados' });
      }
      return res.status(500).json({ error: 'Error leyendo usuarios' });
    }

    const data = await getRes.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const users = JSON.parse(content);

    // Buscar usuario
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    // Generar JWT (expira en 7 días)
    const token = jwt.sign(
      { 
        username: user.username, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
