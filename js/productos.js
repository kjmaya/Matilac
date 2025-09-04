// Funciones relacionadas con productos
let precioUnitario = 0;

async function cargarSeccionInicio() {
  const seccionInicio = document.getElementById('seccion-inicio');
  
  try {
    // Cargar estadísticas desde la base de datos
    const [pedidosData, costosData, productosData] = await Promise.all([
      dbClient.getPedidos({ fecha: new Date().toISOString().split('T')[0] }),
      dbClient.getCostos({ 
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date().toISOString().split('T')[0]
      }),
      dbClient.getProductos()
    ]);
    
    const pedidosHoy = pedidosData.pedidos || [];
    const costosHoy = costosData.costos || [];
    
    let totalIngresos = 0;
    let totalGastos = 0;
    
    pedidosHoy.forEach(p => totalIngresos += parseFloat(p.total || 0));
    costosHoy.forEach(c => totalGastos += parseFloat(c.valor || 0));
    
    const balance = totalIngresos - totalGastos;
    
    // Crear cards de productos desde la base de datos
    let productosHTML = '';
    if (productosData.productos && productosData.productos.length > 0) {
      productosHTML = productosData.productos.slice(0, 6).map((producto, index) => `
        <div class="card-hover bg-white rounded-xl shadow-lg overflow-hidden" style="animation-delay: ${index * 0.1}s">
          <div class="relative h-48 overflow-hidden">
            <img src="${producto.imagen_url || generatePlaceholderImage(producto.nombre)}" 
                 alt="${producto.nombre}" 
                 class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                 onerror="handleImageError(this, '${producto.nombre}')">
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <h3 class="absolute bottom-4 left-4 text-white font-bold text-xl">${producto.nombre}</h3>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-600 line-clamp-2">${producto.descripcion || 'Producto disponible'}</p>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-full">
                ${producto.categoria_nombre || 'Producto'}
              </span>
              <span class="text-sm font-semibold text-gray-800">
                ${dbClient.formatearPrecio(producto.precio_base)}
              </span>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      productosHTML = `
        <div class="col-span-full text-center py-8">
          <i class="fas fa-box-open text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">No hay productos disponibles</p>
        </div>
      `;
    }
    
    seccionInicio.innerHTML = `
      <section id="inicio" class="seccion">
        <!-- Tarjetas de estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-blue-100 text-sm">Pedidos Hoy</p>
                <p class="text-3xl font-bold mt-1">${pedidosHoy.length}</p>
              </div>
              <i class="fas fa-shopping-cart text-3xl opacity-50"></i>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Ingresos Hoy</p>
                <p class="text-3xl font-bold mt-1">${dbClient.formatearPrecio(totalIngresos)}</p>
              </div>
              <i class="fas fa-dollar-sign text-3xl opacity-50"></i>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-red-100 text-sm">Gastos Hoy</p>
                <p class="text-3xl font-bold mt-1">${dbClient.formatearPrecio(totalGastos)}</p>
              </div>
              <i class="fas fa-credit-card text-3xl opacity-50"></i>
            </div>
          </div>
          
          <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Balance</p>
                <p class="text-3xl font-bold mt-1">${dbClient.formatearPrecio(balance)}</p>
              </div>
              <i class="fas fa-chart-line text-3xl opacity-50"></i>
            </div>
          </div>
        </div>

        <!-- Encabezado de productos -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Nuestros Productos</h2>
          <button onclick="mostrarSeccion('pedidos')" class="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors">
            Hacer Pedido
          </button>
        </div>

        <!-- Grid de productos -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${productosHTML}
        </div>
      </section>
    `;
  } catch (error) {
    console.error('Error cargando sección inicio:', error);
    seccionInicio.innerHTML = `
      <section id="inicio" class="seccion">
        <div class="text-center py-8">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
          <p class="text-red-600">Error cargando datos. Por favor, recarga la página.</p>
        </div>
      </section>
    `;
    mostrarNotificacion('Error cargando datos', 'error');
  }
}

function setPrecioUnitario(valor) {
  precioUnitario = valor;
  actualizarTotal();
}

function actualizarPrecioYogurt() {
  const tamaño = document.getElementById("tamañoYogurt")?.value;
  if (tamaño === "1L") setPrecioUnitario(PRECIOS.yogurt["1L"]);
  else if (tamaño === "2L") setPrecioUnitario(PRECIOS.yogurt["2L"]);
}

function actualizarPrecioEnvueltos() {
  const tipo = document.getElementById("tipoEnvueltos")?.value;
  if (tipo === "Normal") setPrecioUnitario(PRECIOS.envueltos["Normal"]);
  else if (tipo === "Especial") setPrecioUnitario(PRECIOS.envueltos["Especial"]);
}

function actualizarTotal() {
  const cantidadElement = document.getElementById("cantidad");
  const precioElement = document.getElementById("precio");
  
  if (cantidadElement && precioElement) {
    const cantidad = parseInt(cantidadElement.value) || 0;
    precioElement.value = precioUnitario * cantidad;
  }
}

function limpiarExtras() {
  precioUnitario = 0;
  const opcionesExtras = document.getElementById("opcionesExtras");
  const precio = document.getElementById("precio");
  
  if (opcionesExtras) {
    opcionesExtras.innerHTML = "";
    opcionesExtras.classList.add("hidden");
  }
  
  if (precio) {
    precio.value = "";
  }
}

// Funciones helper para imágenes placeholder
function generatePlaceholderImage(productName) {
  // Generar una imagen SVG placeholder usando data URI
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  const color = colors[Math.abs(hashCode(productName)) % colors.length];
  const initials = productName.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white">
        ${initials}
      </text>
      <text x="50%" y="70%" dominant-baseline="central" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="12" fill="white" opacity="0.8">
        ${productName}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function handleImageError(img, productName) {
  // Evitar loops infinitos
  if (img.src.startsWith('data:image/svg+xml')) {
    console.log('Imagen placeholder ya cargada para:', productName);
    return;
  }
  
  img.src = generatePlaceholderImage(productName);
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32-bit integer
  }
  return hash;
}