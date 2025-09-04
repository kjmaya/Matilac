// Funciones para la gestión de inventario
function cargarSeccionInventario() {
  const seccionInventario = document.getElementById('seccion-inventario');
  
  seccionInventario.innerHTML = `
    <div class="container mx-auto p-6">
      <h2 class="text-2xl font-bold text-pink-700 mb-4">Inventario General</h2>
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Resumen por fechas -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-pink-600 mb-4">Resumen por Fechas</h3>
          <div id="resumen-fechas"></div>
        </div>

        <!-- Estadísticas generales -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-pink-600 mb-4">Estadísticas Generales</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span>Total Productos Registrados:</span>
              <span class="font-bold" id="stat-productos">0</span>
            </div>
            <div class="flex justify-between">
              <span>Total Pedidos:</span>
              <span class="font-bold" id="stat-pedidos">0</span>
            </div>
            <div class="flex justify-between">
              <span>Ingresos Totales:</span>
              <span class="font-bold text-green-600">$<span id="stat-ingresos">0</span></span>
            </div>
            <div class="flex justify-between">
              <span>Gastos Totales:</span>
              <span class="font-bold text-red-600">$<span id="stat-gastos">0</span></span>
            </div>
            <hr>
            <div class="flex justify-between text-lg">
              <span>Balance:</span>
              <span class="font-bold" id="stat-balance">$0</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold text-pink-600 mb-4">Detalle por Fechas</h3>
        <div id="tarjetas-inventario" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        </div>
      </div>
    </div>
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
  document.getElementById("stat-productos").textContent = totalProductos;
  document.getElementById("stat-pedidos").textContent = totalPedidos;
  document.getElementById("stat-ingresos").textContent = totalIngresos.toLocaleString();
  document.getElementById("stat-gastos").textContent = totalGastos.toLocaleString();
  
  const balance = totalIngresos - totalGastos;
  const balanceElement = document.getElementById("stat-balance");
  balanceElement.textContent = "$" + balance.toLocaleString();
  balanceElement.className = balance >= 0 ? "font-bold text-green-600" : "font-bold text-red-600";
  
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
  
  let resumenHTML = '<div class="space-y-2 max-h-64 overflow-y-auto">';
  
  if (fechasOrdenadas.length === 0) {
    resumenHTML += '<p class="text-gray-500">No hay datos registrados</p>';
  } else {
    fechasOrdenadas.slice(0, 7).forEach(fecha => {
      const datos = datosPorFecha[fecha];
      const balance = datos.ingresos - datos.gastos;
      const balanceClass = balance >= 0 ? "text-green-600" : "text-red-600";
      
      resumenHTML += `
        <div class="border-b pb-2">
          <div class="font-medium">${fecha}</div>
          <div class="text-sm text-gray-600">
            Ingresos: ${datos.ingresos.toLocaleString()} | 
            Gastos: ${datos.gastos.toLocaleString()}
          </div>
          <div class="text-sm font-medium ${balanceClass}">
            Balance: ${balance.toLocaleString()}
          </div>
        </div>
      `;
    });
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
  
  let tarjetasHTML = '';
  
  fechasOrdenadas.forEach(fecha => {
    const datos = datosPorFecha[fecha];
    const balance = datos.totalIngresos - datos.totalGastos;
    const balanceClass = balance >= 0 ? "text-green-600" : "text-red-600";
    
    tarjetasHTML += `
      <div class="bg-white rounded-lg shadow p-4">
        <h4 class="font-bold text-pink-600 mb-2">📅 ${fecha}</h4>
        
        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium">Pedidos:</span> ${datos.pedidos.length}
          </div>
          
          ${datos.pedidos.length > 0 ? `
            <div class="pl-2 text-gray-600">
              ${datos.pedidos.slice(0, 3).map(p => 
                `• ${p.cliente}: ${p.producto} (x${p.cantidad})`
              ).join('<br>')}
              ${datos.pedidos.length > 3 ? `<br>• y ${datos.pedidos.length - 3} más...` : ''}
            </div>
          ` : ''}
          
          <div class="mt-2">
            <span class="font-medium">Compras:</span> ${datos.costos.length}
          </div>
          
          ${datos.costos.length > 0 ? `
            <div class="pl-2 text-gray-600">
              ${datos.costos.slice(0, 3).map(c => 
                `• ${c.item}: ${c.valor.toLocaleString()}`
              ).join('<br>')}
              ${datos.costos.length > 3 ? `<br>• y ${datos.costos.length - 3} más...` : ''}
            </div>
          ` : ''}
          
          <hr class="my-2">
          
          <div class="flex justify-between">
            <span>Ingresos:</span>
            <span class="text-green-600 font-medium">${datos.totalIngresos.toLocaleString()}</span>
          </div>
          
          <div class="flex justify-between">
            <span>Gastos:</span>
            <span class="text-red-600 font-medium">${datos.totalGastos.toLocaleString()}</span>
          </div>
          
          <div class="flex justify-between font-bold">
            <span>Balance:</span>
            <span class="${balanceClass}">${balance.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  });
  
  if (tarjetasHTML === '') {
    tarjetasHTML = '<p class="col-span-full text-center text-gray-500">No hay datos para mostrar</p>';
  }
  
  contenedor.innerHTML = tarjetasHTML;
}