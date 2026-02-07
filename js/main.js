// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
  // Agregar clase de loading al body mientras carga
  document.body.classList.add('loading');
  
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
      document.getElementById('sidebar-overlay').classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  
  // Añadir efecto de ripple a los botones
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      ripple.classList.add('ripple');
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  // Remover loading
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 300);
  
  // Service Worker para PWA (opcional)
  if ('serviceWorker' in navigator) {
    // Descomentar para habilitar PWA
    // navigator.serviceWorker.register('/sw.js');
  }
});

// Actualizar fecha en el header
function actualizarFechaActual() {
  const fecha = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaFormateada = fecha.toLocaleDateString('es-ES', opciones);
  const elemento = document.getElementById('current-date');
  if (elemento) {
    elemento.textContent = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
  }
}

// Formatear fecha para mostrar
function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  const d = new Date(fechaISO + 'T00:00:00');
  const opciones = { weekday: 'short', day: 'numeric', month: 'short' };
  return d.toLocaleDateString('es-CO', opciones);
}

// Función para detectar modo oscuro del sistema (para futuras mejoras)
function detectarModoOscuro() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Función utilitaria para debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para formatear números como moneda
function formatearMoneda(numero) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numero);
}

// Función para animación de conteo
function animarConteo(elemento, valorFinal, duracion = 1000) {
  const valorInicial = 0;
  const incremento = (valorFinal - valorInicial) / (duracion / 16);
  let valorActual = valorInicial;
  
  const timer = setInterval(() => {
    valorActual += incremento;
    if (valorActual >= valorFinal) {
      valorActual = valorFinal;
      clearInterval(timer);
    }
    elemento.textContent = Math.round(valorActual).toLocaleString();
  }, 16);
}

// Añadir estilos para ripple effect
const style = document.createElement('style');
style.textContent = `
  .btn-primary, .btn-secondary {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-effect 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple-effect {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  body.loading * {
    transition: none !important;
  }
`;
document.head.appendChild(style);