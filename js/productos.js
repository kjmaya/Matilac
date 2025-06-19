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
  
  let productosHTML = PRODUCTOS_INFO.map((producto, index) => `
    <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden" style="animation-delay: ${index * 0.1}s">
      <div class="relative h-48 overflow-hidden">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="w-full h-full object-cover transition-transform duration-300 hover:scale-110">
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <h3 class="absolute bottom-4 left-4 text-white font-bold text-xl">${producto.nombre}</h3>
      </div>
      <div class="p-4">
        <p class="text-sm text-gray-600 line-clamp-2">${producto.descripcion}</p>
        <div class="mt-3 flex items-center gap-2">
          <span class="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">Disponible</span>
        </div>
      </div>
    </div>
  `).join('');
  
  seccionInicio.innerHTML = `
    <section id="inicio" class="seccion">
      <!-- Tarjetas de estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm">Pedidos Hoy</p>
              <p class="text-3xl font-bold mt-1">${pedidos.filter(p => p.fecha === new Date().toISOString().split('T')[0]).length}</p>
            </div>
            <i class="fas fa-shopping-cart text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-green-100 text-sm">Ingresos</p>
              <p class="text-3xl font-bold mt-1">${totalIngresos.toLocaleString()}</p>
            </div>
            <i class="fas fa-arrow-up text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-red-100 text-sm">Gastos</p>
              <p class="text-3xl font-bold mt-1">${totalGastos.toLocaleString()}</p>
            </div>
            <i class="fas fa-arrow-down text-3xl opacity-50"></i>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-purple-100 text-sm">Balance</p>
              <p class="text-3xl font-bold mt-1">${balance.toLocaleString()}</p>
            </div>
            <i class="fas fa-chart-line text-3xl opacity-50"></i>
          </div>
        </div>
      </div>
      
      <!-- Productos -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <i class="fas fa-box text-pink-500"></i>
          Catálogo de Productos
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${productosHTML}
        </div>
      </div>
    </section>
  `;
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