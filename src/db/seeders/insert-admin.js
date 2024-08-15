const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        email: process.env.ADMIN_EMAIL,
        password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
        role: "admin",
      },
    ]);
  },
  down: (queryInterface) => {
    return queryInterface.bulkDelete("users", null, {});
  },
};
