// js/auth.js - Sistema de autenticación frontend
const AUTH = {
  tokenKey: 'matilac_token',
  userKey: 'matilac_user',

  // Obtener token guardado
  getToken() {
    return localStorage.getItem(this.tokenKey);
  },

  // Obtener usuario guardado
  getUser() {
    try {
      return JSON.parse(localStorage.getItem(this.userKey));
    } catch { return null; }
  },

  // Guardar sesión
  saveSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    mostrarLogin();
  },

  // Verificar si hay sesión activa
  async checkAuth() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          this.saveSession(token, data.user);
          return true;
        }
      }
      // Token inválido, limpiar
      this.logout();
      return false;
    } catch (error) {
      // Sin conexión: confiar en el token local (offline mode)
      console.log('Verificación offline, usando token local');
      return !!token;
    }
  },

  // Login
  async login(username, password) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        this.saveSession(data.token, data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Error de autenticación' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  },

  // Registrar usuario
  async register(username, password, adminKey) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, adminKey })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Error al registrar' };
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  }
};

// ============================================
// UI DEL LOGIN
// ============================================

function mostrarLogin() {
  const app = document.getElementById('app-container');
  const login = document.getElementById('login-container');
  if (app) app.style.display = 'none';
  if (login) {
    login.style.display = 'flex';
    login.innerHTML = getLoginHTML();
  }
}

function mostrarApp() {
  const app = document.getElementById('app-container');
  const login = document.getElementById('login-container');
  if (login) login.style.display = 'none';
  if (app) app.style.display = 'block';

  // Mostrar info del usuario en el header
  const user = AUTH.getUser();
  const userBadge = document.getElementById('user-badge');
  if (userBadge && user) {
    userBadge.innerHTML = `
      <div class="flex items-center gap-2 bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-1.5 rounded-xl border border-pink-100">
        <div class="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
          ${user.username.charAt(0).toUpperCase()}
        </div>
        <span class="text-sm font-medium text-gray-700 hidden sm:inline">${user.username}</span>
        <button onclick="AUTH.logout()" class="text-gray-400 hover:text-red-500 transition-colors ml-1" title="Cerrar sesión">
          <i class="fas fa-sign-out-alt text-sm"></i>
        </button>
      </div>
    `;
  }
}

function getLoginHTML() {
  return `
    <div class="w-full max-w-md mx-4">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-pink-500 via-rose-500 to-red-500 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-pink-500/40 mx-auto mb-4 animate-float">
          M
        </div>
        <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-600">Matilac</h1>
        <p class="text-gray-500 mt-1">Sistema de Gestión</p>
      </div>

      <!-- Card de Login -->
      <div class="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100/50 p-8" id="login-card">
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center" id="login-title">Iniciar Sesión</h2>
        
        <!-- Mensaje de error -->
        <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-exclamation-circle"></i>
          <span id="login-error-text"></span>
        </div>

        <!-- Mensaje de éxito -->
        <div id="login-success" class="hidden bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <i class="fas fa-check-circle"></i>
          <span id="login-success-text"></span>
        </div>
        
        <!-- Formulario -->
        <form onsubmit="handleLogin(event)" id="login-form">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                <i class="fas fa-user text-gray-400 mr-1"></i> Usuario
              </label>
              <input type="text" id="login-username" placeholder="Tu usuario" required
                     class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white text-gray-800"
                     autocomplete="username">
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                <i class="fas fa-lock text-gray-400 mr-1"></i> Contraseña
              </label>
              <div class="relative">
                <input type="password" id="login-password" placeholder="Tu contraseña" required
                       class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white text-gray-800"
                       autocomplete="current-password">
                <button type="button" onclick="toggleLoginPassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <i class="fas fa-eye" id="login-eye-icon"></i>
                </button>
              </div>
            </div>

            <!-- Campo admin key (solo para registro) -->
            <div id="admin-key-field" class="hidden">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">
                <i class="fas fa-key text-yellow-500 mr-1"></i> Clave de Admin
              </label>
              <input type="password" id="login-admin-key" placeholder="Clave para crear cuenta"
                     class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all bg-gray-50 hover:bg-white text-gray-800">
            </div>
          </div>
          
          <button type="submit" id="login-btn"
                  class="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-pink-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2">
            <i class="fas fa-sign-in-alt"></i>
            <span id="login-btn-text">Entrar</span>
          </button>
        </form>

        <div class="mt-4 text-center">
          <button onclick="toggleRegisterMode()" id="toggle-mode-btn" class="text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline transition-colors">
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  `;
}

