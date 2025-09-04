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
      <div class="flex items-center justify-b      </p>
      <p class="text-sm text-gray-600 mb-2">
        📞 ${pedido.cliente_telefono || 'No especificado'}
      </p>
      <p class="text-sm text-gray-600 mb-2">
        📋 ${pedido.numero_pedido || 'N/A'}
      </p>
      <div class="flex items-center justify-between"><p class="text-sm text-gray-600 mb-2">
        📋 ${pedido.numero_pedido || 'N/A'}
      </p>n mb-6">
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
    console.log('Cargando datos de pedidos...');
    
    const response = await fetch('/api/pedidos');
    if (!response.ok) {
        throw new Error('Error al cargar pedidos');
    }
    
    const result = await response.json();
    console.log('✅ Pedidos cargados desde base de datos:', result);
    
    const pedidos = result.pedidos || [];
    actualizarTablaPedidos(pedidos, false); // false = desde DB
    
  } catch (error) {
    console.error('Error cargando pedidos desde API, usando localStorage:', error);
    
    // Fallback a localStorage
    const pedidosLocal = JSON.parse(localStorage.getItem('pedidos') || '[]');
    console.log('💾 Pedidos cargados desde localStorage:', pedidosLocal);
    actualizarTablaPedidos(pedidosLocal, true); // true = desde localStorage
  }
}

