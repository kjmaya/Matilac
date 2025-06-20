// api/config.js - Función serverless corregida para Vercel
export default function handler(req, res) {
  // Agregar headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Debug: Log de variables de entorno (quitar en producción)
    console.log('GITHUB_TOKEN exists:', !!process.env.GITHUB_TOKEN);
    console.log('GITHUB_OWNER:', process.env.GITHUB_OWNER);
    console.log('GITHUB_REPO:', process.env.GITHUB_REPO);

    // Verificar que las variables de entorno existan
    if (!process.env.GITHUB_TOKEN) {
      return res.status(500).json({ 
        error: 'GITHUB_TOKEN not configured',
        debug: 'Check environment variables in Vercel'
      });
    }

    if (!process.env.GITHUB_OWNER) {
      return res.status(500).json({ 
        error: 'GITHUB_OWNER not configured',
        debug: 'Should be: kjmaya'
      });
    }

    if (!process.env.GITHUB_REPO) {
      return res.status(500).json({ 
        error: 'GITHUB_REPO not configured',
        debug: 'Should be: matilac-data'
      });
    }

    // Devolver configuración
    res.status(200).json({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      token: process.env.GITHUB_TOKEN,
      configured: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in config API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      debug: 'Check server logs'
    });
  }
}