// Estado del formulario
let isRegisterMode = false;

function toggleRegisterMode() {
  isRegisterMode = !isRegisterMode;
  const title = document.getElementById('login-title');
  const btnText = document.getElementById('login-btn-text');
  const toggleBtn = document.getElementById('toggle-mode-btn');
  const adminField = document.getElementById('admin-key-field');
  const loginBtn = document.getElementById('login-btn');

  if (isRegisterMode) {
    title.textContent = 'Crear Cuenta';
    btnText.textContent = 'Registrarse';
    toggleBtn.textContent = '¿Ya tienes cuenta? Inicia sesión';
    adminField.classList.remove('hidden');
    loginBtn.querySelector('i').className = 'fas fa-user-plus';
  } else {
    title.textContent = 'Iniciar Sesión';
    btnText.textContent = 'Entrar';
    toggleBtn.textContent = '¿No tienes cuenta? Regístrate';
    adminField.classList.add('hidden');
    loginBtn.querySelector('i').className = 'fas fa-sign-in-alt';
  }

  // Limpiar mensajes
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('login-success').classList.add('hidden');
}

function toggleLoginPassword() {
  const input = document.getElementById('login-password');
  const icon = document.getElementById('login-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  const text = document.getElementById('login-error-text');
  const success = document.getElementById('login-success');
  if (success) success.classList.add('hidden');
  if (el && text) {
    text.textContent = msg;
    el.classList.remove('hidden');
  }
}

function showLoginSuccess(msg) {
  const el = document.getElementById('login-success');
  const text = document.getElementById('login-success-text');
  const error = document.getElementById('login-error');
  if (error) error.classList.add('hidden');
  if (el && text) {
    text.textContent = msg;
    el.classList.remove('hidden');
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const btnText = document.getElementById('login-btn-text');

  if (!username || !password) {
    showLoginError('Completa todos los campos');
    return;
  }

  // Deshabilitar botón
  btn.disabled = true;
  btnText.textContent = isRegisterMode ? 'Registrando...' : 'Verificando...';

  if (isRegisterMode) {
    // REGISTRO
    const adminKey = document.getElementById('login-admin-key').value.trim();
    if (!adminKey) {
      showLoginError('La clave de admin es requerida para registrarse');
      btn.disabled = false;
      btnText.textContent = 'Registrarse';
      return;
    }

    const result = await AUTH.register(username, password, adminKey);
    if (result.success) {
      showLoginSuccess(result.message + '. Ahora inicia sesión.');
      isRegisterMode = true;
      toggleRegisterMode(); // Cambiar a modo login
    } else {
      showLoginError(result.error);
    }
    btn.disabled = false;
    btnText.textContent = isRegisterMode ? 'Registrarse' : 'Entrar';
  } else {
    // LOGIN
    const result = await AUTH.login(username, password);
    if (result.success) {
      mostrarApp();
      // Recargar datos
      if (typeof cargarDatosPedidos === 'function') cargarDatosPedidos();
      if (typeof actualizarCostos === 'function') actualizarCostos();
    } else {
      showLoginError(result.error);
      btn.disabled = false;
      btnText.textContent = 'Entrar';
    }
  }
}

// ============================================
// INICIALIZACIÓN AUTH
// ============================================
async function initAuth() {
  const isLoggedIn = await AUTH.checkAuth();
  if (isLoggedIn) {
    mostrarApp();
  } else {
    mostrarLogin();
  }
}

// Iniciar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
  // Dar tiempo a que se renderice el HTML
  setTimeout(initAuth, 100);
});
