module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("product_variant_combinations", {
      id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      productId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value1Id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
      },
      value2Id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
      },
      stock: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
      },

      status: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      originalPrice: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: false,
      },
      salePrice: {
        type: Sequelize.DataTypes.DOUBLE,
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
    await queryInterface.dropTable("product_variant_combinations");
  },
};
