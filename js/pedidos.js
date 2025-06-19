function agregarPedido() {
  const categoria = document.getElementById("categoria").value;
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseInt(document.getElementById("precio").value);
  const fecha = document.getElementById("fecha").value;
  const cliente = document.getElementById("cliente").value;

  if (!categoria || !producto || !cantidad || !precio || !fecha || !cliente) {
    mostrarNotificacion("Por favor completa todos los campos", "error");
    return;
  }

  let detalle = producto;

  if (producto === "Yogurt") {
    const tamaño = document.getElementById("tamañoYogurt").value;
    const sabor = document.getElementById("saborYogurt").value;
    if (!tamaño || !sabor) {
      mostrarNotificacion("Selecciona tamaño y sabor del yogurt", "error");
      return;
    }
    detalle += ` ${tamaño} de ${sabor}`;
  }

  if (producto === "Queso") {
    const tipo = document.getElementById("tipoQueso").value;
    if (!tipo) {
      mostrarNotificacion("Selecciona tipo de queso", "error");
      return;
    }
    detalle += ` ${tipo}`;
  }

  if (producto === "Envueltos") {
    const tipo = document.getElementById("tipoEnvueltos").value;
    if (!tipo) {
      mostrarNotificacion("Selecciona tipo de envuelto", "error");
      return;
    }
    detalle += ` ${tipo}`;
  }

  const pedido = { categoria, producto: detalle, cantidad, precio, fecha, cliente };

  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  
  mostrarNotificacion("Pedido agregado exitosamente", "success");
  actualizarTablas();
  limpiarCampos();
}// Funciones para la gestión de pedidos
function cargarSeccionPedidos() {
  const seccionPedidos = document.getElementById('seccion-pedidos');
  
  seccionPedidos.innerHTML = `
    <section id="pedidos" class="seccion">
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <i class="fas fa-shopping-cart text-pink-500"></i>
          Nuevo Pedido
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select id="categoria" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
              <option value="">Selecciona una categoría</option>
              <option value="Lácteos">🥛 Lácteos</option>
              <option value="Panadería">🥖 Panadería</option>
              <option value="Otros">📦 Otros</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Producto</label>
            <select id="producto" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
              <option value="">Selecciona un producto</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
            <input type="number" id="cantidad" placeholder="0" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" min="1" value="1">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Total</label>
            <input type="number" id="precio" placeholder="$0" class="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 cursor-not-allowed" readonly>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input type="date" id="fecha" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <input type="text" id="cliente" placeholder="Nombre del cliente" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
          </div>
        </div>

        <!-- Extras dinámicos -->
        <div id="opcionesExtras" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 hidden"></div>

        <button onclick="agregarPedido()" class="btn-primary mt-6">
          <i class="fas fa-plus mr-2"></i>
          Agregar Pedido
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i class="fas fa-list"></i>
            Pedidos Registrados
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full custom-table">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left">Fecha</th>
                <th class="px-6 py-3 text-left">Cliente</th>
                <th class="px-6 py-3 text-left">Categoría</th>
                <th class="px-6 py-3 text-left">Producto</th>
                <th class="px-6 py-3 text-center">Cantidad</th>
                <th class="px-6 py-3 text-right">Precio</th>
                <th class="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="tablaPedidos" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
      </div>
    </section>
  `;
  
  // Configurar event listeners
  configurarEventListenersPedidos();
  
  // Establecer fecha actual
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
}

function configurarEventListenersPedidos() {
  document.getElementById("categoria").addEventListener("change", function () {
    const productos = productosPorCategoria[this.value] || [];
    const select = document.getElementById("producto");
    select.innerHTML = '<option value="">Selecciona un producto</option>' +
      productos.map(p => `<option value="${p}">${p}</option>`).join('');
    limpiarExtras();
  });

  document.getElementById("producto").addEventListener("change", function () {
    const producto = this.value;
    const extras = document.getElementById("opcionesExtras");
    extras.innerHTML = "";
    extras.classList.add("hidden");
    document.getElementById("precio").value = "";

    if (producto === "Yogurt") {
      extras.classList.remove("hidden");
      extras.innerHTML = `
        <select id="tamañoYogurt" class="border rounded px-3 py-2" onchange="actualizarPrecioYogurt()">
          <option value="">Selecciona tamaño</option>
          <option value="1L">1 Litro - $10000</option>
          <option value="2L">2 Litros - $18000</option>
        </select>
        <select id="saborYogurt" class="border rounded px-3 py-2">
          <option value="">Selecciona sabor</option>
          ${yogurtSabores.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      `;
    }
    else if (producto === "Queso") {
      extras.classList.remove("hidden");
      extras.innerHTML = `
        <select id="tipoQueso" class="border rounded px-3 py-2" onchange="setPrecioUnitario(${PRECIOS.queso})">
          <option value="">Selecciona tipo de queso</option>
          ${tiposQueso.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      `;
      setPrecioUnitario(PRECIOS.queso);
    }
    else if (producto === "Envueltos") {
      extras.classList.remove("hidden");
      extras.innerHTML = `
        <select id="tipoEnvueltos" class="border rounded px-3 py-2" onchange="actualizarPrecioEnvueltos()">
          <option value="">Selecciona tipo</option>
          <option value="Normal">Normal - $2000</option>
          <option value="Especial">Especial - $3500</option>
        </select>
      `;
    }
    else if (producto === "Rellenas") {
      setPrecioUnitario(PRECIOS.rellenas);
    }
    else if (producto === "Panela") {
      setPrecioUnitario(PRECIOS.panela);
    }
  });

  document.getElementById("cantidad").addEventListener("input", actualizarTotal);
}

