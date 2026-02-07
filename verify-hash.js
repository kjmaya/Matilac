const bcrypt = require('bcrypt');

async function verifyPassword() {
  const password = 'Matilac2025!';
  const hash = '$2b$10$xKs1wQuryaspSUZ0omvqXuoIdrQcDN84s/6wQ4GLcfd8ejESfh3vC';
  
  console.log('=== VERIFICACIÓN DE HASH ===\n');
  console.log('Contraseña original:', password);
  console.log('Hash generado:', hash);
  console.log('\n--- Verificando si coinciden ---');
  
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('¿El hash corresponde a la contraseña?', isValid ? '✅ SÍ' : '❌ NO');
    
    // Vamos a probar con contraseñas incorrectas para demostrar
    console.log('\n--- Pruebas con contraseñas incorrectas ---');
    const wrongPasswords = ['admin123', 'password', 'Matilac2024!', 'matilac2025!'];
    
    for (const wrongPwd of wrongPasswords) {
      const wrongResult = await bcrypt.compare(wrongPwd, hash);
      console.log(`"${wrongPwd}" → ${wrongResult ? '✅' : '❌'}`);
    }
    
    console.log('\n--- Generemos un nuevo hash para comparar ---');
    const newHash = await bcrypt.hash(password, 10);
    console.log('Nuevo hash:', newHash);
    
    const newHashValid = await bcrypt.compare(password, newHash);
    console.log('¿El nuevo hash también funciona?', newHashValid ? '✅ SÍ' : '❌ NO');
    
    console.log('\n=== EXPLICACIÓN ===');
    console.log('- bcrypt genera un hash único cada vez (por el "salt")');
    console.log('- Pero ambos hashes son válidos para la misma contraseña');
    console.log('- Solo bcrypt.compare() puede verificar si coinciden');
    console.log('- Esto es exactamente lo que hace tu API de login');
    
  } catch (error) {
    console.error('Error verificando:', error);
  }
}

verifyPassword();
