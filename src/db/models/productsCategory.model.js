import { Model, DataTypes } from "sequelize";

function defineProductsCategory(sequelize) {
  class ProductsCategory extends Model {
    static associate(models) {
      ProductsCategory.belongsTo(models.Product, { foreignKey: "productId" });
      ProductsCategory.belongsTo(models.Category, { foreignKey: "categoryId" });
    }
  }

  ProductsCategory.init(
    {
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: "products_categories",
      modelName: "ProductsCategory",
      timestamps: false,
    }
  );

  return ProductsCategory;
}

export default defineProductsCategory;
