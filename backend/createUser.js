"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("./src/services/authService");
/**
 * Script de utilidad para crear un usuario en el sistema.
 * Puedes cambiar los valores aquí para crear diferentes usuarios.
 */
async function run() {
    // Configuración del usuario a crear
    const nombre_completo = "Jaime Daniel";
    const username = "jaime";
    const password = "123456";
    const fk_id_rol = 1; // 1 = Admin, 2 = Supervisor, 3 = Operador
    const email = "jaime@test.com";
    try {
        console.log(`Intentando crear usuario: ${username}...`);
        const result = await (0, authService_1.registerUser)(nombre_completo, username, password, fk_id_rol, email);
        console.log("¡Usuario creado exitosamente!");
        console.log("Respuesta del servidor:", JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error("❌ Error al crear el usuario:");
        console.error(error.message);
    }
    finally {
        process.exit(0);
    }
}
run();
