import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Gestión de Laboratorios y Automatización",
      version: "1.0.0",
      description:
        "Documentación oficial de la API backend para el control de laboratorios, espacios de trabajo y dispositivos IoT.",
    },
    servers: [
      {
        url: "http://localhost:3000", // Cambia esto por tu URL de producción cuando despliegues
        Servidor: "Servidor de Desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Introduce tu token JWT con el formato: Bearer <token>",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  // Rutas donde Swagger buscará las anotaciones (apunta a tus controladores o rutas refactorizados)
  apis: ["./src/controllers/*.ts", "./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    "Documentación de Swagger disponible en http://localhost:3000/api-docs",
  );
};
