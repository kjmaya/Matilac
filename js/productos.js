// js/productos.js - Gestión de la Pantalla de Inicio y Dashboard

async function cargarSeccionInicio() {
  const seccionInicio = document.getElementById('seccion-inicio');
  
  if (!seccionInicio) return;

  // Cargar datos de LocalStorage
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const costos = JSON.parse(localStorage.getItem("costos") || "{}");
  
  // Calcular Totales
  let totalIngresos = 0;
  let totalGastos = 0;
  
  // Sumar ingresos de pedidos (asumiendo campo precio o total)
  pedidos.forEach(p => {
      totalIngresos += parseFloat(p.precio || p.total || 0);
  });

  // Sumar gastos (estructura: object{ 'YYYY-MM': [ {valor: 100}, ... ] })
  Object.values(costos).forEach(listaMes => {
    if (Array.isArray(listaMes)) {
        listaMes.forEach(c => totalGastos += parseFloat(c.valor || 0));
    }
  });
  
  const balance = totalIngresos - totalGastos;
  
  // Pedidos de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const pedidosHoy = pedidos.filter(p => (p.fecha || '').startsWith(hoy)).length;
  
  // Generar HTML de Productos (Catálogo)
  let productosHTML = '';
  if (typeof PRODUCTOS_INFO !== 'undefined') {
      productosHTML = PRODUCTOS_INFO.map((producto, index) => `
        <div class="group card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100/50 hover:-translate-y-1 transition-all duration-300" style="animation: fadeInUp 0.5s ease-out forwards; animation-delay: ${index * 0.08}s; opacity: 0;">
          <div class="relative h-44 sm:h-52 overflow-hidden">
            <img src="${producto.imagen}" alt="${producto.nombre}" 
                 class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                 loading="lazy"
                 onerror="this.src='https://placehold.co/400x300/fdf2f8/ec4899?text=${encodeURIComponent(producto.nombre)}'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
            <div class="absolute top-3 right-3">
              <span class="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-green-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Disponible
              </span>
            </div>
            <div class="absolute bottom-0 left-0 right-0 p-4">
              <h3 class="text-white font-bold text-lg drop-shadow-md">${producto.nombre}</h3>
            </div>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">${producto.descripcion}</p>
            <div class="flex items-center justify-between">
              <div class="flex -space-x-1">
                <span class="w-6 h-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center">
                  <i class="fas fa-star text-pink-500 text-[10px]"></i>
                </span>
                <span class="w-6 h-6 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center">
                  <i class="fas fa-fire text-yellow-500 text-[10px]"></i>
                </span>
              </div>
              <button onclick="if(typeof mostrarSeccion === 'function') { mostrarSeccion('pedidos'); if(typeof abrirModalNuevoPedido === 'function') setTimeout(abrirModalNuevoPedido, 300); }" class="text-pink-600 text-sm font-bold hover:text-pink-700 flex items-center gap-1 transition-colors group/btn">
                Pedir <i class="fas fa-arrow-right text-xs group-hover/btn:translate-x-1 transition-transform"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
  }
  
  seccionInicio.innerHTML = `
    <section id="inicio" class="seccion container mx-auto px-4 py-6" style="transition: opacity 0.3s ease;">
      <!-- Bienvenida -->
      <div class="mb-8 flex flex-col sm:flex-row justify-between items-end gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">
            ¡Hola de nuevo! 👋
            </h1>
            <p class="text-gray-500">Resumen de actividad de tu negocio</p>
        </div>
        <div class="text-right hidden sm:block">
            <p class="text-sm text-gray-400">${new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
      
      <!-- Tarjetas de estadísticas (Dashboard) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        
        <!-- Pedidos Hoy -->
        <div class="stat-card bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-transform duration-300">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-blue-100 text-sm font-medium mb-1">Pedidos Hoy</p>
              <p class="text-3xl font-bold">${pedidosHoy}</p>
            </div>
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <i class="fas fa-shopping-cart text-xl"></i>
            </div>
          </div>
          <div class="pt-3 border-t border-white/10">
            <p class="text-xs text-blue-100 flex items-center gap-1">
              <i class="fas fa-list"></i> Total Histórico: ${pedidos.length}
            </p>
          </div>
        </div>
        
        <!-- Ingresos -->
        <div class="stat-card bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform duration-300">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-emerald-100 text-sm font-medium mb-1">Ingresos</p>
              <p class="text-2xl font-bold">$${totalIngresos.toLocaleString('es-CO')}</p>
            </div>
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <i class="fas fa-dollar-sign text-xl"></i>
            </div>
          </div>
          <div class="pt-3 border-t border-white/10">
            <p class="text-xs text-emerald-100 flex items-center gap-1">
              <i class="fas fa-chart-line"></i> Total acumulado
            </p>
          </div>
        </div>
        
        <!-- Gastos -->
        <div class="stat-card bg-gradient-to-br from-rose-500 via-red-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-rose-500/20 hover:scale-[1.02] transition-transform duration-300">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-rose-100 text-sm font-medium mb-1">Gastos</p>
              <p class="text-2xl font-bold">$${totalGastos.toLocaleString('es-CO')}</p>
            </div>
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <i class="fas fa-receipt text-xl"></i>
            </div>
          </div>
          <div class="pt-3 border-t border-white/10">
            <p class="text-xs text-rose-100 flex items-center gap-1">
              <i class="fas fa-arrow-down"></i> Salidas registradas
            </p>
          </div>
        </div>
        
        <!-- Balance -->
        <div class="stat-card bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-transform duration-300">
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-violet-100 text-sm font-medium mb-1">Balance</p>
              <p class="text-2xl font-bold ${balance < 0 ? 'text-red-200' : ''}">$${balance.toLocaleString('es-CO')}</p>
            </div>
            <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <i class="fas fa-scale-balanced text-xl"></i>
            </div>
          </div>
          <div class="pt-3 border-t border-white/10">
            <p class="text-xs text-violet-100 flex items-center gap-1">
              <i class="fas ${balance >= 0 ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> 
              ${balance >= 0 ? 'Estado Saludable' : 'Revisar costos'}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Accesos Directos -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <button onclick="mostrarSeccion('pedidos')" class="group bg-white hover:bg-pink-50 border border-gray-100 hover:border-pink-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-pink-100/50 text-left">
          <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-plus text-pink-600"></i>
          </div>
          <p class="font-bold text-gray-800 text-sm">Nuevo Pedido</p>
          <p class="text-xs text-gray-400 mt-1 hidden sm:block">Registrar venta</p>
        </button>
        
        <button onclick="mostrarSeccion('costos')" class="group bg-white hover:bg-green-50 border border-gray-100 hover:border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-green-100/50 text-left">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-file-invoice-dollar text-green-600"></i>
          </div>
          <p class="font-bold text-gray-800 text-sm">Nuevo Costo</p>
          <p class="text-xs text-gray-400 mt-1 hidden sm:block">Registrar gasto</p>
        </button>
        
        <button onclick="mostrarSeccion('inventario')" class="group bg-white hover:bg-purple-50 border border-gray-100 hover:border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100/50 text-left">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-boxes text-purple-600"></i>
          </div>
          <p class="font-bold text-gray-800 text-sm">Inventario</p>
          <p class="text-xs text-gray-400 mt-1 hidden sm:block">Ver stock</p>
        </button>
        
        <button onclick="exportarDatos()" class="group bg-white hover:bg-blue-50 border border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100/50 text-left">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-file-export text-blue-600"></i>
          </div>
          <p class="font-bold text-gray-800 text-sm">Reporte</p>
          <p class="text-xs text-gray-400 mt-1 hidden sm:block">Descargar JSON</p>
        </button>
      </div>
      
      <!-- Productos Grid -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <span class="text-3xl">🍦</span>
              Catálogo de Productos
            </h2>
            <p class="text-gray-500 text-sm mt-1">Explora nuestra selección de lácteos y panadería</p>
          </div>
          <div class="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-semibold border border-pink-100">
            ${typeof PRODUCTOS_INFO !== 'undefined' ? PRODUCTOS_INFO.length : 0} Variedades
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          ${productosHTML}
        </div>
      </div>
    </section>
  `;
}

// Función para exportar datos (Backup)
function exportarDatos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const costos = JSON.parse(localStorage.getItem("costos") || "{}");
  const inventario = JSON.parse(localStorage.getItem("inventario") || "[]");
  
  const datos = {
    pedidos,
    costos,
    inventario,
    fechaExportacion: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `matilac-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  alert('Datos exportados correctamente');
}
