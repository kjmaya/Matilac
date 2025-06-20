// api/config.js - Función serverless para obtener configuración
export default function handler(req, res) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar que las variables de entorno existan
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    return res.status(500).json({ error: 'Environment variables not configured' });
  }

  // Devolver configuración
  res.status(200).json({
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    token: process.env.GITHUB_TOKEN,
    configured: true
  });
}