// Funciones para la gestión de costos

// Función para formatear fecha
function formatearFecha(fecha) {
  const date = new Date(fecha);
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function cargarSeccionCostos() {
  const seccionCostos = document.getElementById('seccion-costos');
  
  seccionCostos.innerHTML = `
    <div class="container mx-auto p-6">
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
            <input type="number" id="costo-valor" placeholder="0" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input type="date" id="costo-fecha" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
            <input type="text" id="costo-descripcion" placeholder="Detalles adicionales..." class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
        </div>
        
        <button onclick="agregarCosto()" class="mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2">
          <i class="fas fa-plus"></i>
          Registrar Compra
        </button>
      </div>

      <div id="contenedor-costos"></div>
    </div>
  `;
  
  // Establecer fecha actual
  document.getElementById('costo-fecha').value = new Date().toISOString().split('T')[0];
  
  // Cargar costos existentes
  actualizarCostos();
}

async function agregarCosto() {
  const item = document.getElementById("costo-item").value;
  const valor = parseFloat(document.getElementById("costo-valor").value);
  const fecha = document.getElementById("costo-fecha").value;
  const descripcion = document.getElementById("costo-descripcion").value;

  if (!item || isNaN(valor) || !fecha) {
    mostrarNotificacion("Por favor llena los campos requeridos", "error");
    return;
  }

  try {
    const response = await fetch('/api/costos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item,
        valor,
        fecha,
        descripcion,
        categoria_costo: 'materia_prima'
      })
    });

    if (!response.ok) {
      throw new Error('Error al guardar costo');
    }

    const result = await response.json();
    mostrarNotificacion("Compra registrada exitosamente", "success");
    
    // Limpiar formulario
    document.getElementById("costo-item").value = "";
    document.getElementById("costo-valor").value = "";
    document.getElementById("costo-descripcion").value = "";
    
    actualizarCostos();
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion("Error al registrar la compra", "error");
  }
}

async function actualizarCostos() {
  try {
    const response = await fetch('/api/costos');
    if (!response.ok) {
      throw new Error('Error al cargar costos');
    }
    
    const result = await response.json();
    const costos = result.costos || [];
    
    const contenedor = document.getElementById("contenedor-costos");
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    if (costos.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <i class="fas fa-receipt text-6xl mb-4 opacity-20"></i>
          <p class="text-lg">No hay compras registradas</p>
        </div>
      `;
      return;
    }

    // Agrupar costos por fecha
    const costosPorFecha = {};
    costos.forEach(costo => {
      const fecha = costo.fecha;
      if (!costosPorFecha[fecha]) {
        costosPorFecha[fecha] = [];
      }
      costosPorFecha[fecha].push(costo);
    });

    // Mostrar costos agrupados por fecha
    Object.keys(costosPorFecha).sort().reverse().forEach(fecha => {
      const compras = costosPorFecha[fecha];
      let subtotal = 0;

      const card = document.createElement("div");
      card.className = "bg-white rounded-xl shadow-sm overflow-hidden mb-6";

      let comprasHTML = compras.map((c) => {
        subtotal += parseFloat(c.valor);
        return `
          <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 font-medium">${c.item}</td>
            <td class="px-6 py-4 text-green-600 font-semibold">$${parseFloat(c.valor).toLocaleString()}</td>
            <td class="px-6 py-4 text-gray-600">${c.descripcion || '-'}</td>
            <td class="px-6 py-4 text-center">
              <button onclick="eliminarCosto(${c.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-all">
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
          </table>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">${compras.length} compra(s)</span>
            <span class="text-lg font-bold text-green-600">Subtotal: $${subtotal.toLocaleString()}</span>
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });

    // Mostrar total general
    const totalCard = document.createElement("div");
    totalCard.className = "bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white";
    totalCard.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-green-100 text-sm">Total de todas las compras</p>
          <p class="text-3xl font-bold">$${result.total.toLocaleString()}</p>
        </div>
        <div class="text-green-200">
          <i class="fas fa-chart-line text-4xl"></i>
        </div>
      </div>
    `;
    contenedor.appendChild(totalCard);
    
  } catch (error) {
    console.error('Error cargando costos:', error);
    mostrarNotificacion("Error al cargar los costos", "error");
  }
}

async function eliminarCosto(id) {
  if (!confirm('¿Estás seguro de que quieres eliminar este costo?')) {
    return;
  }

  try {
    const response = await fetch(`/api/costos?id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar costo');
    }

    mostrarNotificacion("Costo eliminado exitosamente", "success");
    actualizarCostos();
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion("Error al eliminar el costo", "error");
  }
}
