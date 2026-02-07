// Funciones de navegación mejoradas
function mostrarSeccion(id) {
  // Ocultar todas las secciones con animación
  document.querySelectorAll(".seccion").forEach(s => {
    s.style.opacity = "0";
    setTimeout(() => s.style.display = "none", 200);
  });
  
  // Mostrar la sección seleccionada con animación
  setTimeout(() => {
    const seccion = document.getElementById(id);
    seccion.style.display = "block";
    requestAnimationFrame(() => {
      seccion.style.opacity = "1";
    });
  }, 200);
  
  // Actualizar estilo del menú activo con transición suave
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.remove("activo");
    btn.querySelector('div')?.classList.remove('shadow-md', 'scale-110');
  });
  
  const btnActivo = document.getElementById("btn-" + id);
  btnActivo.classList.add("activo");
  btnActivo.querySelector('div')?.classList.add('shadow-md', 'scale-110');
  
  // Actualizar título de la sección
  const titulos = {
    inicio: "Dashboard",
    pedidos: "Gestión de Pedidos",
    costos: "Control de Costos",
    inventario: "Inventario y Estadísticas",
    config: "Configuración de GitHub"
  };
  
  const tituloElement = document.getElementById("section-title");
  tituloElement.style.opacity = "0";
  setTimeout(() => {
    tituloElement.textContent = titulos[id] || "Inicio";
    tituloElement.style.opacity = "1";
  }, 150);
  
  // Cerrar sidebar en móvil
  if (window.innerWidth < 1024) {
    closeSidebar();
  }
  
  // Actualizar datos si es necesario
  if (id === "inventario") {
    actualizarInventario();
  }
  
  // Cargar sección de config
  if (id === "config" && typeof cargarSeccionConfig === 'function') {
    cargarSeccionConfig();
  }
  
  // Scroll al inicio suavemente
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuIcon = document.getElementById("menu-icon");
  
  const isOpen = !sidebar.classList.contains("-translate-x-full");
  
  if (isOpen) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuIcon = document.getElementById("menu-icon");
  
  sidebar.classList.remove("-translate-x-full");
  overlay?.classList.add("active");
  menuIcon?.classList.remove("fa-bars");
  menuIcon?.classList.add("fa-times");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const menuIcon = document.getElementById("menu-icon");
  
  sidebar.classList.add("-translate-x-full");
  overlay?.classList.remove("active");
  menuIcon?.classList.remove("fa-times");
  menuIcon?.classList.add("fa-bars");
  document.body.style.overflow = "";
}

// Mostrar notificación mejorada
function mostrarNotificacion(mensaje, tipo = 'success') {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  
  const iconos = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  
  notification.className = `notification notification-${tipo} text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 transform translate-x-full`;
  notification.innerHTML = `
    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
      <i class="fas ${iconos[tipo] || iconos.info} text-lg"></i>
    </div>
    <div class="flex-1">
      <p class="font-semibold">${tipo === 'success' ? '¡Éxito!' : tipo === 'error' ? 'Error' : 'Aviso'}</p>
      <p class="text-sm opacity-90">${mensaje}</p>
    </div>
    <button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white transition-colors">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  container.appendChild(notification);
  
  // Animación de entrada
  requestAnimationFrame(() => {
    notification.classList.remove('translate-x-full');
    notification.classList.add('translate-x-0');
  });
  
  // Auto-cerrar después de 4 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Cerrar sidebar al hacer click fuera en móvil
document.addEventListener('click', (e) => {
  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menu-btn");
  
  if (window.innerWidth < 1024 && 
      !sidebar.contains(e.target) && 
      !menuBtn.contains(e.target) &&
      !sidebar.classList.contains("-translate-x-full")) {
    closeSidebar();
  }
});

// Cerrar sidebar con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && window.innerWidth < 1024) {
    closeSidebar();
  }
});