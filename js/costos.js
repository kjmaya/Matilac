// Funciones para la gestión de costos
function cargarSeccionCostos() {
  const seccionCostos = document.getElementById('seccion-costos');
  
  seccionCostos.innerHTML = `
    <section id="costos" class="seccion">
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <i class="fas fa-receipt text-pink-500"></i>
          Registrar Compra
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">¿Qué se compró?</label>
            <input type="text" id="costo-item" placeholder="Ej: Leche, Harina, etc." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Valor</label>
            <input type="number" id="costo-valor" placeholder="$0" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input type="date" id="costo-fecha" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
            <input type="text" id="costo-descripcion" placeholder="Detalles adicionales" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
        </div>
        
        <button onclick="agregarCosto()" class="btn-primary mt-6">
          <i class="fas fa-plus mr-2"></i>
          Registrar Compra
        </button>
      </div>

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

  Object.keys(data).sort().reverse().forEach(fecha => {
    const compras = data[fecha];
    let subtotal = 0;

    const card = document.createElement("div");
    card.className = "bg-white rounded-xl shadow-sm overflow-hidden mb-6";

    let comprasHTML = compras.map((c, index) => {
      subtotal += c.valor;
      return `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4 font-medium">${c.item}</td>
          <td class="px-6 py-4 text-green-600 font-semibold">${c.valor.toLocaleString()}</td>
          <td class="px-6 py-4 text-gray-600">${c.descripcion || '-'}</td>
          <td class="px-6 py-4 text-center">
            <button onclick="eliminarCosto('${fecha}', ${index})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-all">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join("");

    card.innerHTML = `
      <div class="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <i class="fas fa-calendar"></i>
          ${formatearFecha(fecha)}
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-100">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${comprasHTML}
          </tbody>
          <tfoot>
            <tr class="bg-gray-50 font-semibold">
              <td class="px-6 py-4" colspan="3">Total del Día</td>
              <td class="px-6 py-4 text-right text-green-600">${subtotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    contenedor.appendChild(card);
  });

  if (contenedor.innerHTML === "") {
    contenedor.innerHTML = '<div class="text-center py-12 text-gray-500">No hay compras registradas</div>';
  }
}

function eliminarCosto(fecha, index) {
  const data = JSON.parse(localStorage.getItem("costos") || "{}");
  if (data[fecha]) {
    data[fecha].splice(index, 1);
    if (data[fecha].length === 0) delete data[fecha];
    localStorage.setItem("costos", JSON.stringify(data));
    actualizarCostos();
  }
}