// js/simple-sync.js - Sistema de sincronización para Vercel
class MatilacSync {
  constructor() {
    this.config = null;
    this.fileName = 'matilac-data.json';
    this.isOnline = navigator.onLine;
    
    this.setupEventListeners();
    this.initializeConfig();
  }

  // Inicializar configuración desde la API
  async initializeConfig() {
    try {
      // Obtener configuración desde la función serverless
      const response = await fetch('/api/config');
      
      if (response.ok) {
        this.config = await response.json();
        this.apiUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.fileName}`;
        
        await this.initializeData();
        this.showNotification("🔗 Sincronización configurada automáticamente", "success");
      } else {
        console.log('No se pudo obtener configuración del servidor');
        this.showNotification("Trabajando sin sincronización automática", "info");
      }
    } catch (error) {
      console.log('Error obteniendo configuración:', error);
      this.showNotification("Trabajando offline", "info");
    }
  }

  // Configurar listeners para eventos online/offline
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification("Conexión restaurada. Sincronizando...", "info");
      if (this.config) {
        this.uploadToGitHub();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification("Sin conexión. Guardando localmente.", "warning");
    });
  }

  // Inicializar datos al cargar la aplicación
  async initializeData() {
    if (this.isOnline && this.config) {
      try {
        await this.downloadFromGitHub();
        this.showNotification("📱 Datos sincronizados desde la nube", "success");
      } catch (error) {
        console.log("Error al sincronizar:", error);
        this.showNotification("Usando datos locales", "info");
      }
    }
  }

  // Descargar datos desde GitHub
  async downloadFromGitHub() {
    if (!this.config) return;
    
    try {
      const response = await fetch(this.apiUrl, {
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        
        // Actualizar localStorage con datos de GitHub
        localStorage.setItem('pedidos', JSON.stringify(content.pedidos || []));
        localStorage.setItem('costos', JSON.stringify(content.costos || {}));
        localStorage.setItem('lastSync', new Date().toISOString());
        
        this.sha = data.sha; // Necesario para futuras actualizaciones
        
        // Actualizar la interfaz
        this.updateUI();
        
      } else if (response.status === 404) {
        // El archivo no existe, crear uno inicial
        await this.createInitialFile();
      } else if (response.status === 401) {
        this.showNotification("❌ Error de autenticación con GitHub", "error");
      } else {
        throw new Error(`Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading from GitHub:', error);
      throw error;
    }
  }

