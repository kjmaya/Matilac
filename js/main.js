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
  cargarSeccionInicio();
  cargarSeccionPedidos();
  cargarSeccionCostos();
  cargarSeccionInventario();
  
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

// Actualizar fecha en el header
function actualizarFechaActual() {
  const fecha = new Date();
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaElement = document.getElementById('current-date');
  if (fechaElement) {
    fechaElement.textContent = fecha.toLocaleDateString('es-ES', opciones);
  }
}