// api/config.js - Devuelve configuración de GitHub desde variables de entorno de Vercel
module.exports = function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN;

    if (!owner || !repo || !token) {
      return res.status(500).json({ 
        error: 'GitHub config not set',
        missing: {
          GITHUB_OWNER: !owner,
          GITHUB_REPO: !repo,
          GITHUB_TOKEN: !token
        }
      });
    }

    res.status(200).json({ owner, repo, token });

  } catch (error) {
    console.error('Error in config API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}