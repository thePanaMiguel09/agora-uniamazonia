import bcrypt from "bcrypt";

/**
 * Genera un hash seguro utilizando bcrypt para una contraseña dada.
 * Utilidad ideal para la creación de registros semilla (seeds) en la base de datos.
 *
 * @param {string} plainPassword - Contraseña en texto plano a cifrar.
 * @param {number} [saltRounds=10] - Costo o número de rondas de salt (por defecto 10).
 * @returns {Promise<string>} El hash cifrado de la contraseña.
 */
export const hashPassword = async (
  plainPassword: string,
  saltRounds: number = 10,
): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error(
      "Error crítico al generar el hash de la contraseña:",
      errorMessage,
    );
    throw new Error(`No se pudo generar el hash: ${errorMessage}`);
  }
};

// Ejecución directa si se corre el script de forma independiente
if (require.main === module) {
  const runUtility = async (): Promise<void> => {
    const samplePassword = "123456";
    console.log(`Generando hash para la contraseña: "${samplePassword}"...`);

    try {
      const result = await hashPassword(samplePassword, 10);
      console.log("Hash generado exitosamente:");
      console.log(result);
    } catch (error) {
      console.error("Proceso interrumpido.");
    }
  };

  runUtility();
}
