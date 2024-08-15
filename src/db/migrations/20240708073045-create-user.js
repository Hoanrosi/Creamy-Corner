module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.DataTypes.ENUM,
        values: ["guest", "user", "admin"],
        allowNull: true,
        defaultValue: "user",
      },
      // passwordConfirm: {
      //   type: Sequelize.DataTypes.STRING,
      //   allowNull: true,
      // },
      passwordChangedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      passwordResetToken: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      passwordResetExpires: {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      isActive: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
  },
};
