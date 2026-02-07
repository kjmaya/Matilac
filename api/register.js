// api/register.js - Registrar usuario con contraseña hasheada en matilac-data
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password, adminKey } = req.body;

  // Clave de admin para evitar que cualquiera cree cuentas
  if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'matilac_admin_2025') {
    return res.status(403).json({ error: 'No autorizado para crear cuentas' });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return res.status(500).json({ error: 'GitHub no configurado en el servidor' });
  }

  const usersFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/users.json`;
  const headers = {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    // Leer archivo de usuarios existente
    let users = [];
    let sha = null;

    const getRes = await fetch(usersFileUrl, { headers });
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      users = JSON.parse(content);
    }

    // Verificar que el usuario no exista
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Agregar usuario
    users.push({
      username: username.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      role: users.length === 0 ? 'admin' : 'user'
    });

    // Guardar en GitHub
    const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
    const putBody = {
      message: `Nuevo usuario: ${username}`,
      content: content
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(usersFileUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody)
    });

    if (putRes.ok) {
      return res.status(201).json({ 
        success: true, 
        message: `Usuario "${username}" creado exitosamente`,
        role: users[users.length - 1].role
      });
    } else {
      const err = await putRes.json();
      return res.status(500).json({ error: 'Error guardando en GitHub', details: err });
    }

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
