// Funciones para la gestión de inventario
function cargarSeccionInventario() {
  const seccionInventario = document.getElementById('seccion-inventario');
  
  seccionInventario.innerHTML = `
    <section id="inventario" class="seccion" style="transition: opacity 0.3s ease;">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Inventario y Estadísticas</h2>
            <p class="text-sm text-gray-500">Resumen de tu negocio</p>
          </div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <!-- Estadísticas generales -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-calculator text-purple-500"></i>
            Estadísticas Generales
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-box text-blue-600"></i>
                </div>
                <span class="text-gray-700 font-medium">Productos Vendidos</span>
              </div>
              <span class="font-bold text-blue-600 text-lg" id="stat-productos">0</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-shopping-cart text-pink-600"></i>
                </div>
                <span class="text-gray-700 font-medium">Total Pedidos</span>
              </div>
              <span class="font-bold text-pink-600 text-lg" id="stat-pedidos">0</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-arrow-trend-up text-green-600"></i>
                </div>
                <span class="text-gray-700 font-medium">Ingresos Totales</span>
              </div>
              <span class="font-bold text-green-600 text-lg">$<span id="stat-ingresos">0</span></span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-arrow-trend-down text-red-600"></i>
                </div>
                <span class="text-gray-700 font-medium">Gastos Totales</span>
              </div>
              <span class="font-bold text-red-600 text-lg">$<span id="stat-gastos">0</span></span>
            </div>
            
            <div class="border-t-2 border-gray-100 pt-4 mt-4">
              <div class="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-scale-balanced text-purple-600"></i>
                  </div>
                  <span class="text-gray-800 font-bold">Balance Final</span>
                </div>
                <span class="font-bold text-xl" id="stat-balance">$0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen por fechas -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-calendar-check text-purple-500"></i>
            Resumen por Fechas
          </h3>
          <div id="resumen-fechas" class="max-h-80 overflow-y-auto"></div>
        </div>
      </div>

      <!-- Detalle por fechas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-clock-rotate-left text-purple-500"></i>
          Historial Detallado
        </h3>
        <div id="tarjetas-inventario" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        </div>
      </div>
    </section>
  `;
}

function actualizarInventario() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const costos = JSON.parse(localStorage.getItem("costos") || "{}");
  
  // Calcular estadísticas generales
  let totalProductos = 0;
  let totalPedidos = pedidos.length;
  let totalIngresos = 0;
  let totalGastos = 0;
  
  // Calcular ingresos
  pedidos.forEach(pedido => {
    totalProductos += pedido.cantidad;
    totalIngresos += pedido.precio;
  });
  
  // Calcular gastos
  Object.values(costos).forEach(comprasPorFecha => {
    comprasPorFecha.forEach(compra => {
      totalGastos += compra.valor;
    });
  });
  
  // Actualizar estadísticas
  document.getElementById("stat-productos").textContent = totalProductos.toLocaleString();
  document.getElementById("stat-pedidos").textContent = totalPedidos.toLocaleString();
  document.getElementById("stat-ingresos").textContent = totalIngresos.toLocaleString();
  document.getElementById("stat-gastos").textContent = totalGastos.toLocaleString();
  
  const balance = totalIngresos - totalGastos;
  const balanceElement = document.getElementById("stat-balance");
  balanceElement.textContent = "$" + balance.toLocaleString();
  balanceElement.className = balance >= 0 ? "font-bold text-xl text-green-600" : "font-bold text-xl text-red-600";
  
  // Crear resumen por fechas
  actualizarResumenPorFechas(pedidos, costos);
  
  // Crear tarjetas detalladas
  actualizarTarjetasInventario(pedidos, costos);
}

