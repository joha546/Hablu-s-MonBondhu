import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hablu's MonBondhu Backend API",
      version: "1.0.0",
      description: "API documentation for Hablu's MonBondhu Starter Boilerplate",
    },
    servers: [
      {
        url: "http://localhost:2222/api",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to your route files
};

export const swaggerSpec = swaggerJSDoc(options);
