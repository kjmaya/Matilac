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

  if (producto === "Arepas") {
    const tipo = document.getElementById("tipoArepas").value;
    if (!tipo) {
      mostrarNotificacion("Selecciona tipo de arepa", "error");
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
}

// Funciones para la gestión de pedidos
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

          <!-- Contenedor para opciones dinámicas (tamaño, sabor, tipo) -->
          <div id="opcionesEspecificas" class="hidden">
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
    limpiarOpcionesEspecificas();
  });

  document.getElementById("producto").addEventListener("change", function () {
    const producto = this.value;
    const opcionesDiv = document.getElementById("opcionesEspecificas");
    opcionesDiv.innerHTML = "";
    opcionesDiv.classList.add("hidden");
    document.getElementById("precio").value = "";

    if (producto === "Yogurt") {
      mostrarOpcionesYogurt();
    }
    else if (producto === "Queso") {
      mostrarOpcionesQueso();
    }
    else if (producto === "Envueltos") {
      mostrarOpcionesEnvueltos();
    }
    else if (producto === "Arepas") {
      mostrarOpcionesArepas();
    }
    else if (producto === "Rellenas") {
      setPrecioUnitario(PRECIOS.rellenas);
    }
    else if (producto === "Panela") {
      setPrecioUnitario(PRECIOS.panela);
    }
    else if (producto === "Huevos") {
      setPrecioUnitario(PRECIOS.huevos);
    }
    else if (producto === "Longaniza") {
      setPrecioUnitario(PRECIOS.longaniza);
    }
    else if (producto === "Almojábanas") {
      setPrecioUnitario(PRECIOS.almohabanas);
    }
    else if (producto === "Pulpa de avena") {
      // Agregar precio si lo tienes definido en PRECIOS
      // setPrecioUnitario(PRECIOS.pulpaAvena);
    }
  });

  document.getElementById("cantidad").addEventListener("input", actualizarTotal);
}

function mostrarOpcionesYogurt() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
      <select id="tamañoYogurt" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" onchange="actualizarPrecioYogurt()">
        <option value="">Selecciona tamaño</option>
        <option value="1L">1 Litro - $10,000</option>
        <option value="2L">2 Litros - $18,000</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Sabor</label>
      <select id="saborYogurt" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all">
        <option value="">Selecciona sabor</option>
        ${yogurtSabores.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
  `;
}

function mostrarOpcionesQueso() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Queso</label>
      <select id="tipoQueso" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" onchange="setPrecioUnitario(${PRECIOS.queso})">
        <option value="">Selecciona tipo</option>
        ${tiposQueso.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
  `;
}

function mostrarOpcionesEnvueltos() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Envuelto</label>
      <select id="tipoEnvueltos" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" onchange="actualizarPrecioEnvueltos()">
        <option value="">Selecciona tipo</option>
        <option value="Normal">Normal - $2,000</option>
        <option value="Especial">Especial - $3,500</option>
      </select>
    </div>
  `;
}

function mostrarOpcionesArepas() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Arepa</label>
      <select id="tipoArepas" class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all" onchange="actualizarPrecioArepas()">
        <option value="">Selecciona tipo</option>
        <option value="Boyacense">Boyacense - $4,000</option>
        <option value="de Chocolo">de Chocolo - $5,000</option>
      </select>
    </div>
  `;
}

// Función para establecer precio unitario y calcular total
function setPrecioUnitario(precioUnitario) {
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
  const total = precioUnitario * cantidad;
  document.getElementById("precio").value = total;
}

// Función para actualizar precio del yogurt
function actualizarPrecioYogurt() {
  const tamaño = document.getElementById("tamañoYogurt").value;
  if (tamaño) {
    const precio = PRECIOS.yogurt[tamaño];
    setPrecioUnitario(precio);
  }
}

// Función para actualizar precio de envueltos
function actualizarPrecioEnvueltos() {
  const tipo = document.getElementById("tipoEnvueltos").value;
  if (tipo) {
    const precio = PRECIOS.envueltos[tipo];
    setPrecioUnitario(precio);
  }
}

// Función para actualizar precio de arepas
function actualizarPrecioArepas() {
  const tipo = document.getElementById("tipoArepas").value;
  if (tipo) {
    const precio = PRECIOS.arepas[tipo];
    setPrecioUnitario(precio);
  }
}

// Función para actualizar total cuando cambia la cantidad
function actualizarTotal() {
  const producto = document.getElementById("producto").value;
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;

  if (producto === "Yogurt") {
    const tamaño = document.getElementById("tamañoYogurt").value;
    if (tamaño) {
      const precio = PRECIOS.yogurt[tamaño];
      document.getElementById("precio").value = precio * cantidad;
    }
  } 
  else if (producto === "Envueltos") {
    const tipo = document.getElementById("tipoEnvueltos").value;
    if (tipo) {
      const precio = PRECIOS.envueltos[tipo];
      document.getElementById("precio").value = precio * cantidad;
    }
  }
  else if (producto === "Arepas") {
    const tipo = document.getElementById("tipoArepas").value;
    if (tipo) {
      const precio = PRECIOS.arepas[tipo];
      document.getElementById("precio").value = precio * cantidad;
    }
  }
  else if (producto === "Queso") {
    document.getElementById("precio").value = PRECIOS.queso * cantidad;
  }
  else if (producto === "Huevos") {
    document.getElementById("precio").value = PRECIOS.huevos * cantidad;
  } 
  else if (producto === "Longaniza") {
    document.getElementById("precio").value = PRECIOS.longaniza * cantidad;
  } 
  else if (producto === "Almojábanas") {
    document.getElementById("precio").value = PRECIOS.almohabanas * cantidad;
  } 
  else if (producto === "Rellenas") {
    document.getElementById("precio").value = PRECIOS.rellenas * cantidad;
  }
  else if (producto === "Panela") {
    document.getElementById("precio").value = PRECIOS.panela * cantidad;
  }
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
  limpiarOpcionesEspecificas();
}

function limpiarOpcionesEspecificas() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  if (opcionesDiv) {
    opcionesDiv.innerHTML = "";
    opcionesDiv.classList.add("hidden");
  }
}