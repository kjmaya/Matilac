// js/auth-client.js - Cliente de autenticación para el frontend v2.0.0
class AuthClient {
  constructor() {
    this.baseUrl = '/api/auth';
    console.log('AuthClient v2.0.0 initialized with baseUrl:', this.baseUrl);
    this.token = localStorage.getItem('matilac_token');
    this.user = this.token ? JSON.parse(localStorage.getItem('matilac_user') || '{}') : null;
    this.isAuthenticated = !!this.token;
  }

  // Iniciar sesión
  async login(usuario, password) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.token = data.token;
        this.user = data.user;
        this.isAuthenticated = true;

        // Guardar en localStorage
        localStorage.setItem('matilac_token', this.token);
        localStorage.setItem('matilac_user', JSON.stringify(this.user));

        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('authStateChanged', { 
          detail: { isAuthenticated: true, user: this.user } 
        }));

        return { success: true, user: this.user };
      } else {
        throw new Error(data.error || 'Error de login');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      if (this.token) {
        await fetch(this.baseUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar datos locales independientemente del resultado de la API
      this.token = null;
      this.user = null;
      this.isAuthenticated = false;

      localStorage.removeItem('matilac_token');
      localStorage.removeItem('matilac_user');

      // Disparar evento personalizado
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { isAuthenticated: false, user: null } 
      }));
    }
  }

  // Verificar si el token es válido
  async verifyToken() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: this.token })
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        return true;
      } else {
        // Token inválido, limpiar datos
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      await this.logout();
      return false;
    }
  }

  // Obtener usuario actual
  async getCurrentUser() {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        localStorage.setItem('matilac_user', JSON.stringify(this.user));
        return this.user;
      } else {
        await this.logout();
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      await this.logout();
      return null;
    }
  }

  // Obtener headers de autorización para requests
  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  // Verificar permisos
  hasPermission(module, action) {
    if (!this.user || !this.user.permisos) {
      return false;
    }

    try {
      const permissions = typeof this.user.permisos === 'string' 
        ? JSON.parse(this.user.permisos) 
        : this.user.permisos;

      return permissions[module] && permissions[module][action] === true;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  }

  // Verificar si es administrador
  isAdmin() {
    return this.user && this.user.rol_nombre === 'Administrador';
  }

  // Obtener nombre del usuario
  getUserName() {
    return this.user ? this.user.nombre_completo : 'Usuario';
  }

  // Obtener rol del usuario
  getUserRole() {
    return this.user ? this.user.rol_nombre : 'Sin rol';
  }
}

// Crear instancia global
const authClient = new AuthClient();

// Verificar token al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  if (authClient.token) {
    const isValid = await authClient.verifyToken();
    if (!isValid) {
      console.log('Token expirado, redirigiendo a login...');
    }
  }
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthClient;
}
