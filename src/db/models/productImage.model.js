import { Model, DataTypes } from "sequelize";
import Product from "./product.model";

class ProductImage extends Model {
  static associate(models) {
    ProductImage.belongsTo(models.Product, { foreignKey: "productId" });
  }
}

function defineProductImage(sequelize) {
  ProductImage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "product_images",
      modelName: "ProductImage",
      timestamps: false,
    }
  );

  return ProductImage;
}

export default defineProductImage;