function actualizarResumenPorFechas(pedidos, costos) {
  const resumenContainer = document.getElementById("resumen-fechas");
  const datosPorFecha = {};
  
  // Agrupar pedidos por fecha
  pedidos.forEach(pedido => {
    if (!datosPorFecha[pedido.fecha]) {
      datosPorFecha[pedido.fecha] = { ingresos: 0, gastos: 0, pedidos: 0 };
    }
    datosPorFecha[pedido.fecha].ingresos += pedido.precio;
    datosPorFecha[pedido.fecha].pedidos += 1;
  });
  
  // Agrupar costos por fecha
  Object.entries(costos).forEach(([fecha, compras]) => {
    if (!datosPorFecha[fecha]) {
      datosPorFecha[fecha] = { ingresos: 0, gastos: 0, pedidos: 0 };
    }
    compras.forEach(compra => {
      datosPorFecha[fecha].gastos += compra.valor;
    });
  });
  
  // Ordenar fechas de más reciente a más antigua
  const fechasOrdenadas = Object.keys(datosPorFecha).sort((a, b) => b.localeCompare(a));
  
  if (fechasOrdenadas.length === 0) {
    resumenContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-calendar-xmark text-2xl text-gray-300"></i>
        </div>
        <p class="text-gray-500">No hay datos registrados</p>
      </div>
    `;
    return;
  }
  
  let resumenHTML = '<div class="space-y-3">';
  
  fechasOrdenadas.slice(0, 7).forEach((fecha, index) => {
    const datos = datosPorFecha[fecha];
    const balance = datos.ingresos - datos.gastos;
    const balanceClass = balance >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
    const balanceIcon = balance >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down";
    
    resumenHTML += `
      <div class="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors" style="animation: fadeInUp 0.3s ease-out forwards; animation-delay: ${index * 0.05}s; opacity: 0;">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-800 flex items-center gap-2">
            <i class="fas fa-calendar-day text-purple-400 text-sm"></i>
            ${formatearFecha(fecha)}
          </span>
          <span class="text-xs ${balanceClass} px-2 py-1 rounded-lg font-bold flex items-center gap-1">
            <i class="fas ${balanceIcon}"></i>
            $${balance.toLocaleString()}
          </span>
        </div>
        <div class="flex items-center gap-4 text-sm">
          <span class="text-green-600 flex items-center gap-1">
            <i class="fas fa-plus-circle text-xs"></i>
            $${datos.ingresos.toLocaleString()}
          </span>
          <span class="text-red-500 flex items-center gap-1">
            <i class="fas fa-minus-circle text-xs"></i>
            $${datos.gastos.toLocaleString()}
          </span>
          <span class="text-gray-400 flex items-center gap-1">
            <i class="fas fa-shopping-bag text-xs"></i>
            ${datos.pedidos}
          </span>
        </div>
      </div>
    `;
  });
  
  if (fechasOrdenadas.length > 7) {
    resumenHTML += `
      <p class="text-center text-sm text-gray-400 pt-2">
        Y ${fechasOrdenadas.length - 7} días más...
      </p>
    `;
  }
  
  resumenHTML += '</div>';
  resumenContainer.innerHTML = resumenHTML;
}

function actualizarTarjetasInventario(pedidos, costos) {
  const contenedor = document.getElementById("tarjetas-inventario");
  const datosPorFecha = {};
  
  // Agrupar todos los datos por fecha
  pedidos.forEach(pedido => {
    if (!datosPorFecha[pedido.fecha]) {
      datosPorFecha[pedido.fecha] = { 
        pedidos: [], 
        costos: [], 
        totalIngresos: 0, 
        totalGastos: 0 
      };
    }
    datosPorFecha[pedido.fecha].pedidos.push(pedido);
    datosPorFecha[pedido.fecha].totalIngresos += pedido.precio;
  });
  
  Object.entries(costos).forEach(([fecha, compras]) => {
    if (!datosPorFecha[fecha]) {
      datosPorFecha[fecha] = { 
        pedidos: [], 
        costos: [], 
        totalIngresos: 0, 
        totalGastos: 0 
      };
    }
    datosPorFecha[fecha].costos = compras;
    compras.forEach(compra => {
      datosPorFecha[fecha].totalGastos += compra.valor;
    });
  });
  
  // Crear tarjetas
  const fechasOrdenadas = Object.keys(datosPorFecha).sort((a, b) => b.localeCompare(a));
  
  if (fechasOrdenadas.length === 0) {
    contenedor.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-inbox text-3xl text-gray-300"></i>
        </div>
        <p class="text-gray-500 font-medium">No hay datos para mostrar</p>
        <p class="text-gray-400 text-sm">Comienza agregando pedidos o costos</p>
      </div>
    `;
    return;
  }
  
  let tarjetasHTML = '';
  
  fechasOrdenadas.forEach((fecha, index) => {
    const datos = datosPorFecha[fecha];
    const balance = datos.totalIngresos - datos.totalGastos;
    const balanceClass = balance >= 0 ? "text-green-600" : "text-red-600";
    const balanceBg = balance >= 0 ? "from-green-50 to-emerald-50" : "from-red-50 to-rose-50";
    
    tarjetasHTML += `
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all" style="animation: fadeInUp 0.4s ease-out forwards; animation-delay: ${index * 0.08}s; opacity: 0;">
        <div class="bg-gradient-to-r from-purple-50 to-violet-50 px-4 py-3 border-b border-gray-100">
          <h4 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-calendar text-purple-500"></i>
            ${formatearFecha(fecha)}
          </h4>
        </div>
        
        <div class="p-4 space-y-3">
          <!-- Pedidos -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500 flex items-center gap-2">
              <i class="fas fa-shopping-cart text-pink-400"></i>
              Pedidos
            </span>
            <span class="font-semibold text-gray-800">${datos.pedidos.length}</span>
          </div>
          
          ${datos.pedidos.length > 0 ? `
            <div class="bg-gray-50 rounded-lg p-2 max-h-24 overflow-y-auto text-xs space-y-1">
              ${datos.pedidos.slice(0, 3).map(p => 
                `<div class="flex justify-between text-gray-600">
                  <span class="truncate mr-2">${p.cliente}</span>
                  <span class="text-green-600 font-medium">$${p.precio.toLocaleString()}</span>
                </div>`
              ).join('')}
              ${datos.pedidos.length > 3 ? `<p class="text-gray-400 text-center">+${datos.pedidos.length - 3} más</p>` : ''}
            </div>
          ` : '<p class="text-xs text-gray-400 italic">Sin pedidos</p>'}
          
          <!-- Compras -->
          <div class="flex items-center justify-between mt-3">
            <span class="text-sm text-gray-500 flex items-center gap-2">
              <i class="fas fa-receipt text-green-400"></i>
              Compras
            </span>
            <span class="font-semibold text-gray-800">${datos.costos.length}</span>
          </div>
          
          ${datos.costos.length > 0 ? `
            <div class="bg-gray-50 rounded-lg p-2 max-h-24 overflow-y-auto text-xs space-y-1">
              ${datos.costos.slice(0, 3).map(c => 
                `<div class="flex justify-between text-gray-600">
                  <span class="truncate mr-2">${c.item}</span>
                  <span class="text-red-500 font-medium">-$${c.valor.toLocaleString()}</span>
                </div>`
              ).join('')}
              ${datos.costos.length > 3 ? `<p class="text-gray-400 text-center">+${datos.costos.length - 3} más</p>` : ''}
            </div>
          ` : '<p class="text-xs text-gray-400 italic">Sin compras</p>'}
        </div>
        
        <!-- Balance del día -->
        <div class="bg-gradient-to-r ${balanceBg} px-4 py-3 border-t border-gray-100">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-600">Balance</span>
            <span class="font-bold ${balanceClass}">$${balance.toLocaleString()}</span>
          </div>
          <div class="flex items-center justify-between text-xs mt-1 text-gray-500">
            <span>+$${datos.totalIngresos.toLocaleString()}</span>
            <span>-$${datos.totalGastos.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  contenedor.innerHTML = tarjetasHTML;
}