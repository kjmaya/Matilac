// js/pedidos.js - Gestión de pedidos con soporte para LocalStorage y UI Moderna

// Función principal para cargar la sección
function cargarSeccionPedidos() {
  console.log('Cargando sección de pedidos...');
  const elemento = document.getElementById('seccion-pedidos');
  
  if (!elemento) {
    console.error('Elemento seccion-pedidos no encontrado');
    return;
  }

  // Renderizar Dashboard
  elemento.innerHTML = `
    <section id="pedidos" class="seccion container mx-auto px-4 py-6" style="transition: opacity 0.3s ease;">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">Gestión de Pedidos</span>
          </h2>
          <p class="text-gray-500 mt-1">Administra tus ventas y entregas</p>
        </div>
        <button onclick="abrirModalNuevoPedido()" class="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 font-medium group">
          <div class="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
             <i class="fas fa-plus text-sm"></i>
          </div>
          Nuevo Pedido
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Pedidos Hoy -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Pedidos Hoy</p>
              <h3 class="text-3xl font-bold text-gray-800" id="pedidos-hoy">0</h3>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <i class="fas fa-calendar-day text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Ventas Hoy -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Ventas Hoy</p>
              <h3 class="text-3xl font-bold text-gray-800" id="ingresos-hoy">$0</h3>
            </div>
            <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <i class="fas fa-dollar-sign text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Pendientes -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Pendientes</p>
              <h3 class="text-3xl font-bold text-gray-800" id="pedidos-pendientes">0</h3>
            </div>
            <div class="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500">
              <i class="fas fa-clock text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Historico -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Histórico</p>
              <h3 class="text-3xl font-bold text-gray-800" id="pedidos-total">0</h3>
            </div>
            <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
              <i class="fas fa-folder text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Pedidos -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 class="text-lg font-bold text-gray-800">Historial de Pedidos</h3>
          <div class="relative w-full sm:w-64">
             <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
             <input type="text" placeholder="Buscar cliente..." class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-100 focus:border-pink-300 text-sm" onkeyup="filtrarPedidos(this.value)">
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Cant.</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody id="lista-pedidos" class="divide-y divide-gray-50">
               <!-- Se rellena con JS -->
            </tbody>
          </table>
        </div>
        
        <!-- Empty State -->
        <div id="empty-state" class="hidden p-12 text-center">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-clipboard-list text-3xl text-gray-300"></i>
          </div>
          <h4 class="text-gray-900 font-medium mb-1">No hay pedidos aún</h4>
          <p class="text-gray-500 text-sm">Registra tu primer pedido para comenzar.</p>
        </div>
      </div>
    </section>
  `;

  // Cargar datos
  cargarDatosPedidos();
}

// Carga los datos desde localStorage y refresca la UI
function cargarDatosPedidos() {
  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  
  // Calcular stats
  const hoy = new Date().toISOString().split('T')[0];
  const pedidosHoy = pedidos.filter(p => p.fecha === hoy);
  
  document.getElementById('pedidos-hoy').textContent = pedidosHoy.length;
  
  const ingresos = pedidosHoy.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0);
  document.getElementById('ingresos-hoy').textContent = `$${ingresos.toLocaleString('es-CO')}`;
  
  document.getElementById('pedidos-pendientes').textContent = pedidos.filter(p => p.estado !== 'completado').length;
  document.getElementById('pedidos-total').textContent = pedidos.length;

  // Renderizar tabla
  actualizarTablaPedidos(pedidos);
}

