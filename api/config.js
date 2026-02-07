// api/config.js - Configuración de la base de datos Neon PostgreSQL
module.exports = function handler(req, res) {
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
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    // Verificar que las variables de entorno existan
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ 
        error: 'DATABASE_URL not configured',
        debug: 'Check environment variables in Vercel. Should contain Neon PostgreSQL connection string'
      });
    }

    // Devolver configuración (sin exponer la URL completa por seguridad)
    res.status(200).json({
      database_configured: true,
      database_type: 'postgresql',
      provider: 'neon',
      timestamp: new Date().toISOString(),
      status: 'ready'
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