module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      brand: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      purchases: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rate: {
        type: Sequelize.DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 5.0,
        },
      },
      reviewSum: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      originalPrice: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: true,
      },
      salePrice: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: true,
      },
      stock: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: true,
        // defaultValue: 10,
      },
      weight: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: false,
        // defaultValue: 10,
      },
      defaultImage: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "hello.com",
      },
      minPrice: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: true,
      },
      maxPrice: {
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
    await queryInterface.dropTable("products");
  },
};
