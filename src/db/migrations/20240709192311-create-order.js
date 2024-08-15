module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("orders", {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      userId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: false,
      },
      addressId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: "user_addresses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.DataTypes.ENUM,
        allowNull: false,
        values: [
          "pending",
          "approved",
          "shipping",
          "delivered",
          "rejected",
          "cancelled",
        ],
        defaultValue: "pending",
      },
      addressDetail: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      province: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      district: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      ward: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable("orders");
  },
};
