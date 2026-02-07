// Funciones relacionadas con productos
let precioUnitario = 0;

function cargarSeccionInicio() {
  const seccionInicio = document.getElementById('seccion-inicio');
  
  // Estadísticas rápidas
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const costos = JSON.parse(localStorage.getItem("costos") || "{}");
  
  let totalIngresos = 0;
  let totalGastos = 0;
  
  pedidos.forEach(p => totalIngresos += p.precio);
  Object.values(costos).forEach(compras => {
    compras.forEach(c => totalGastos += c.valor);
  });
  
  const balance = totalIngresos - totalGastos;
  const pedidosHoy = pedidos.filter(p => p.fecha === new Date().toISOString().split('T')[0]).length;
  
  let productosHTML = PRODUCTOS_INFO.map((producto, index) => `
    <div class="group card-hover bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100/50" style="animation: fadeInUp 0.5s ease-out forwards; animation-delay: ${index * 0.08}s; opacity: 0;">
      <div class="relative h-44 sm:h-52 overflow-hidden">
        <img src="${producto.imagen}" alt="${producto.nombre}" 
             class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
             loading="lazy"
             onerror="this.src='https://placehold.co/400x300/fdf2f8/ec4899?text=${encodeURIComponent(producto.nombre)}'">
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div class="absolute top-3 right-3">
          <span class="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm text-green-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Disponible
          </span>
        </div>
        <div class="absolute bottom-0 left-0 right-0 p-4">
          <h3 class="text-white font-bold text-lg drop-shadow-lg">${producto.nombre}</h3>
        </div>
      </div>
      <div class="p-4">
        <p class="text-sm text-gray-600 line-clamp-2 mb-3">${producto.descripcion}</p>
        <div class="flex items-center justify-between">
          <div class="flex -space-x-1">
            <span class="w-6 h-6 rounded-full bg-pink-100 border-2 border-white flex items-center justify-center">
              <i class="fas fa-star text-pink-500 text-xs"></i>
            </span>
            <span class="w-6 h-6 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center">
              <i class="fas fa-fire text-yellow-500 text-xs"></i>
            </span>
          </div>
          <button onclick="mostrarSeccion('pedidos')" class="text-pink-600 text-sm font-semibold hover:text-pink-700 flex items-center gap-1 transition-colors">
            Pedir <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  seccionInicio.innerHTML = `
    <section id="inicio" class="seccion" style="transition: opacity 0.3s ease;">
      <!-- Bienvenida -->
      <div class="mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          ¡Bienvenido! 👋
        </h1>
        <p class="text-gray-500">Aquí tienes un resumen de tu negocio</p>
      </div>
      
      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="stat-card bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-blue-500/20">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="order-2 sm:order-1">
              <p class="text-blue-100 text-xs sm:text-sm font-medium">Pedidos Hoy</p>
              <p class="text-2xl sm:text-3xl font-bold mt-0.5">${pedidosHoy}</p>
            </div>
            <div class="order-1 sm:order-2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <i class="fas fa-shopping-cart text-xl sm:text-2xl"></i>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-white/20">
            <p class="text-xs text-blue-100 flex items-center gap-1">
              <i class="fas fa-calendar-day"></i>
              Total: ${pedidos.length} pedidos
            </p>
          </div>
        </div>
        
        <div class="stat-card bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-emerald-500/20">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="order-2 sm:order-1">
              <p class="text-emerald-100 text-xs sm:text-sm font-medium">Ingresos</p>
              <p class="text-xl sm:text-2xl font-bold mt-0.5">$${totalIngresos.toLocaleString()}</p>
            </div>
            <div class="order-1 sm:order-2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <i class="fas fa-arrow-trend-up text-xl sm:text-2xl"></i>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-white/20">
            <p class="text-xs text-emerald-100 flex items-center gap-1">
              <i class="fas fa-chart-line"></i>
              Ventas totales
            </p>
          </div>
        </div>
        
        <div class="stat-card bg-gradient-to-br from-rose-500 via-red-500 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-rose-500/20">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="order-2 sm:order-1">
              <p class="text-rose-100 text-xs sm:text-sm font-medium">Gastos</p>
              <p class="text-xl sm:text-2xl font-bold mt-0.5">$${totalGastos.toLocaleString()}</p>
            </div>
            <div class="order-1 sm:order-2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <i class="fas fa-arrow-trend-down text-xl sm:text-2xl"></i>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-white/20">
            <p class="text-xs text-rose-100 flex items-center gap-1">
              <i class="fas fa-receipt"></i>
              Compras realizadas
            </p>
          </div>
        </div>
        
        <div class="stat-card bg-gradient-to-br from-violet-500 via-purple-600 to-purple-700 rounded-2xl p-4 sm:p-6 text-white shadow-xl shadow-purple-500/20">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="order-2 sm:order-1">
              <p class="text-violet-100 text-xs sm:text-sm font-medium">Balance</p>
              <p class="text-xl sm:text-2xl font-bold mt-0.5 ${balance >= 0 ? '' : 'text-red-200'}">$${balance.toLocaleString()}</p>
            </div>
            <div class="order-1 sm:order-2 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <i class="fas fa-scale-balanced text-xl sm:text-2xl"></i>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-white/20">
            <p class="text-xs text-violet-100 flex items-center gap-1">
              <i class="fas ${balance >= 0 ? 'fa-face-smile' : 'fa-face-frown'}"></i>
              ${balance >= 0 ? 'Ganancia neta' : 'Déficit actual'}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Acciones rápidas -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <button onclick="mostrarSeccion('pedidos')" class="group bg-white hover:bg-pink-50 border-2 border-gray-100 hover:border-pink-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-pink-100">
          <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-plus text-pink-600"></i>
          </div>
          <p class="font-semibold text-gray-800 text-sm">Nuevo Pedido</p>
          <p class="text-xs text-gray-500 mt-1 hidden sm:block">Agregar venta</p>
        </button>
        
        <button onclick="mostrarSeccion('costos')" class="group bg-white hover:bg-green-50 border-2 border-gray-100 hover:border-green-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-green-100">
          <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-receipt text-green-600"></i>
          </div>
          <p class="font-semibold text-gray-800 text-sm">Registrar Gasto</p>
          <p class="text-xs text-gray-500 mt-1 hidden sm:block">Nueva compra</p>
        </button>
        
        <button onclick="mostrarSeccion('inventario')" class="group bg-white hover:bg-purple-50 border-2 border-gray-100 hover:border-purple-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-chart-pie text-purple-600"></i>
          </div>
          <p class="font-semibold text-gray-800 text-sm">Ver Reportes</p>
          <p class="text-xs text-gray-500 mt-1 hidden sm:block">Estadísticas</p>
        </button>
        
        <button onclick="exportarDatos()" class="group bg-white hover:bg-blue-50 border-2 border-gray-100 hover:border-blue-200 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-100">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <i class="fas fa-download text-blue-600"></i>
          </div>
          <p class="font-semibold text-gray-800 text-sm">Exportar</p>
          <p class="text-xs text-gray-500 mt-1 hidden sm:block">Descargar datos</p>
        </button>
      </div>
      
      <!-- Productos -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span class="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                <i class="fas fa-box text-sm"></i>
              </span>
              Catálogo de Productos
            </h2>
            <p class="text-gray-500 text-sm mt-1 ml-13">Nuestros productos disponibles</p>
          </div>
          <span class="badge badge-primary self-start sm:self-auto">
            <i class="fas fa-cubes"></i>
            ${PRODUCTOS_INFO.length} productos
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          ${productosHTML}
        </div>
      </div>
    </section>
  `;
}

// Función para exportar datos
function exportarDatos() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const costos = JSON.parse(localStorage.getItem("costos") || "{}");
  
  const datos = {
    pedidos,
    costos,
    exportadoEn: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `matilac-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  mostrarNotificacion('Datos exportados correctamente', 'success');
}

function setPrecioUnitario(valor) {
  precioUnitario = valor;
  actualizarTotal();
}

function actualizarPrecioYogurt() {
  const tamaño = document.getElementById("tamañoYogurt").value;
  if (tamaño === "1L") setPrecioUnitario(PRECIOS.yogurt["1L"]);
  else if (tamaño === "2L") setPrecioUnitario(PRECIOS.yogurt["2L"]);
}

function actualizarPrecioEnvueltos() {
  const tipo = document.getElementById("tipoEnvueltos").value;
  if (tipo === "Normal") setPrecioUnitario(PRECIOS.envueltos["Normal"]);
  else if (tipo === "Especial") setPrecioUnitario(PRECIOS.envueltos["Especial"]);
}

function actualizarTotal() {
  const cantidad = parseInt(document.getElementById("cantidad").value) || 0;
  document.getElementById("precio").value = precioUnitario * cantidad;
}

function limpiarExtras() {
  precioUnitario = 0;
  document.getElementById("opcionesExtras").innerHTML = "";
  document.getElementById("opcionesExtras").classList.add("hidden");
  document.getElementById("precio").value = "";
}