function agregarPedido() {
  const categoria = document.getElementById("categoria").value;
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value);
  const precio = parseInt(document.getElementById("precio").value);
  const fecha = document.getElementById("fecha").value;
  const cliente = document.getElementById("cliente").value;

  if (!categoria || !producto || !cantidad || !precio || !fecha || !cliente) {
    return alert("Completa todos los campos");
  }

  let detalle = producto;

  if (producto === "Yogurt") {
    const tamaño = document.getElementById("tamañoYogurt").value;
    const sabor = document.getElementById("saborYogurt").value;
    if (!tamaño || !sabor) return alert("Selecciona tamaño y sabor del yogurt");
    detalle += ` ${tamaño} de ${sabor}`;
  }

  if (producto === "Queso") {
    const tipo = document.getElementById("tipoQueso").value;
    if (!tipo) return alert("Selecciona tipo de queso");
    detalle += ` ${tipo}`;
  }

  if (producto === "Envueltos") {
    const tipo = document.getElementById("tipoEnvueltos").value;
    if (!tipo) return alert("Selecciona tipo de envuelto");
    detalle += ` ${tipo}`;
  }

  const pedido = { categoria, producto: detalle, cantidad, precio, fecha, cliente };

  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  actualizarTablas();
  limpiarCampos();
}

function eliminarPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  pedidos.splice(index, 1);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  actualizarTablas();
}

function actualizarTablas() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const porFecha = pedidos.reduce((acc, p, index) => {
    acc[p.fecha] = acc[p.fecha] || [];
    acc[p.fecha].push({ ...p, index });
    return acc;
  }, {});

  const fechas = Object.keys(porFecha).sort((a, b) => b.localeCompare(a));

  let html = "";
  fechas.forEach(fecha => {
    html += `
      <tr class="bg-gradient-to-r from-pink-50 to-rose-50">
        <td colspan="7" class="px-6 py-3 font-semibold text-pink-700">
          <i class="fas fa-calendar mr-2"></i>${formatearFecha(fecha)}
        </td>
      </tr>
    `;
    porFecha[fecha].forEach(p => {
      html += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="px-6 py-4"></td>
          <td class="px-6 py-4 font-medium">${p.cliente}</td>
          <td class="px-6 py-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              p.categoria === 'Lácteos' ? 'bg-blue-100 text-blue-800' : 
              p.categoria === 'Panadería' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-gray-100 text-gray-800'
            }">
              ${p.categoria}
            </span>
          </td>
          <td class="px-6 py-4">${p.producto}</td>
          <td class="px-6 py-4 text-center">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-semibold text-sm">
              ${p.cantidad}
            </span>
          </td>
          <td class="px-6 py-4 text-right font-semibold text-green-600">${p.precio.toLocaleString()}</td>
          <td class="px-6 py-4 text-center">
            <button onclick="eliminarPedido(${p.index})" class="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded transition-all">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  });

  document.getElementById("tablaPedidos").innerHTML = html || '<tr><td colspan="7" class="text-center py-12 text-gray-500">No hay pedidos registrados</td></tr>';
}

function formatearFecha(fechaISO) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString('es-CO');
}

function limpiarCampos() {
  document.getElementById("categoria").value = "";
  document.getElementById("producto").innerHTML = '<option value="">Selecciona un producto</option>';
  document.getElementById("cantidad").value = 1;
  document.getElementById("precio").value = "";
  document.getElementById("fecha").value = "";
  document.getElementById("cliente").value = "";
  limpiarExtras();
}