  // Crear archivo inicial en GitHub
  async createInitialFile() {
    if (!this.config) return;
    
    const initialData = {
      pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
      costos: JSON.parse(localStorage.getItem('costos') || '{}'),
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      const content = btoa(JSON.stringify(initialData, null, 2));
      
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Crear archivo inicial de datos Matilac',
          content: content
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sha = data.content.sha;
        this.showNotification("📁 Archivo inicial creado en GitHub", "success");
      }
    } catch (error) {
      console.error('Error creating initial file:', error);
    }
  }

  // Subir datos a GitHub
  async uploadToGitHub() {
    if (!this.isOnline || !this.config) return false;

    try {
      const currentData = {
        pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
        costos: JSON.parse(localStorage.getItem('costos') || '{}'),
        lastSync: new Date().toISOString(),
        version: '1.0.0'
      };

      const content = btoa(JSON.stringify(currentData, null, 2));

      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Actualizar datos Matilac - ${new Date().toLocaleString('es-ES')}`,
          content: content,
          sha: this.sha
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sha = data.content.sha;
        localStorage.setItem('lastSync', new Date().toISOString());
        this.showNotification("☁️ Datos guardados en la nube", "success");
        return true;
      } else if (response.status === 401) {
        this.showNotification("❌ Error de autenticación", "error");
      } else {
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      this.showNotification("Error al sincronizar. Guardado localmente.", "error");
    }
    return false;
  }

  // Actualizar interfaz
  updateUI() {
    if (typeof actualizarTablas === 'function') actualizarTablas();
    if (typeof actualizarCostos === 'function') actualizarCostos();
    if (typeof actualizarInventario === 'function') actualizarInventario();
  }

  // Sincronizar después de agregar pedido
  async syncAfterPedido() {
    if (this.isOnline && this.config) {
      await this.uploadToGitHub();
    }
  }

  // Sincronizar después de agregar costo
  async syncAfterCosto() {
    if (this.isOnline && this.config) {
      await this.uploadToGitHub();
    }
  }

  // Sincronización manual
  async manualSync() {
    if (!this.config) {
      this.showNotification("❌ Sincronización no configurada", "error");
      return;
    }

    if (!this.isOnline) {
      this.showNotification("❌ Sin conexión a internet", "error");
      return;
    }

    try {
      this.showNotification("🔄 Sincronizando...", "info");
      await this.downloadFromGitHub();
      await this.uploadToGitHub();
      this.showNotification("✅ Sincronización completa", "success");
    } catch (error) {
      this.showNotification("❌ Error en la sincronización", "error");
    }
  }

  // Mostrar notificación
  showNotification(mensaje, tipo = 'info') {
    if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion(mensaje, tipo);
    } else {
      console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
    }
  }

  // Obtener estado de sincronización
  getSyncStatus() {
    const lastSync = localStorage.getItem('lastSync');
    return {
      isOnline: this.isOnline,
      lastSync: lastSync ? new Date(lastSync).toLocaleString('es-ES') : 'Nunca',
      configured: !!this.config
    };
  }

  // Obtener información de configuración
  getConfigInfo() {
    if (!this.config) return 'No configurado';
    return `${this.config.owner}/${this.config.repo}`;
  }
}

// Variables globales
let matilacSync = null;

// Modificar funciones existentes para incluir sincronización
function setupSyncHooks() {
  const originalAgregarPedido = window.agregarPedido;
  if (originalAgregarPedido) {
    window.agregarPedido = async function() {
      const result = originalAgregarPedido.apply(this, arguments);
      if (matilacSync && result !== false) {
        setTimeout(() => matilacSync.syncAfterPedido(), 500);
      }
      return result;
    };
  }

  const originalAgregarCosto = window.agregarCosto;
  if (originalAgregarCosto) {
    window.agregarCosto = async function() {
      const result = originalAgregarCosto.apply(this, arguments);
      if (matilacSync && result !== false) {
        setTimeout(() => matilacSync.syncAfterCosto(), 500);
      }
      return result;
    };
  }
}

// Agregar botón de sincronización
function addSyncButton() {
  const header = document.querySelector('header .flex.items-center.gap-4');
  if (header && !document.getElementById('sync-button')) {
    const syncButton = document.createElement('button');
    syncButton.id = 'sync-button';
    syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
    syncButton.className = 'p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm';
    syncButton.title = 'Sincronizar con la nube';
    syncButton.onclick = () => matilacSync?.manualSync();
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'sync-status';
    statusDiv.className = 'text-xs text-gray-500 text-center';
    
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center gap-1';
    container.appendChild(syncButton);
    container.appendChild(statusDiv);
    
    header.insertBefore(container, header.lastElementChild);
    
    setInterval(updateSyncStatus, 5000);
  }
}

// Actualizar estado de sincronización
function updateSyncStatus() {
  const statusDiv = document.getElementById('sync-status');
  const syncButton = document.getElementById('sync-button');
  
  if (matilacSync && statusDiv && syncButton) {
    const status = matilacSync.getSyncStatus();
    
    if (!status.configured) {
      statusDiv.textContent = 'Local';
      syncButton.className = syncButton.className.replace(/bg-\w+-500/g, 'bg-gray-500');
    } else if (status.isOnline) {
      statusDiv.textContent = 'Cloud';
      syncButton.className = syncButton.className.replace(/bg-\w+-500/g, 'bg-green-500');
    } else {
      statusDiv.textContent = 'Offline';
      syncButton.className = syncButton.className.replace(/bg-\w+-500/g, 'bg-orange-500');
    }
  }
}

// Inicializar sistema de sincronización
function initializeMatilacSync() {
  try {
    matilacSync = new MatilacSync();
    setupSyncHooks();
    addSyncButton();
    updateSyncStatus();
    
    console.log('🔗 Matilac Sync inicializado con Vercel');
  } catch (error) {
    console.error('Error inicializando sync:', error);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeMatilacSync, 1500);
});

// Exportar para uso global
window.matilacSync = matilacSync;