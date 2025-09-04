// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Inicializando Matilac...');
  
  // Verificar conexión a la base de datos
  await verificarConexionDB();
  
  // Cargar todas las secciones
  cargarSeccionInicio();
  cargarSeccionPedidos();
  cargarSeccionCostos();
  cargarSeccionInventario();
  
  // Mostrar sección inicial
  mostrarSeccion('inicio');
  
  // Actualizar fecha actual en el header
  actualizarFechaActual();
  
  // Configurar event listeners globales
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
    }
  });
});

// Verificar conexión a la base de datos
async function verificarConexionDB() {
  try {
    const resultado = await dbClient.verificarConexion();
    
    if (resultado.database_configured) {
      console.log('✅ Conexión a base de datos establecida');
      mostrarNotificacion('Conectado a la base de datos', 'success');
    } else {
      console.error('❌ Error de conexión a base de datos:', resultado.error);
      mostrarNotificacion('Error de conexión a base de datos', 'error');
    }
  } catch (error) {
    console.error('❌ Error verificando conexión:', error);
    mostrarNotificacion('Error de conexión', 'error');
  }
}

// Actualizar fecha en el header
function actualizarFechaActual() {
  const fecha = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaElement = document.getElementById('current-date');
  if (fechaElement) {
    fechaElement.textContent = fecha.toLocaleDateString('es-ES', opciones);
  }
}