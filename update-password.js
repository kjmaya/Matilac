const bcrypt = require('bcrypt');
const { query } = require('./api/db.js');

async function updatePassword() {
  try {
    console.log('Generando nuevo hash para admin123...');
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('Nuevo hash generado:', newHash);
    
    const result = await query('UPDATE empleados SET password_hash = $1 WHERE usuario = $2', [newHash, 'admin']);
    console.log('Password actualizado exitosamente. Filas afectadas:', result.rowCount);
    
    // Verificar que funciona
    const user = await query('SELECT usuario, password_hash FROM empleados WHERE usuario = $1', ['admin']);
    console.log('Usuario encontrado:', user.rows[0].usuario);
    
    const isValid = await bcrypt.compare('admin123', user.rows[0].password_hash);
    console.log('Verificación de contraseña:', isValid ? 'CORRECTA' : 'INCORRECTA');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
}

updatePassword();
