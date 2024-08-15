import * as dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

export default {
  development: {
    username: process.env.DB_MASTER_NAME,
    password: String(process.env.DB_MASTER_PASSWORD),
    database: process.env.DB_NAME,
    host: process.env.DB_ENDPOINT,
    logging: console.log,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
  production: {
    username: process.env.DB_MASTER_NAME,
    password: String(process.env.DB_MASTER_PASSWORD),
    database: process.env.DB_NAME,
    host: process.env.DB_ENDPOINT,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
