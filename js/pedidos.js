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
    <section id="pedidos" class="seccion" style="transition: opacity 0.3s ease;">
      <!-- Formulario de nuevo pedido -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Nuevo Pedido</h2>
              <p class="text-sm text-gray-500">Registra una nueva venta</p>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-tag text-pink-500 mr-1"></i> Categoría
            </label>
            <select id="categoria" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white">
              <option value="">Selecciona una categoría</option>
              <option value="Lácteos">🥛 Lácteos</option>
              <option value="Panadería">🥖 Panadería</option>
              <option value="Otros">📦 Otros</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-box text-pink-500 mr-1"></i> Producto
            </label>
            <select id="producto" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white">
              <option value="">Selecciona un producto</option>
            </select>
          </div>

          <!-- Contenedor para opciones dinámicas (tamaño, sabor, tipo) -->
          <div id="opcionesEspecificas" class="hidden space-y-4 sm:col-span-2 lg:col-span-1">
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-hashtag text-pink-500 mr-1"></i> Cantidad
            </label>
            <div class="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:bg-white transition-all focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-100">
              <button type="button" onclick="cambiarCantidad(-1)" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors">
                <i class="fas fa-minus text-gray-600"></i>
              </button>
              <input type="number" id="cantidad" placeholder="0" class="flex-1 text-center border-0 py-3 bg-transparent focus:ring-0" min="1" value="1">
              <button type="button" onclick="cambiarCantidad(1)" class="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors">
                <i class="fas fa-plus text-gray-600"></i>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-dollar-sign text-green-500 mr-1"></i> Precio Total
            </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">$</span>
              <input type="number" id="precio" placeholder="0" class="w-full border-2 border-gray-200 rounded-xl pl-8 pr-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold cursor-not-allowed" readonly>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-calendar text-pink-500 mr-1"></i> Fecha
            </label>
            <input type="date" id="fecha" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white">
          </div>

          <div class="space-y-2 sm:col-span-2 lg:col-span-1">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-user text-pink-500 mr-1"></i> Cliente
            </label>
            <input type="text" id="cliente" placeholder="Nombre del cliente" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white">
          </div>
        </div>

        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button onclick="agregarPedido()" class="btn-primary flex-1 sm:flex-none">
            <i class="fas fa-plus"></i>
            Agregar Pedido
          </button>
          <button onclick="limpiarCampos()" class="btn-secondary px-6 py-3 flex items-center justify-center gap-2">
            <i class="fas fa-eraser"></i>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Lista de pedidos -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div class="px-4 sm:px-6 py-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-list-ul text-pink-500"></i>
            Pedidos Registrados
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg" id="totalPedidosCount">0 pedidos</span>
          </div>
        </div>
        
        <!-- Vista de escritorio -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full custom-table">
            <thead>
              <tr>
                <th class="px-4 lg:px-6 py-4 text-left">Fecha</th>
                <th class="px-4 lg:px-6 py-4 text-left">Cliente</th>
                <th class="px-4 lg:px-6 py-4 text-left">Categoría</th>
                <th class="px-4 lg:px-6 py-4 text-left">Producto</th>
                <th class="px-4 lg:px-6 py-4 text-center">Cant.</th>
                <th class="px-4 lg:px-6 py-4 text-right">Precio</th>
                <th class="px-4 lg:px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="tablaPedidos" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>
        
        <!-- Vista móvil de tarjetas -->
        <div class="sm:hidden" id="tablaPedidosMobile"></div>
      </div>
    </section>
  `;
  
  // Configurar event listeners
  configurarEventListenersPedidos();
  
  // Establecer fecha actual
  document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
}

// Función para cambiar cantidad con botones
function cambiarCantidad(delta) {
  const input = document.getElementById('cantidad');
  let valor = parseInt(input.value) || 1;
  valor = Math.max(1, valor + delta);
  input.value = valor;
  actualizarTotal();
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
    else if (producto === "Almuerzo") {
      setPrecioUnitario(PRECIOS.almuerzo);
    }
    else if (producto === "Almojábanas") {
      setPrecioUnitario(PRECIOS.almohabanas);
    }
    else if (producto === "Pulpa de avena") {
      setPrecioUnitario(PRECIOS.pulpaAvena);
    }
  });

  document.getElementById("cantidad").addEventListener("input", actualizarTotal);
}

function mostrarOpcionesYogurt() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">
          <i class="fas fa-ruler text-pink-500 mr-1"></i> Tamaño
        </label>
        <select id="tamañoYogurt" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white" onchange="actualizarPrecioYogurt()">
          <option value="">Selecciona tamaño</option>
          <option value="1L">🥛 1 Litro - $10,000</option>
          <option value="2L">🥛 2 Litros - $18,000</option>
        </select>
      </div>
      <div class="space-y-2">
        <label class="block text-sm font-semibold text-gray-700">
          <i class="fas fa-ice-cream text-pink-500 mr-1"></i> Sabor
        </label>
        <select id="saborYogurt" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white">
          <option value="">Selecciona sabor</option>
          ${yogurtSabores.map(s => `<option value="${s}">🍓 ${s}</option>`).join('')}
        </select>
      </div>
    </div>
  `;
}

