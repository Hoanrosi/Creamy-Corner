import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Creamy Corner Swagger",
      version: "1.0.0",
      description:
        "Creamy Corner is an online store offering a wide range of makeup products. Perfect for backend development practice with Express and Swagger, this project allows users to explore product categories, make purchases, and manage orders.",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
  },
  apis: [`${__dirname}/../src/routes/user.route.js`],
};

export const swaggerDocs = swaggerJSDoc(swaggerOptions);
