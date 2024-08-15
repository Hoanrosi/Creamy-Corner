import * as dotenv from "dotenv";
import db from "./db/models/index";
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

import app from "./app";

const sequelize = db.sequelize;

const server = app.listen(process.env.PORT, async () => {
  console.log(`App running on port ${process.env.PORT}...`);

  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // if (process.env.NODE_ENV === "development") {
    //   await sequelize.sync();
    //   console.log("All models were synchronized successfully.");
    // }
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});

export default sequelize;
