// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Inicializando Matilac v2.0.0...');
  
  // Verificar autenticación primero
  if (!authClient.isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a login...');
    window.location.href = 'login.html';
    return;
  }

  console.log('Usuario autenticado:', authClient.user);

  // Inicializar interfaz de usuario
  initializeUserInterface();
  
  // Verificar conexión a la base de datos
  await verificarConexionDB();
  
  // Cargar todas las secciones
  try {
    cargarSeccionInicio();
    if (typeof cargarSeccionPedidos === 'function') {
      cargarSeccionPedidos();
    } else {
      console.warn('cargarSeccionPedidos no está definida, cargando sección básica');
      cargarSeccionBasica('pedidos', '🛒 Pedidos', 'Gestión de pedidos en desarrollo...');
    }
    
    if (typeof cargarSeccionCostos === 'function') {
      cargarSeccionCostos();
    } else {
      console.warn('cargarSeccionCostos no está definida, cargando sección básica');
      cargarSeccionBasica('costos', '💰 Costos', 'Gestión de costos en desarrollo...');
    }
    
    if (typeof cargarSeccionInventario === 'function') {
      cargarSeccionInventario();
    } else {
      console.warn('cargarSeccionInventario no está definida, cargando sección básica');
      cargarSeccionBasica('inventario', '📦 Inventario', 'Gestión de inventario en desarrollo...');
    }
  } catch (error) {
    console.error('Error cargando secciones:', error);
  }
  
  // Mostrar sección inicial
  mostrarSeccion('inicio');
  
  // Actualizar fecha actual en el header
  actualizarFechaActual();
  
  // Configurar event listeners globales
  setupGlobalEventListeners();
});

// Inicializar interfaz de usuario
function initializeUserInterface() {
  // Actualizar información del usuario en el header
  const userName = authClient.getUserName();
  const userRole = authClient.getUserRole();
  
  document.getElementById('user-name').textContent = userName;
  document.getElementById('user-role').textContent = userRole;
  document.getElementById('menu-user-name').textContent = userName;
  document.getElementById('menu-user-role').textContent = userRole;

  // Configurar menu de usuario
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userMenu = document.getElementById('userMenu');
  const logoutBtn = document.getElementById('logoutBtn');

  // Toggle user menu
  userMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('hidden');
  });

  // Cerrar menu al hacer click fuera
  document.addEventListener('click', () => {
    userMenu.classList.add('hidden');
  });

  // Evitar cerrar menu al hacer click dentro
  userMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      await authClient.logout();
      window.location.href = 'login.html';
    }
  });

  console.log(`✅ Usuario autenticado: ${userName} (${userRole})`);
}

// Configurar event listeners globales
function setupGlobalEventListeners() {
  // Responsive sidebar
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024) {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
    }
  });

  // Listener para cambios de autenticación
  window.addEventListener('authStateChanged', (event) => {
    const { isAuthenticated } = event.detail;
    if (!isAuthenticated) {
      window.location.href = 'login.html';
    }
  });
}

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

// Función helper para cargar secciones básicas
function cargarSeccionBasica(seccion, titulo, mensaje) {
  const elemento = document.getElementById('seccion-' + seccion);
  if (elemento) {
    elemento.innerHTML = `
      <div class="container mx-auto p-6">
        <div class="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">${titulo}</h2>
          <p class="text-gray-600 mb-6">${mensaje}</p>
          <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <i class="fas fa-info-circle mr-2"></i>
            Funcionalidad en desarrollo
          </div>
        </div>
      </div>
    `;
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