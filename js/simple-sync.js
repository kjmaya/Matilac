// js/simple-sync.js - Sistema de sincronización con GitHub
class MatilacSync {
  constructor() {
    this.config = null;
    this.fileName = 'matilac-data.json';
    this.isOnline = navigator.onLine;
    this.usingEnvFile = false; // Indica si usa env.js o API
    this.source = 'none'; // 'local', 'env.js', 'vercel-api'
    this.sha = null;
    
    this.setupEventListeners();
    // Inicializar asíncronamente
    this.init();
  }

  async init() {
    await this.loadConfig();
  }

  // Cargar configuración de múltiples fuentes
  async loadConfig() {
    // 1. Intentar cargar desde js/env.js (local file)
    if (window.MATILAC_ENV && window.MATILAC_ENV.token && window.MATILAC_ENV.owner && window.MATILAC_ENV.repo) {
      console.log('Cargando configuración desde js/env.js');
      this.config = window.MATILAC_ENV;
      this.usingEnvFile = true;
      this.source = 'env.js';
      this.setupApiUrl();
      this.initializeData();
      return;
    }

    // 2. Intentar cargar desde localStorage (manual user config)
    const savedConfig = localStorage.getItem('github_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.token) {
          console.log('Cargando configuración desde LocalStorage');
          this.config = parsed;
          this.source = 'local';
          this.setupApiUrl();
          this.initializeData();
          return;
        }
      } catch (e) {
        console.error('Error parsing local config', e);
      }
    }

    // 3. Intentar cargar desde Vercel API (/api/config)
    try {
      console.log('Buscando configuración en Vercel API...');
      const response = await fetch('/api/config');
      if (response.ok) {
        const apiConfig = await response.json();
        if (apiConfig.token && apiConfig.owner && apiConfig.repo) {
          console.log('Configuración cargada desde Vercel API');
          this.config = {
            owner: apiConfig.owner,
            repo: apiConfig.repo,
            token: apiConfig.token
          };
          this.source = 'vercel-api';
          this.usingEnvFile = true; // Tratamos API como archivo env (no editable por UI)
          this.setupApiUrl();
          this.initializeData();
          return;
        }
      }
    } catch (e) {
      console.log('No se pudo cargar configuración de Vercel API (probablemente offline o local)');
    }
  }

  setupApiUrl() {
    if (this.config) {
      this.apiUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.fileName}`;
    }
  }

  // Guardar configuración en localStorage
  saveConfig(owner, repo, token) {
    if (this.source === 'env.js' || this.source === 'vercel-api') {
      if (!confirm('Actualmente estás usando una configuración automática. ¿Deseas sobrescribirla manualmente?')) {
        return false;
      }
    }
    const config = { owner, repo, token };
    localStorage.setItem('github_config', JSON.stringify(config));
    this.config = config;
    this.source = 'local';
    this.usingEnvFile = false;
    this.setupApiUrl();
    return true;
  }

  // Obtener configuración actual
  getConfig() {
    return this.config;
  }

  // Verificar si está configurado
  isConfigured() {
    return !!(this.config && this.config.token && this.config.owner && this.config.repo);
  }

  // Eliminar configuración
  clearConfig() {
    if (this.source === 'env.js') {
      alert('La configuración viene de js/env.js. Edita el archivo para eliminarla.');
      return;
    }
    if (this.source === 'vercel-api') {
      if (confirm('La configuración viene de Vercel (.env). Para borrarla permanentemente debes hacerlo en el panel de Vercel. ¿Quieres limpiar la anulación local?')) {
        localStorage.removeItem('github_config');
        this.config = null;
        // Recargar para ver si vuelve a tomar la API
        window.location.reload(); 
      }
      return;
    }
    
    localStorage.removeItem('github_config');
    this.config = null;
    this.source = 'none';
    
    this.apiUrl = null;
    
    // Intentar recargar desde API por si acaso
    this.init();
  }

  // Probar conexión con GitHub
  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: 'No hay configuración guardada' };
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${this.config.owner}/${this.config.repo}`, {
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { 
          success: true, 
          message: `Conectado a ${data.full_name}`,
          repoInfo: data
        };
      } else if (response.status === 401) {
        return { success: false, message: 'Token inválido o expirado' };
      } else if (response.status === 404) {
        return { success: false, message: 'Repositorio no encontrado' };
      } else {
        return { success: false, message: `Error: ${response.status}` };
      }
    } catch (error) {
      return { success: false, message: `Error de conexión: ${error.message}` };
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
    if (this.isOnline && this.isConfigured()) {
      try {
        await this.downloadFromGitHub();
        this.showNotification("📱 Datos sincronizados desde GitHub", "success");
      } catch (error) {
        console.log("Error al sincronizar:", error);
        this.showNotification("Usando datos locales", "info");
      }
    }
  }

  // Descargar datos desde GitHub
  async downloadFromGitHub() {
    if (!this.isConfigured()) return;
    
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
        
        return { success: true, data: content };
        
      } else if (response.status === 404) {
        // El archivo no existe, crear uno inicial
        await this.createInitialFile();
        return { success: true, created: true };
      } else if (response.status === 401) {
        this.showNotification("❌ Token inválido o expirado", "error");
        return { success: false, error: 'auth' };
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
    if (!this.isConfigured()) return;
    
    const initialData = {
      pedidos: JSON.parse(localStorage.getItem('pedidos') || '[]'),
      costos: JSON.parse(localStorage.getItem('costos') || '{}'),
      lastSync: new Date().toISOString(),
      version: '1.0.0'
    };

    try {
      const content = btoa(unescape(encodeURIComponent(JSON.stringify(initialData, null, 2))));
      
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
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error creating initial file:', error);
      return { success: false, error: error.message };
    }
  }

  // Subir datos a GitHub
  async uploadToGitHub() {
    if (!this.isOnline || !this.isConfigured()) return false;

    try {
      // Primero obtener el SHA actual
      if (!this.sha) {
        const getResponse = await fetch(this.apiUrl, {
          headers: {
            'Authorization': `token ${this.config.token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (getResponse.ok) {
          const getData = await getResponse.json();
          this.sha = getData.sha;
        } else if (getResponse.status === 404) {
          // Archivo no existe, crearlo
          return await this.createInitialFile();
        }
      }

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
      if (matilacSync && matilacSync.isConfigured() && result !== false) {
        setTimeout(() => matilacSync.syncAfterPedido(), 500);
      }
      return result;
    };
  }

  const originalAgregarCosto = window.agregarCosto;
  if (originalAgregarCosto) {
    window.agregarCosto = async function() {
      const result = originalAgregarCosto.apply(this, arguments);
      if (matilacSync && matilacSync.isConfigured() && result !== false) {
        setTimeout(() => matilacSync.syncAfterCosto(), 500);
      }
      return result;
    };
  }
}

// Agregar botón de sincronización
function addSyncButton() {
  const header = document.querySelector('header .flex.items-center.gap-2');
  if (header && !document.getElementById('sync-button')) {
    const syncButton = document.createElement('button');
    syncButton.id = 'sync-button';
    syncButton.innerHTML = '<i class="fas fa-cloud"></i>';
    syncButton.className = 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center hover:from-blue-200 hover:to-cyan-200 transition-all duration-300 shadow-sm text-blue-600';
    syncButton.title = 'Sincronizar con GitHub';
    syncButton.onclick = () => matilacSync?.manualSync();
    
    header.insertBefore(syncButton, header.firstChild);
    
    setInterval(updateSyncStatus, 5000);
  }
}

// Actualizar estado de sincronización
function updateSyncStatus() {
  const syncButton = document.getElementById('sync-button');
  
  if (matilacSync && syncButton) {
    const status = matilacSync.getSyncStatus();
    
    if (!status.configured) {
      syncButton.className = 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm text-gray-500';
      syncButton.title = 'No configurado - Click para configurar';
      syncButton.onclick = () => mostrarSeccion('config');
    } else if (status.isOnline) {
      syncButton.className = 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center hover:from-green-200 hover:to-emerald-200 transition-all duration-300 shadow-sm text-green-600';
      syncButton.title = `Conectado - Última sync: ${status.lastSync}`;
      syncButton.onclick = () => matilacSync?.manualSync();
    } else {
      syncButton.className = 'w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center hover:from-orange-200 hover:to-amber-200 transition-all duration-300 shadow-sm text-orange-600';
      syncButton.title = 'Sin conexión';
      syncButton.onclick = () => matilacSync?.manualSync();
    }
  }
}

// Cargar sección de configuración
function cargarSeccionConfig() {
  const seccionConfig = document.getElementById('seccion-config');
  if (!seccionConfig) return;
  
  const config = matilacSync?.getConfig();
  const isConfigured = matilacSync?.isConfigured();
  const source = matilacSync?.source; 
  
  let sourceLabel = '';
  let sourceIcon = '';
  if (source === 'vercel-api') {
    sourceLabel = 'Vercel Env';
    sourceIcon = 'fa-server';
  } else if (source === 'env.js') {
    sourceLabel = 'env.js';
    sourceIcon = 'fa-file-code';
  } else if (source === 'local') {
    sourceLabel = 'Local Storage';
    sourceIcon = 'fa-hdd';
  }

  const isLocked = source === 'vercel-api' || source === 'env.js';

  seccionConfig.innerHTML = `
    <section id="config" class="seccion" style="transition: opacity 0.3s ease;">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-gray-500/30">
            <i class="fab fa-github text-xl"></i>
          </div>
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Configuración de GitHub</h2>
            <p class="text-sm text-gray-500">Sincroniza tus datos en la nube</p>
          </div>
        </div>
        <div id="connection-status" class="flex items-center gap-2">
          ${isConfigured ? `
            <span class="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium">
              <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Conectado <i class="fas ${sourceIcon} ml-1 opacity-70"></i> ${sourceLabel}
            </span>
          ` : `
            <span class="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium">
              <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
              No configurado
            </span>
          `}
        </div>
      </div>

      <!-- Instrucciones (Ocultas si ya está configurado por env) -->
      ${!isLocked ? `
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mb-6">
        <h3 class="font-bold text-blue-800 mb-3 flex items-center gap-2">
          <i class="fas fa-info-circle"></i>
          ¿Cómo crear un token de GitHub?
        </h3>
        <ol class="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
          <li>Ve a <a href="https://github.com/settings/tokens" target="_blank" class="underline font-semibold hover:text-blue-900">GitHub Settings → Tokens</a></li>
          <li>Click en <strong>"Generate new token (classic)"</strong></li>
          <li>Dale un nombre como "Matilac Sync"</li>
          <li>Selecciona el scope <strong>"repo"</strong> (acceso completo a repositorios)</li>
          <li>Click en <strong>"Generate token"</strong></li>
          <li>¡Copia el token inmediatamente! Solo se muestra una vez</li>
        </ol>
        <div class="mt-4 flex flex-wrap gap-2">
          <a href="https://github.com/settings/tokens/new" target="_blank" class="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors">
            <i class="fab fa-github"></i>
            Crear Token
          </a>
          <a href="https://github.com/new" target="_blank" class="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <i class="fas fa-plus"></i>
            Crear Repositorio
          </a>
        </div>
      </div>
      ` : ''}

      <!-- Formulario de configuración -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6 mb-6 relative">
        ${isLocked ? `<div class="absolute inset-0 bg-gray-50/50 z-10 flex items-center justify-center backdrop-blur-[1px] rounded-2xl">
          <div class="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-gray-600 max-w-sm text-center">
            <p><i class="fas fa-lock text-blue-500 mr-2"></i>Configuración gestionada por <strong>${sourceLabel}</strong></p>
            <p class="text-xs text-gray-400 mt-1">Para cambiarla, edita las variables de entorno en Vercel o el archivo env.js</p>
          </div>
        </div>` : ''}
        
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-cog text-gray-500"></i>
          Configuración
        </h3>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-user text-gray-400 mr-1"></i> Usuario de GitHub
            </label>
            <input type="text" id="github-owner" placeholder="tu-usuario" 
                   value="${config?.owner || ''}"
                   ${isLocked ? 'disabled' : ''}
                   class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500">
            <p class="text-xs text-gray-500">El nombre de tu usuario de GitHub</p>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-database text-gray-400 mr-1"></i> Nombre del Repositorio
            </label>
            <input type="text" id="github-repo" placeholder="matilac-data" 
                   value="${config?.repo || 'matilac-data'}"
                   ${isLocked ? 'disabled' : ''}
                   class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:text-gray-500">
            <p class="text-xs text-gray-500">Debe ser un repositorio privado existente</p>
          </div>
          
          <div class="space-y-2">
            <label class="block text-sm font-semibold text-gray-700">
              <i class="fas fa-key text-yellow-500 mr-1"></i> Token de Acceso Personal
            </label>
            <div class="relative">
              <input type="password" id="github-token" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                     value="${config?.token || ''}"
                     ${isLocked ? 'disabled' : ''}
                     class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all bg-gray-50 hover:bg-white font-mono text-sm disabled:bg-gray-100 disabled:text-gray-500">
              <button type="button" onclick="toggleTokenVisibility()" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <i class="fas fa-eye" id="token-visibility-icon"></i>
              </button>
            </div>
            <p class="text-xs text-gray-500">Tu token personal con permisos de "repo"</p>
          </div>
        </div>
        
        <div class="mt-6 flex flex-col sm:flex-row gap-3 relative z-20">
          <button onclick="guardarConfigGitHub()" ${isLocked ? 'disabled' : ''} class="flex-1 bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-black transition-all shadow-lg shadow-gray-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-save"></i>
            Guardar Configuración
          </button>
          <button onclick="probarConexionGitHub()" class="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            <i class="fas fa-plug"></i>
            Probar Conexión
          </button>
        </div>
      </div>

      <!-- Estado actual -->
      ${isConfigured ? `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4 sm:p-6 mb-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i class="fas fa-info-circle text-blue-500"></i>
            Estado de la Sincronización
          </h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500 mb-1">Repositorio</p>
              <p class="font-semibold text-gray-800">${config?.owner}/${config?.repo}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-4">
              <p class="text-sm text-gray-500 mb-1">Última sincronización</p>
              <p class="font-semibold text-gray-800">${localStorage.getItem('lastSync') ? new Date(localStorage.getItem('lastSync')).toLocaleString('es-CO') : 'Nunca'}</p>
            </div>
          </div>
          
          <div class="mt-4 flex flex-col sm:flex-row gap-3">
            <button onclick="sincronizarAhora()" class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
              <i class="fas fa-sync"></i>
              Sincronizar Ahora
            </button>
            <button onclick="eliminarConfigGitHub()" class="px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
              <i class="fas fa-trash"></i>
              Eliminar Configuración
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Advertencia de seguridad -->
      <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <div class="flex items-start gap-3">
          <i class="fas fa-exclamation-triangle text-yellow-600 mt-0.5"></i>
          <div>
            <h4 class="font-semibold text-yellow-800">Nota de Seguridad</h4>
            <p class="text-sm text-yellow-700 mt-1">
              Tu token se guarda localmente en tu navegador. Para mayor seguridad, 
              usa un repositorio <strong>privado</strong> y genera un token con permisos mínimos (solo "repo").
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}

// Toggle visibilidad del token
function toggleTokenVisibility() {
  const input = document.getElementById('github-token');
  const icon = document.getElementById('token-visibility-icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Guardar configuración de GitHub
async function guardarConfigGitHub() {
  const owner = document.getElementById('github-owner').value.trim();
  const repo = document.getElementById('github-repo').value.trim();
  const token = document.getElementById('github-token').value.trim();
  
  if (!owner || !repo || !token) {
    mostrarNotificacion('Por favor completa todos los campos', 'error');
    return;
  }
  
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    mostrarNotificacion('El token no parece ser válido. Debe empezar con "ghp_" o "github_pat_"', 'warning');
  }
  
  matilacSync.saveConfig(owner, repo, token);
  mostrarNotificacion('Configuración guardada. Probando conexión...', 'info');
  
  // Probar conexión
  const result = await matilacSync.testConnection();
  
  if (result.success) {
    mostrarNotificacion(`✅ ${result.message}`, 'success');
    // Inicializar datos
    await matilacSync.initializeData();
    cargarSeccionConfig();
    updateSyncStatus();
  } else {
    mostrarNotificacion(`❌ ${result.message}`, 'error');
  }
}

// Probar conexión
async function probarConexionGitHub() {
  const owner = document.getElementById('github-owner').value.trim();
  const repo = document.getElementById('github-repo').value.trim();
  const token = document.getElementById('github-token').value.trim();
  
  if (!owner || !repo || !token) {
    mostrarNotificacion('Por favor completa todos los campos primero', 'error');
    return;
  }
  
  // Guardar temporalmente para probar
  matilacSync.saveConfig(owner, repo, token);
  
  mostrarNotificacion('Probando conexión...', 'info');
  const result = await matilacSync.testConnection();
  
  if (result.success) {
    mostrarNotificacion(`✅ ${result.message}`, 'success');
  } else {
    mostrarNotificacion(`❌ ${result.message}`, 'error');
  }
}

// Sincronizar ahora
async function sincronizarAhora() {
  if (!matilacSync?.isConfigured()) {
    mostrarNotificacion('Configura GitHub primero', 'error');
    return;
  }
  
  mostrarNotificacion('Sincronizando...', 'info');
  await matilacSync.manualSync();
  cargarSeccionConfig();
}

// Eliminar configuración
function eliminarConfigGitHub() {
  if (confirm('¿Estás seguro de eliminar la configuración de GitHub? Tus datos locales no se perderán.')) {
    matilacSync.clearConfig();
    mostrarNotificacion('Configuración eliminada', 'success');
    cargarSeccionConfig();
    updateSyncStatus();
  }
}

// Inicializar sistema de sincronización
function initializeMatilacSync() {
  try {
    matilacSync = new MatilacSync();
    setupSyncHooks();
    addSyncButton();
    updateSyncStatus();
    
    // Cargar sección de config si existe
    if (document.getElementById('seccion-config')) {
      cargarSeccionConfig();
    }
    
    console.log('🔗 Matilac Sync inicializado');
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
window.cargarSeccionConfig = cargarSeccionConfig;
window.toggleTokenVisibility = toggleTokenVisibility;
window.guardarConfigGitHub = guardarConfigGitHub;
window.probarConexionGitHub = probarConexionGitHub;
window.sincronizarAhora = sincronizarAhora;
window.eliminarConfigGitHub = eliminarConfigGitHub;