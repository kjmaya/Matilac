// Funciones para la gestión de costos
function cargarSeccionCostos() {
  const seccionCostos = document.getElementById('seccion-costos');
  
  seccionCostos.innerHTML = `
    <section id="costos" class="seccion" style="transition: opacity 0.3s ease;">
      <!-- Formulario de registro de compra -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
              <i class="fas fa-receipt"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Registrar Compra</h2>
              <p class="text-sm text-gray-500">Agrega un nuevo gasto</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-shopping-bag text-green-500 mr-1"></i> ¿Qué se compró?
            </label>
            <input type="text" id="costo-item" placeholder="Ej: Leche, Harina, etc." class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50 hover:bg-white">
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-dollar-sign text-green-500 mr-1"></i> Valor
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input type="number" id="costo-valor" placeholder="0" class="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50 hover:bg-white">
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-calendar text-green-500 mr-1"></i> Fecha
            </label>
            <input type="date" id="costo-fecha" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50 hover:bg-white">
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-comment text-green-500 mr-1"></i> Descripción (opcional)
            </label>
            <input type="text" id="costo-descripcion" placeholder="Detalles adicionales" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50 hover:bg-white">
          </div>
        </div>
        
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button onclick="agregarCosto()" class="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 flex items-center justify-center gap-2">
            <i class="fas fa-plus"></i>
            Registrar Compra
          </button>
        </div>
      </div>

      <!-- Lista de costos -->
      <div id="contenedor-costos"></div>
    </section>
  `;
  
  // Establecer fecha actual
  document.getElementById('costo-fecha').value = new Date().toISOString().split('T')[0];
}

function agregarCosto() {
  const item = document.getElementById("costo-item").value;
  const valor = parseFloat(document.getElementById("costo-valor").value);
  const fecha = document.getElementById("costo-fecha").value;
  const descripcion = document.getElementById("costo-descripcion").value;

  if (!item || isNaN(valor) || !fecha) {
    mostrarNotificacion("Por favor llena los campos requeridos", "error");
    return;
  }

  const compra = { item, valor, fecha, descripcion };
  const data = JSON.parse(localStorage.getItem("costos") || "{}");

  if (!data[fecha]) data[fecha] = [];
  data[fecha].push(compra);

  localStorage.setItem("costos", JSON.stringify(data));
  mostrarNotificacion("Compra registrada exitosamente", "success");
  actualizarCostos();
  
  // Limpiar campos
  document.getElementById("costo-item").value = "";
  document.getElementById("costo-valor").value = "";
  document.getElementById("costo-fecha").value = new Date().toISOString().split('T')[0];
  document.getElementById("costo-descripcion").value = "";
}

function actualizarCostos() {
  const data = JSON.parse(localStorage.getItem("costos") || "{}");
  const contenedor = document.getElementById("contenedor-costos");
  contenedor.innerHTML = "";

  const fechasOrdenadas = Object.keys(data).sort().reverse();
  
  if (fechasOrdenadas.length === 0) {
    contenedor.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-8 sm:p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <i class="fas fa-receipt text-3xl text-green-300"></i>
          </div>
          <div>
            <p class="text-gray-500 font-medium">No hay compras registradas</p>
            <p class="text-gray-400 text-sm">Registra tu primera compra arriba</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  fechasOrdenadas.forEach((fecha, fechaIndex) => {
    const compras = data[fecha];
    let subtotal = 0;

    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden mb-4";
    card.style.animation = `fadeInUp 0.4s ease-out forwards`;
    card.style.animationDelay = `${fechaIndex * 0.1}s`;
    card.style.opacity = 0;

    // Vista desktop de la tabla
    let comprasHTMLDesktop = compras.map((c, index) => {
      subtotal += c.valor;
      return `
        <tr class="hover:bg-gray-50 transition-colors group">
          <td class="px-4 sm:px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-shopping-basket text-green-600 text-sm"></i>
              </div>
              <span class="font-medium">${c.item}</span>
            </div>
          </td>
          <td class="px-4 sm:px-6 py-4">
            <span class="font-bold text-red-600">$${c.valor.toLocaleString()}</span>
          </td>
          <td class="px-4 sm:px-6 py-4 text-gray-500">${c.descripcion || '-'}</td>
          <td class="px-4 sm:px-6 py-4 text-center">
            <button onclick="eliminarCosto('${fecha}', ${index})" class="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
              <i class="fas fa-trash-alt text-sm"></i>
            </button>
          </td>
        </tr>`;
    }).join("");
    
    // Reset subtotal para calcular de nuevo para móvil
    subtotal = 0;
    
    // Vista móvil de tarjetas
    let comprasHTMLMobile = compras.map((c, index) => {
      subtotal += c.valor;
      return `
        <div class="px-4 py-3 border-b border-gray-100 last:border-b-0">
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-shopping-basket text-green-600 text-sm"></i>
              </div>
              <div>
                <p class="font-medium text-gray-800">${c.item}</p>
                ${c.descripcion ? `<p class="text-xs text-gray-400">${c.descripcion}</p>` : ''}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-red-600">$${c.valor.toLocaleString()}</span>
              <button onclick="eliminarCosto('${fecha}', ${index})" class="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </div>
          </div>
        </div>`;
    }).join("");

    card.innerHTML = `
      <div class="px-4 sm:px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <i class="fas fa-calendar-day text-green-500"></i>
          ${formatearFecha(fecha)}
        </h3>
        <div class="flex items-center gap-2">
          <span class="text-sm bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">${compras.length} compra${compras.length > 1 ? 's' : ''}</span>
          <span class="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">-$${subtotal.toLocaleString()}</span>
        </div>
      </div>
      
      <!-- Vista desktop -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Descripción</th>
              <th class="px-4 sm:px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${comprasHTMLDesktop}
          </tbody>
        </table>
      </div>
      
      <!-- Vista móvil -->
      <div class="sm:hidden">
        ${comprasHTMLMobile}
      </div>
    `;

    contenedor.appendChild(card);
  });
}

function eliminarCosto(fecha, index) {
  const data = JSON.parse(localStorage.getItem("costos") || "{}");
  if (data[fecha]) {
    data[fecha].splice(index, 1);
    if (data[fecha].length === 0) delete data[fecha];
    localStorage.setItem("costos", JSON.stringify(data));
    actualizarCostos();
    mostrarNotificacion("Compra eliminada", "warning");
  }
}