// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
  // Cargar todas las secciones
  cargarSeccionInicio();
  cargarSeccionPedidos();
  cargarSeccionCostos();
  cargarSeccionInventario();
  
  // Mostrar sección inicial
  mostrarSeccion('inicio');
  
  // Actualizar tablas si hay datos existentes
  if (localStorage.getItem('pedidos')) {
    actualizarTablas();
  }
  
  if (localStorage.getItem('costos')) {
    actualizarCostos();
  }
  
  // Actualizar fecha actual en el header
  actualizarFechaActual();
  
  // Configurar event listeners globales
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
    }
  });
});

// Actualizar fecha en el header
function actualizarFechaActual() {
  const fecha = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('current-date').textContent = fecha.toLocaleDateString('es-ES', opciones);
}