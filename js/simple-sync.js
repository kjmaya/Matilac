// simple-sync.js - Sistema de sincronización simplificado con GitHub
class MatilacSync {
  constructor() {
    // CONFIGURACIÓN - Cambia estos valores por los tuyos
    this.owner = 'kjmaya';  // Tu usuario de GitHub
    this.repo = 'matilac-data';  // Nombre del repositorio
    this.token = 'TU_TOKEN_AQUI';  // Tu Personal Access Token
    this.fileName = 'matilac-data.json';
    this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${this.fileName}`;
    
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
    this.initializeData();
  }

  // Configurar listeners para eventos online/offline
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.showNotification("Conexión restaurada. Sincronizando...", "info");
      this.syncToCloud();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showNotification("Sin conexión. Los datos se guardarán localmente.", "warning");
    });
  }

  // Inicializar datos al cargar la aplicación
  async initializeData() {
    if (this.isOnline && this.token !== 'TU_TOKEN_AQUI') {
      try {
        await this.downloadFromGitHub();
        this.showNotification("Datos sincronizados desde la nube", "success");
      } catch (error) {
        console.log("Error al sincronizar, usando datos locales:", error);
        this.showNotification("Usando datos locales", "info");
      }
    } else {
      this.showNotification("Trabajando sin conexión", "info");
    }
  }

  // Descargar datos desde GitHub
  async downloadFromGitHub() {
    try {
      const response = await fetch(this.apiUrl, {
        headers: {
          'Authorization': `token ${this.token}`,
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
    const initialData = {
      pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
      costos: JSON.parse(localStorage.getItem('costos') || '{}'),
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };

    const content = btoa(JSON.stringify(initialData, null, 2));

    try {
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${this.token}`,
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
        this.showNotification("Archivo inicial creado en GitHub", "success");
      } else {
        throw new Error('No se pudo crear el archivo inicial');
      }
    } catch (error) {
      console.error('Error creating initial file:', error);
      throw error;
    }
  }

  // Subir datos a GitHub
  async uploadToGitHub() {
    if (!this.isOnline || this.token === 'TU_TOKEN_AQUI') {
      return false;
    }

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
          'Authorization': `token ${this.token}`,
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
        this.showNotification("✅ Datos guardados en la nube", "success");
        return true;
      } else {
        throw new Error(`Error al subir: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading to GitHub:', error);
      this.showNotification("Error al sincronizar. Datos guardados localmente.", "error");
      return false;
    }
  }

  // Actualizar interfaz después de sincronizar
  updateUI() {
    if (typeof actualizarTablas === 'function') actualizarTablas();
    if (typeof actualizarCostos === 'function') actualizarCostos();
    if (typeof actualizarInventario === 'function') actualizarInventario();
  }

  // Sincronizar después de agregar un pedido
  async syncAfterPedido() {
    if (this.isOnline) {
      await this.uploadToGitHub();
    }
  }

  // Sincronizar después de agregar un costo
  async syncAfterCosto() {
    if (this.isOnline) {
      await this.uploadToGitHub();
    }
  }

  // Sincronización manual
  async manualSync() {
    if (!this.isOnline) {
      this.showNotification("Sin conexión a internet", "error");
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

  // Obtener estadísticas de sincronización
  getSyncStatus() {
    const lastSync = localStorage.getItem('lastSync');
    return {
      isOnline: this.isOnline,
      lastSync: lastSync ? new Date(lastSync).toLocaleString('es-ES') : 'Nunca',
      tokenConfigured: this.token !== 'TU_TOKEN_AQUI'
    };
  }
}

// Instancia global
let matilacSync = null;

// Modificar las funciones existentes para incluir sincronización
function setupSyncHooks() {
  // Hook para agregar pedido
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

  // Hook para agregar costo
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

// Agregar botón de sincronización al header
function addSyncButton() {
  const header = document.querySelector('header .flex.items-center.gap-4');
  if (header && !document.getElementById('sync-button')) {
    const syncButton = document.createElement('button');
    syncButton.id = 'sync-button';
    syncButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
    syncButton.className = 'p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm';
    syncButton.title = 'Sincronizar con la nube';
    syncButton.onclick = () => {
      if (matilacSync) {
        matilacSync.manualSync();
      }
    };
    
    // Agregar indicador de estado
    const statusDiv = document.createElement('div');
    statusDiv.id = 'sync-status';
    statusDiv.className = 'text-xs text-gray-500';
    
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center gap-1';
    container.appendChild(syncButton);
    container.appendChild(statusDiv);
    
    header.insertBefore(container, header.lastElementChild);
    
    // Actualizar estado cada 5 segundos
    setInterval(updateSyncStatus, 5000);
  }
}

// Actualizar indicador de estado
function updateSyncStatus() {
  const statusDiv = document.getElementById('sync-status');
  const syncButton = document.getElementById('sync-button');
  
  if (matilacSync && statusDiv && syncButton) {
    const status = matilacSync.getSyncStatus();
    
    if (!status.tokenConfigured) {
      statusDiv.textContent = 'Config.';
      syncButton.className = syncButton.className.replace('bg-blue-500', 'bg-gray-500');
    } else if (status.isOnline) {
      statusDiv.textContent = 'Online';
      syncButton.className = syncButton.className.replace('bg-gray-500', 'bg-blue-500');
    } else {
      statusDiv.textContent = 'Offline';
      syncButton.className = syncButton.className.replace('bg-blue-500', 'bg-gray-500');
    }
  }
}

// Inicializar el sistema de sincronización
function initializeMatilacSync() {
  matilacSync = new MatilacSync();
  setupSyncHooks();
  addSyncButton();
  updateSyncStatus();
  
  // Mostrar información de configuración en consola
  console.log('🔗 Matilac Sync inicializado');
  console.log('📁 Para configurar, edita el archivo simple-sync.js');
  console.log('🔑 Token configurado:', matilacSync.token !== 'TU_TOKEN_AQUI');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(initializeMatilacSync, 1500);
});

// Exportar para uso global
window.matilacSync = matilacSync;