function mostrarOpcionesQueso() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div class="space-y-2">
      <label class="block text-sm font-semibold text-gray-700">
        <i class="fas fa-cheese text-yellow-500 mr-1"></i> Tipo de Queso
      </label>
      <select id="tipoQueso" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white" onchange="setPrecioUnitario(${PRECIOS.queso})">
        <option value="">Selecciona tipo</option>
        ${tiposQueso.map(t => `<option value="${t}">🧀 ${t}</option>`).join('')}
      </select>
    </div>
  `;
}

function mostrarOpcionesEnvueltos() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div class="space-y-2">
      <label class="block text-sm font-semibold text-gray-700">
        <i class="fas fa-gift text-green-500 mr-1"></i> Tipo de Envuelto
      </label>
      <select id="tipoEnvueltos" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white" onchange="actualizarPrecioEnvueltos()">
        <option value="">Selecciona tipo</option>
        <option value="Normal">🌽 Normal - $2,000</option>
        <option value="Especial">⭐ Especial - $3,500</option>
      </select>
    </div>
  `;
}

function mostrarOpcionesArepas() {
  const opcionesDiv = document.getElementById("opcionesEspecificas");
  opcionesDiv.classList.remove("hidden");
  opcionesDiv.innerHTML = `
    <div class="space-y-2">
      <label class="block text-sm font-semibold text-gray-700">
        <i class="fas fa-circle text-amber-500 mr-1"></i> Tipo de Arepa
      </label>
      <select id="tipoArepas" class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white" onchange="actualizarPrecioArepas()">
        <option value="">Selecciona tipo</option>
        <option value="Boyacense">🌾 Boyacense - $3,000</option>
        <option value="de Chocolo">🌽 de Chocolo - $5,000</option>
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
  else if (producto === "Almuerzo") {
    document.getElementById("precio").value = PRECIOS.almuerzo * cantidad;
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
  else if (producto === "Pulpa de avena") {
    document.getElementById("precio").value = PRECIOS.pulpaAvena * cantidad;
  }
}

function eliminarPedido(index) {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  pedidos.splice(index, 1);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
  actualizarTablas();
  mostrarNotificacion("Pedido eliminado", "warning");
}

function actualizarTablas() {
  const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");
  const porFecha = pedidos.reduce((acc, p, index) => {
    acc[p.fecha] = acc[p.fecha] || [];
    acc[p.fecha].push({ ...p, index });
    return acc;
  }, {});

  const fechas = Object.keys(porFecha).sort((a, b) => b.localeCompare(a));

  // Actualizar contador
  const contadorElement = document.getElementById("totalPedidosCount");
  if (contadorElement) {
    contadorElement.textContent = `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}`;
  }

  // Vista de escritorio
  let htmlDesktop = "";
  // Vista móvil
  let htmlMobile = "";
  
  fechas.forEach(fecha => {
    // Fila de fecha para desktop
    htmlDesktop += `
      <tr class="bg-gradient-to-r from-pink-50 to-rose-50">
        <td colspan="7" class="px-4 lg:px-6 py-3">
          <div class="flex items-center gap-2 font-semibold text-pink-700">
            <i class="fas fa-calendar-alt"></i>
            <span>${formatearFecha(fecha)}</span>
            <span class="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full ml-2">${porFecha[fecha].length} pedido${porFecha[fecha].length > 1 ? 's' : ''}</span>
          </div>
        </td>
      </tr>
    `;
    
    // Separador de fecha para móvil
    htmlMobile += `
      <div class="bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-3 border-b border-pink-100">
        <div class="flex items-center gap-2 font-semibold text-pink-700">
          <i class="fas fa-calendar-alt"></i>
          <span>${formatearFecha(fecha)}</span>
          <span class="text-xs bg-pink-200 text-pink-800 px-2 py-0.5 rounded-full">${porFecha[fecha].length}</span>
        </div>
      </div>
    `;
    
    porFecha[fecha].forEach(p => {
      const categoriaColor = p.categoria === 'Lácteos' ? 'blue' : 
                            p.categoria === 'Panadería' ? 'amber' : 'gray';
      
      // Fila de pedido para desktop
      htmlDesktop += `
        <tr class="hover:bg-gray-50 transition-colors group">
          <td class="px-4 lg:px-6 py-4 text-gray-400 text-sm"></td>
          <td class="px-4 lg:px-6 py-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                ${p.cliente.charAt(0).toUpperCase()}
              </div>
              <span class="font-medium">${p.cliente}</span>
            </div>
          </td>
          <td class="px-4 lg:px-6 py-4">
            <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-${categoriaColor}-100 text-${categoriaColor}-700">
              ${p.categoria}
            </span>
          </td>
          <td class="px-4 lg:px-6 py-4 text-gray-700">${p.producto}</td>
          <td class="px-4 lg:px-6 py-4 text-center">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold text-sm">
              ${p.cantidad}
            </span>
          </td>
          <td class="px-4 lg:px-6 py-4 text-right">
            <span class="font-bold text-green-600">$${p.precio.toLocaleString()}</span>
          </td>
          <td class="px-4 lg:px-6 py-4 text-center">
            <button onclick="eliminarPedido(${p.index})" class="w-9 h-9 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
              <i class="fas fa-trash-alt text-sm"></i>
            </button>
          </td>
        </tr>
      `;
      
      // Tarjeta de pedido para móvil
      htmlMobile += `
        <div class="px-4 py-4 border-b border-gray-100">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                ${p.cliente.charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="font-semibold text-gray-800">${p.cliente}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${categoriaColor}-100 text-${categoriaColor}-700">
                  ${p.categoria}
                </span>
              </div>
            </div>
            <button onclick="eliminarPedido(${p.index})" class="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Producto</span>
              <span class="font-medium text-sm text-gray-800">${p.producto}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-500 text-sm">Cantidad</span>
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-700 font-bold text-xs">
                ${p.cantidad}
              </span>
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
              <span class="text-gray-500 text-sm font-medium">Total</span>
              <span class="font-bold text-green-600">$${p.precio.toLocaleString()}</span>
            </div>
          </div>
        </div>
      `;
    });
  });

  const emptyState = `
    <tr>
      <td colspan="7" class="text-center py-16">
        <div class="flex flex-col items-center gap-4">
          <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <i class="fas fa-shopping-cart text-3xl text-gray-300"></i>
          </div>
          <div>
            <p class="text-gray-500 font-medium">No hay pedidos registrados</p>
            <p class="text-gray-400 text-sm">Comienza agregando tu primer pedido</p>
          </div>
        </div>
      </td>
    </tr>
  `;
  
  const emptyStateMobile = `
    <div class="text-center py-12 px-4">
      <div class="flex flex-col items-center gap-4">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <i class="fas fa-shopping-cart text-2xl text-gray-300"></i>
        </div>
        <div>
          <p class="text-gray-500 font-medium">No hay pedidos registrados</p>
          <p class="text-gray-400 text-sm">Comienza agregando tu primer pedido</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("tablaPedidos").innerHTML = htmlDesktop || emptyState;
  
  const tablaMobile = document.getElementById("tablaPedidosMobile");
  if (tablaMobile) {
    tablaMobile.innerHTML = htmlMobile || emptyStateMobile;
  }
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