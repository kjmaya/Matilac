// js/database-client.js - Cliente para la nueva base de datos PostgreSQL
class DatabaseClient {
  constructor() {
    this.baseUrl = '/api';
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Conexión restaurada');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Conexión perdida');
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }

  // === PRODUCTOS ===
  async getProductos(categoriaId = null, incluirVariantes = false) {
    const params = new URLSearchParams();
    if (categoriaId) params.set('categoria_id', categoriaId);
    if (incluirVariantes) params.set('incluir_variantes', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/productos${query}`);
  }

  async getProducto(id) {
    return this.request(`/productos?id=${id}&incluir_variantes=true`);
  }

  async crearProducto(producto) {
    return this.request('/productos', {
      method: 'POST',
      body: producto
    });
  }

  async actualizarProducto(id, producto) {
    return this.request(`/productos?id=${id}`, {
      method: 'PUT',
      body: producto
    });
  }

  async eliminarProducto(id) {
    return this.request(`/productos?id=${id}`, {
      method: 'DELETE'
    });
  }

  // === CATEGORÍAS ===
  async getCategorias(incluirProductos = false) {
    const query = incluirProductos ? '?incluir_productos=true' : '';
    return this.request(`/categorias${query}`);
  }

  async getCategoria(id) {
    return this.request(`/categorias?id=${id}`);
  }

  async crearCategoria(categoria) {
    return this.request('/categorias', {
      method: 'POST',
      body: categoria
    });
  }

  async actualizarCategoria(id, categoria) {
    return this.request(`/categorias?id=${id}`, {
      method: 'PUT',
      body: categoria
    });
  }

  async eliminarCategoria(id) {
    return this.request(`/categorias?id=${id}`, {
      method: 'DELETE'
    });
  }

  // === PEDIDOS ===
  async getPedidos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fecha) params.set('fecha', filtros.fecha);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (filtros.cliente_id) params.set('cliente_id', filtros.cliente_id);
    if (filtros.incluir_detalles) params.set('incluir_detalles', 'true');
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/pedidos${query}`);
  }

  async getPedido(id) {
    return this.request(`/pedidos?id=${id}&incluir_detalles=true`);
  }

  async crearPedido(pedido) {
    return this.request('/pedidos', {
      method: 'POST',
      body: pedido
    });
  }

  async actualizarPedido(id, updates) {
    return this.request(`/pedidos?id=${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  async cancelarPedido(id) {
    return this.request(`/pedidos?id=${id}`, {
      method: 'DELETE'
    });
  }

  // === COSTOS ===
  async getCostos(filtros = {}) {
    const params = new URLSearchParams();
    if (filtros.fecha_inicio) params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.set('fecha_fin', filtros.fecha_fin);
    if (filtros.mes) params.set('mes', filtros.mes);
    if (filtros.ano) params.set('ano', filtros.ano);
    if (filtros.categoria_costo) params.set('categoria_costo', filtros.categoria_costo);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/costos${query}`);
  }

  async getCosto(id) {
    return this.request(`/costos?id=${id}`);
  }

  async crearCosto(costo) {
    return this.request('/costos', {
      method: 'POST',
      body: costo
    });
  }

  async actualizarCosto(id, costo) {
    return this.request(`/costos?id=${id}`, {
      method: 'PUT',
      body: costo
    });
  }

  async eliminarCosto(id) {
    return this.request(`/costos?id=${id}`, {
      method: 'DELETE'
    });
  }

  // === UTILIDADES ===
  async verificarConexion() {
    try {
      return await this.request('/config');
    } catch (error) {
      return { database_configured: false, error: error.message };
    }
  }

  // Formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Formatear fecha
  formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  // Formatear fecha y hora
  formatearFechaHora(fecha) {
    return new Date(fecha).toLocaleString('es-CO');
  }
}

// Crear instancia global
const dbClient = new DatabaseClient();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatabaseClient;
}
