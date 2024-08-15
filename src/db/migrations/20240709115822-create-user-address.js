module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_addresses", {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      userId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      detail: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      province: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      ward: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("user_addresses");
  },
};