function abrirModalNuevoPedido() {
  // Crear el modal
  const modalHTML = `
    <div id="modal-nuevo-pedido" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 mx-auto">
        <!-- Header Fijo -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-lg z-10">
          <h3 class="text-lg font-medium text-gray-900">🛒 Nuevo Pedido</h3>
          <button onclick="cerrarModalNuevoPedido()" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Body con Scroll -->
        <div class="max-h-[70vh] overflow-y-auto">
          <form id="form-nuevo-pedido" class="p-6">
            <!-- Información del Cliente -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-800 mb-3 flex items-center">
                <i class="fas fa-user text-pink-500 mr-2"></i>
                Información del Cliente
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente *</label>
                <input type="text" id="cliente-nombre" required 
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                       placeholder="Ej: María García">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" id="cliente-telefono" 
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                       placeholder="Ej: 300 123 4567">
              </div>
            </div>
          </div>

          <!-- Productos del Pedido -->
          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-md font-medium text-gray-800 flex items-center">
                <i class="fas fa-shopping-bag text-pink-500 mr-2"></i>
                Productos
              </h4>
              <button type="button" onclick="agregarProductoPedido()" 
                      class="bg-pink-100 hover:bg-pink-200 text-pink-600 px-3 py-1 rounded text-sm transition-colors">
                <i class="fas fa-plus mr-1"></i> Agregar Producto
              </button>
            </div>
            <div id="productos-pedido" class="space-y-3">
              <!-- Productos se agregan dinámicamente -->
            </div>
          </div>

          <!-- Información de Entrega -->
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-800 mb-3 flex items-center">
              <i class="fas fa-truck text-pink-500 mr-2"></i>
              Información de Entrega
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega *</label>
                <input type="date" id="fecha-entrega" required 
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega</label>
                <input type="time" id="hora-entrega" 
                       class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200">
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Dirección de Entrega</label>
              <textarea id="direccion-entrega" rows="2" 
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                        placeholder="Dirección completa de entrega"></textarea>
            </div>
          </div>
            <button type="button" onclick="cerrarModalNuevoPedido()" 
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" 
                    class="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg transition-colors">
              <i class="fas fa-save mr-2"></i>Crear Pedido
            </button>
            </div>
          </form>
        </div>
        
        <!-- Footer Fijo con Total y Botones -->
        <div class="border-t border-gray-200 p-6 bg-white rounded-b-lg sticky bottom-0">
          <!-- Total -->
          <div class="mb-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <span class="text-lg font-medium text-gray-800 flex items-center">
                <i class="fas fa-calculator text-pink-500 mr-2"></i>
                Total del Pedido:
              </span>
              <span id="total-pedido" class="text-2xl font-bold text-pink-600">$0</span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3">
            <button type="button" onclick="cerrarModalNuevoPedido()" 
                    class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg transition-colors font-medium">
              <i class="fas fa-times mr-2"></i>Cancelar
            </button>
            <button onclick="document.getElementById('form-nuevo-pedido').requestSubmit()" 
                    class="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all transform hover:scale-105 font-medium shadow-lg">
              <i class="fas fa-save mr-2"></i>Crear Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Agregar modal al DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Prevenir scroll del body cuando el modal está abierto
  document.body.style.overflow = 'hidden';
  
  // Configurar fecha mínima (hoy)
  const fechaEntrega = document.getElementById('fecha-entrega');
  const hoy = new Date().toISOString().split('T')[0];
  fechaEntrega.value = hoy;
  fechaEntrega.min = hoy;

  // Agregar primer producto automáticamente
  agregarProductoPedido();

  // Configurar manejo del formulario
  document.getElementById('form-nuevo-pedido').addEventListener('submit', guardarNuevoPedido);
  
  // Cerrar modal con ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarModalNuevoPedido();
    }
  });
}

function cerrarModalNuevoPedido() {
  const modal = document.getElementById('modal-nuevo-pedido');
  if (modal) {
    modal.remove();
  }
  
  // Restaurar scroll del body
  document.body.style.overflow = '';
}

let contadorProductos = 0;

function agregarProductoPedido() {
  contadorProductos++;
  const contenedor = document.getElementById('productos-pedido');
  
  const productoHTML = `
    <div class="flex gap-3 items-end bg-gray-50 p-3 rounded-lg" id="producto-${contadorProductos}">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Producto</label>
        <input type="text" name="producto-nombre" required 
               class="w-full border border-gray-300 rounded px-3 py-2 focus:border-pink-500 focus:ring-1 focus:ring-pink-200"
               placeholder="Ej: Torta de chocolate">
      </div>
      <div class="w-24">
        <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
        <input type="number" name="producto-cantidad" min="1" value="1" required 
               class="w-full border border-gray-300 rounded px-3 py-2 focus:border-pink-500 focus:ring-1 focus:ring-pink-200"
               onchange="calcularTotalPedido()">
      </div>
      <div class="w-32">
        <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unit.</label>
        <input type="number" name="producto-precio" min="0" step="0.01" required 
               class="w-full border border-gray-300 rounded px-3 py-2 focus:border-pink-500 focus:ring-1 focus:ring-pink-200"
               placeholder="0.00" onchange="calcularTotalPedido()">
      </div>
      <button type="button" onclick="eliminarProductoPedido(${contadorProductos})" 
              class="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  contenedor.insertAdjacentHTML('beforeend', productoHTML);
  calcularTotalPedido();
}

function eliminarProductoPedido(id) {
  const producto = document.getElementById(`producto-${id}`);
  if (producto) {
    producto.remove();
    calcularTotalPedido();
  }
}

