import bcrypt from 'bcrypt';

const generarHash = async () => {
  try {
    const password = '123456'; // Reemplaza con la contraseña que desees
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`Hash de la contraseña: ${hashedPassword}`);
  } catch (error) {
    console.error('Error al generar hash:', error);
  }
};

generarHash();