function actualizarTablaPedidos(pedidos) {
  const tbody = document.getElementById('lista-pedidos');
  const emptyState = document.getElementById('empty-state');
  
  if (pedidos.length === 0) {
    tbody.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  // Ordenar: más recientes primero
  const sortedPedidos = [...pedidos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  tbody.innerHTML = sortedPedidos.map((pedido, index) => {
    // Determinar índice original para borrado correcto
    // (Esto es una simplificación, idealmente usaríamos IDs únicos)
    const originalIndex = pedidos.indexOf(pedido);
    
    return `
      <tr class="hover:bg-gray-50 transition-colors group">
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          ${pedido.fecha}
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-600 font-bold text-xs mr-3">
              ${(pedido.cliente || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">${pedido.cliente || 'Anónimo'}</div>
              <div class="text-xs text-gray-500">${pedido.cliente_telefono || ''}</div>
            </div>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-sm text-gray-700">${pedido.producto || 'Varios'}</span>
          ${pedido.detalles ? `<div class="text-xs text-gray-400 mt-1">${pedido.categoria}</div>` : ''}
        </td>
        <td class="px-6 py-4 text-center">
          <span class="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ${pedido.cantidad || 1}
          </span>
        </td>
        <td class="px-6 py-4 text-right whitespace-nowrap">
          <span class="text-sm font-bold text-gray-900">$${(pedido.precio || 0).toLocaleString('es-CO')}</span>
        </td>
        <td class="px-6 py-4 text-center whitespace-nowrap">
          <button onclick="cambiarEstadoPedido(${originalIndex})" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockClass(pedido.estado || 'pendiente')} hover:opacity-80 transition-opacity cursor-pointer">
            ${(pedido.estado || 'pendiente').toUpperCase()}
          </button>
        </td>
        <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
          <button onclick="eliminarPedido(${originalIndex})" class="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function getStockClass(estado) {
  switch (estado) {
    case 'completado': return 'bg-green-100 text-green-800';
    case 'pendiente': return 'bg-yellow-100 text-yellow-800';
    case 'cancelado': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// ------ MODAL LOGIC ------

function abrirModalNuevoPedido() {
  const modalHTML = `
    <div id="modal-nuevo-pedido" class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all animate-scaleIn">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 class="text-xl font-bold text-gray-800">Nuevo Pedido</h3>
          <button onclick="cerrarModalNuevoPedido()" class="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <form id="form-pedido" onsubmit="event.preventDefault(); guardarNuevoPedido();" class="space-y-6">
            
            <!-- Cliente -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Nombre Cliente *</label>
                <input type="text" id="cliente-nombre" required class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder-gray-400" placeholder="Ej: Juan Pérez">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">Teléfono</label>
                <input type="tel" id="cliente-telefono" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all placeholder-gray-400" placeholder="Ej: 300 123 4567">
              </div>
            </div>

            <!-- Detalles del Producto -->
            <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
               <h4 class="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">Detalles del Producto</h4>
               
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Categoría -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Categoría</label>
                    <select id="categoria-select" onchange="cargarProductosSelect()" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none bg-white">
                      <option value="">Seleccionar categoría...</option>
                      ${Object.keys(productosPorCategoria).map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                  </div>

                  <!-- Producto -->
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Producto</label>
                    <select id="producto-select" onchange="mostrarOpcionesProducto()" disabled class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400">
                      <option value="">Primero selecciona categoría</option>
                    </select>
                  </div>
               </div>

               <!-- Opciones Dinámicas (Sabor, Tamaño, Tipo) -->
               <div id="opciones-dinamicas" class="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                  <!-- Inyectado por JS -->
               </div>

               <!-- Precio y Cantidad -->
               <div class="grid grid-cols-2 gap-4 pt-2">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Cantidad</label>
                    <input type="number" id="cantidad" value="1" min="1" onchange="calculoFinal()" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none bg-white font-medium text-center">
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Precio Total</label>
                    <div class="relative">
                       <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                       <input type="number" id="precio-total" readonly class="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-100 text-gray-800 font-bold outline-none cursor-default">
                    </div>
                  </div>
               </div>
            </div>

            <!-- Fecha Entrega -->
            <div class="space-y-2">
               <label class="text-sm font-medium text-gray-700">Fecha del Pedido</label>
               <input type="date" id="fecha-pedido" class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all">
            </div>

          </form>
        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex gap-3">
          <button onclick="cerrarModalNuevoPedido()" class="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors">
            Cancelar
          </button>
          <button onclick="document.getElementById('form-pedido').requestSubmit()" class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            Guardar Pedido
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  document.body.style.overflow = 'hidden';

  // Set default date
  document.getElementById('fecha-pedido').value = new Date().toISOString().split('T')[0];
}

function cerrarModalNuevoPedido() {
  const modal = document.getElementById('modal-nuevo-pedido');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => modal.remove(), 200);
  }
  document.body.style.overflow = '';
}

// ------ DYNAMIC FORM LOGIC ------

function cargarProductosSelect() {
  const cat = document.getElementById('categoria-select').value;
  const prodSelect = document.getElementById('producto-select');
  const opcionesDiv = document.getElementById('opciones-dinamicas');
  
  // Reset
  prodSelect.innerHTML = '<option value="">Selecciona un producto...</option>';
  prodSelect.disabled = true;
  opcionesDiv.innerHTML = '';
  opcionesDiv.classList.add('hidden');
  document.getElementById('precio-total').value = '';

  if (cat && productosPorCategoria[cat]) {
    productosPorCategoria[cat].forEach(p => {
      const opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      prodSelect.appendChild(opt);
    });
    prodSelect.disabled = false;
  }
}

function mostrarOpcionesProducto() {
  const producto = document.getElementById('producto-select').value;
  const container = document.getElementById('opciones-dinamicas');
  container.innerHTML = '';
  container.classList.add('hidden');
  
  let htmlInfo = '';

  // Lógica específica según el producto para mostrar variantes
  if (producto === 'Yogurt') {
    container.classList.remove('hidden');
    htmlInfo += `
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Sabor</label>
        <select id="var-sabor" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
          ${yogurtSabores.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Tamaño</label>
        <select id="var-tamano" onchange="calculoFinal()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
           <option value="1L">1 Litro</option>
           <option value="2L">2 Litros</option>
        </select>
      </div>
    `;
  } else if (producto === 'Queso') {
    container.classList.remove('hidden');
    htmlInfo += `
      <div class="space-y-2 col-span-2">
         <label class="text-sm font-medium text-gray-700">Tipo de Queso</label>
         <select id="var-tipo" onchange="calculoFinal()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
            ${tiposQueso.map(t => `<option value="${t}">${t}</option>`).join('')}
         </select>
      </div>
    `;
  } else if (producto === 'Arepas') {
     container.classList.remove('hidden');
     htmlInfo += `
      <div class="space-y-2 col-span-2">
         <label class="text-sm font-medium text-gray-700">Tipo de Arepa</label>
         <select id="var-tipo" onchange="calculoFinal()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
            ${tiposArepas.map(t => `<option value="${t}">${t}</option>`).join('')}
         </select>
      </div>
    `;
  } else if (producto === 'Envueltos') {
     container.classList.remove('hidden');
     htmlInfo += `
      <div class="space-y-2 col-span-2">
         <label class="text-sm font-medium text-gray-700">Tipo</label>
         <select id="var-tipo" onchange="calculoFinal()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
            <option value="Normal">Normal</option>
            <option value="Especial">Especial</option>
         </select>
      </div>
    `;
  }

  container.innerHTML = htmlInfo;
  calculoFinal(); // Calcular precio inmediatamente
}

function calculoFinal() {
  const producto = document.getElementById('producto-select').value;
  const cant = parseInt(document.getElementById('cantidad').value) || 1;
  const output = document.getElementById('precio-total');
  
  if (!producto) {
    output.value = '';
    return;
  }

  let precioUnitario = 0;

  // Lógica de precios replicada de PRECIOS (config.js)
  // Nota: Idealmente deberíamos importar PRECIOS, pero aquí asumimos acceso global o hardcodeamos para consistencia rapida
  
  if (PRECIOS) {
      if (producto === 'Yogurt') {
          const size = document.getElementById('var-tamano').value; // 1L or 2L
          precioUnitario = PRECIOS.yogurt[size] || 0;
      } else if (producto === 'Arepas') {
          const tipo = document.getElementById('var-tipo').value;
          precioUnitario = PRECIOS.arepas[tipo] || 0;
      } else if (producto === 'Envueltos') {
          const tipo = document.getElementById('var-tipo').value;
          precioUnitario = PRECIOS.envueltos[tipo] || 0;
      } else if (producto === 'Queso') {
          // Asumimos precio único para queso según config.js, aunque tiposQueso existe para UI
          precioUnitario = PRECIOS.queso || 0; 
      } else if (producto === 'Almojábanas') {
          precioUnitario = PRECIOS.almohabanas || 0;
      } else if (producto === 'Rellenas') {
          precioUnitario = PRECIOS.rellenas || 0;
      } else if (producto === 'Panela') {
          precioUnitario = PRECIOS.panela || 0;
      } else if (producto === 'Huevos') {
          precioUnitario = PRECIOS.huevos || 0;
      } else if (producto === 'Almuerzo') {
          precioUnitario = PRECIOS.almuerzo || 0;
      } else if (producto === 'Pulpa de avena') {
          precioUnitario = PRECIOS.pulpaAvena || 0;
      }
  }

  output.value = precioUnitario * cant;
}

function guardarNuevoPedido() {
  const nombre = document.getElementById('cliente-nombre').value;
  const telefono = document.getElementById('cliente-telefono').value;
  const productoBase = document.getElementById('producto-select').value;
  const categoria = document.getElementById('categoria-select').value;
  const cantidad = parseInt(document.getElementById('cantidad').value);
  const precio = parseFloat(document.getElementById('precio-total').value);
  const fecha = document.getElementById('fecha-pedido').value;

  if (!nombre || !productoBase || !precio) {
    alert("Por favor completa los campos obligatorios.");
    return;
  }

  // Construir nombre completo del producto con variantes
  let productoFull = productoBase;
  if (productoBase === 'Yogurt') {
      productoFull += ` (${document.getElementById('var-tamano').value}, ${document.getElementById('var-sabor').value})`;
  } else if (document.getElementById('var-tipo')) {
      productoFull += ` (${document.getElementById('var-tipo').value})`;
  }

  const nuevoPedido = {
      cliente: nombre,
      cliente_telefono: telefono,
      producto: productoFull,
      categoria: categoria,
      cantidad: cantidad,
      precio: precio,
      fecha: fecha,
      estado: 'pendiente'
  };

  const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
  pedidos.push(nuevoPedido);
  localStorage.setItem('pedidos', JSON.stringify(pedidos));

  // Sincronizar con GitHub
  if (window.matilacSync && typeof window.matilacSync.syncAfterPedido === 'function') {
      window.matilacSync.syncAfterPedido();
  }

  cerrarModalNuevoPedido();
  cargarDatosPedidos();
  
  // Mostrar feedback simple
  // (Si existe función global de notificación, usarla, si no alert simple o nada)
  if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion("Pedido guardado correctamente", "success");
  } else {
      alert("Pedido guardado correctamente");
  }
}

function eliminarPedido(index) {
    if (confirm("¿Estás seguro de eliminar este pedido?")) {
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        pedidos.splice(index, 1);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        cargarDatosPedidos();
        if (window.matilacSync && window.matilacSync.syncAfterPedido) {
            window.matilacSync.syncAfterPedido();
        }
    }
}

function cambiarEstadoPedido(index) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const estados = ['pendiente', 'completado', 'cancelado'];
    const actual = pedidos[index].estado || 'pendiente';
    
    let nextIdx = estados.indexOf(actual) + 1;
    if (nextIdx >= estados.length) nextIdx = 0;
    
    pedidos[index].estado = estados[nextIdx];
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    cargarDatosPedidos();
    if (window.matilacSync && window.matilacSync.syncAfterPedido) {
        window.matilacSync.syncAfterPedido();
    }
}

function filtrarPedidos(query) {
    const term = query.toLowerCase();
    const rows = document.querySelectorAll('#lista-pedidos tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
    });
}