function calcularTotalPedido() {
  const productos = document.querySelectorAll('#productos-pedido > div');
  let total = 0;
  
  productos.forEach(producto => {
    const cantidad = parseFloat(producto.querySelector('[name="producto-cantidad"]').value) || 0;
    const precio = parseFloat(producto.querySelector('[name="producto-precio"]').value) || 0;
    total += cantidad * precio;
  });
  
  document.getElementById('total-pedido').textContent = `$${total.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
}

async function guardarNuevoPedido(event) {
  event.preventDefault();
  
  // Recopilar datos del formulario
  const cliente = {
    nombres: document.getElementById('cliente-nombre').value.split(' ')[0] || '',
    apellidos: document.getElementById('cliente-nombre').value.split(' ').slice(1).join(' ') || '',
    telefono: document.getElementById('cliente-telefono').value,
    direccion: document.getElementById('direccion-entrega').value
  };
  
  const productos = [];
  document.querySelectorAll('#productos-pedido > div').forEach(div => {
    const nombre = div.querySelector('[name="producto-nombre"]').value;
    const cantidad = parseInt(div.querySelector('[name="producto-cantidad"]').value);
    const precio = parseFloat(div.querySelector('[name="producto-precio"]').value);
    
    if (nombre && cantidad && precio) {
      productos.push({ nombre, cantidad, precio, subtotal: cantidad * precio });
    }
  });
  
  const fechaEntrega = document.getElementById('fecha-entrega').value;
  const horaEntrega = document.getElementById('hora-entrega').value;
  const notas = `Hora de entrega: ${horaEntrega}`;
  
  if (!cliente.nombres || !cliente.telefono || productos.length === 0 || !fechaEntrega) {
    mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
    return;
  }
  
  try {
    const response = await fetch('/api/pedidos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cliente,
        productos,
        fecha_entrega: fechaEntrega,
        notas
      })
    });

    if (!response.ok) {
      throw new Error('Error al guardar pedido');
    }

    const result = await response.json();
    mostrarNotificacion('Pedido creado exitosamente', 'success');
    
    // Cerrar modal
    cerrarModalNuevoPedido();
    
    // Actualizar vista
    cargarDatosPedidos();
    actualizarListaPedidos();
    
    // Notificación de éxito
    mostrarNotificacion('¡Pedido creado exitosamente!', 'success');
    
  } catch (error) {
    console.error('Error guardando pedido:', error);
    mostrarNotificacion('Error al guardar el pedido', 'error');
  }
}

function actualizarTablaPedidos(pedidos) {
  const lista = document.getElementById('lista-pedidos');
  
  if (pedidos.length === 0) {
    lista.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <i class="fas fa-inbox text-4xl mb-4"></i>
        <p>No hay pedidos registrados</p>
        <p class="text-sm">Los pedidos aparecerán aquí cuando se creen</p>
      </div>
    `;
    return;
  }
  
  lista.innerHTML = pedidos.slice(0, 10).map(pedido => `
    <div class="border border-gray-200 rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-medium text-gray-800">${pedido.cliente_nombre || 'Cliente'}</h4>
        <span class="px-2 py-1 text-xs rounded-full ${getEstadoClases(pedido.estado)}">
          ${pedido.estado.toUpperCase()}
        </span>
      </div>
      <p class="text-sm text-gray-600 mb-2">
        📅 ${new Date(pedido.fecha_entrega || pedido.fecha_pedido).toLocaleDateString('es-CO')}
      </p>
      <p class="text-sm text-gray-600 mb-2">
        📞 ${pedido.cliente_telefono || 'No especificado'}
      </p>
      <p class="text-sm text-gray-600 mb-2">
        � ${pedido.numero_pedido || 'N/A'}
      </p>
      <div class="flex items-center justify-between">
        <span class="font-bold text-pink-600">$${parseFloat(pedido.total || 0).toLocaleString('es-CO')}</span>
        <button onclick="verDetallePedido(${pedido.id})" 
                class="text-blue-600 hover:text-blue-800 text-sm">
          Ver detalles →
        </button>
      </div>
    </div>
  `).join('');
  
  // Actualizar estadísticas
  const pedidosHoy = pedidos.filter(p => {
    const hoy = new Date().toISOString().split('T')[0];
    return (p.fecha_pedido || '').startsWith(hoy);
  }).length;
  
  document.getElementById('pedidos-hoy').textContent = pedidosHoy;
}

function getEstadoClases(estado) {
  switch(estado) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'en_proceso': return 'bg-blue-100 text-blue-800';
    case 'completado': return 'bg-green-100 text-green-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}



function verDetallePedido(id) {
  alert(`Ver detalle del pedido ${id} - Funcionalidad en desarrollo`);
}

// Función auxiliar para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
  // Esta función debería existir en main.js o crear una simple
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${
    tipo === 'success' ? 'bg-green-500' : 
    tipo === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`;
  notification.textContent = mensaje;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}
