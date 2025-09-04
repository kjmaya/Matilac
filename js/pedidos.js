// js/pedidos.js - Gestión de pedidos
function cargarSeccionPedidos() {
  console.log('Cargando sección de pedidos...');
  const elemento = document.getElementById('seccion-pedidos');
  
  if (!elemento) {
    console.error('Elemento seccion-pedidos no encontrado');
    return;
  }

  elemento.innerHTML = `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">📋 Gestión de Pedidos</h2>
          <p class="text-gray-600">Administra los pedidos de los clientes</p>
        </div>
        <button onclick="abrirModalNuevoPedido()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <i class="fas fa-plus"></i>
          Nuevo Pedido
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Pedidos Hoy</p>
              <p class="text-2xl font-bold text-gray-900" id="pedidos-hoy">0</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-shopping-cart text-blue-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">En Preparación</p>
              <p class="text-2xl font-bold text-gray-900" id="pedidos-preparacion">0</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-yellow-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Completados</p>
              <p class="text-2xl font-bold text-gray-900" id="pedidos-completados">0</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-check text-green-600"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Ingresos Hoy</p>
              <p class="text-2xl font-bold text-gray-900" id="ingresos-hoy">$0</p>
            </div>
            <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-dollar-sign text-pink-600"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Lista de Pedidos -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Pedidos Recientes</h3>
        </div>
        <div class="p-6" id="lista-pedidos">
          <div class="text-center py-8 text-gray-500">
            <i class="fas fa-inbox text-4xl mb-4"></i>
            <p>No hay pedidos registrados</p>
            <p class="text-sm">Los pedidos aparecerán aquí cuando se creen</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Cargar datos reales si hay conexión a DB
  cargarDatosPedidos();
}

async function cargarDatosPedidos() {
  try {
    // Aquí irían las llamadas reales a la API
    // Por ahora, datos de ejemplo
    console.log('Cargando datos de pedidos...');
    
    // Actualizar stats con datos reales cuando esté listo
    // document.getElementById('pedidos-hoy').textContent = data.pedidosHoy;
    
  } catch (error) {
    console.error('Error cargando pedidos:', error);
  }
}

function abrirModalNuevoPedido() {
  alert('Funcionalidad en desarrollo: Crear nuevo pedido');
}
