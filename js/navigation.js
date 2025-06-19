// Funciones de navegación
function mostrarSeccion(id) {
  // Ocultar todas las secciones
  document.querySelectorAll(".seccion").forEach(s => s.style.display = "none");
  
  // Mostrar la sección seleccionada con animación
  const seccion = document.getElementById(id);
  seccion.style.display = "block";
  
  // Actualizar estilo del menú activo
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("activo"));
  document.getElementById("btn-" + id).classList.add("activo");
  
  // Actualizar título de la sección
  const titulos = {
    inicio: "Dashboard",
    pedidos: "Gestión de Pedidos",
    costos: "Control de Costos",
    inventario: "Inventario y Estadísticas"
  };
  document.getElementById("section-title").textContent = titulos[id] || "Inicio";
  
  // Cerrar sidebar en móvil
  if (window.innerWidth < 1024) {
    document.getElementById("sidebar").classList.add("-translate-x-full");
  }
  
  // Actualizar datos si es necesario
  if (id === "inventario") {
    actualizarInventario();
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("-translate-x-full");
}

// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  
  notification.className = `notification notification-${tipo} text-white px-6 py-4 rounded-lg shadow-lg mb-4 flex items-center gap-3`;
  notification.innerHTML = `
    <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${mensaje}</span>
  `;
  
  container.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}