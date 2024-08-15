import { Model, DataTypes } from "sequelize";
import Product from "./product.model";
import VariantValue from "./variantValue.model";

class Variant extends Model {
  static associate(models) {
    Variant.belongsTo(models.Product, { foreignKey: "productId" });
    Variant.hasMany(models.VariantValue, { foreignKey: "variantId" });
  }
}

function defineVariant(sequelize) {
  Variant.init(
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
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "variants",
      modelName: "Variant",
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["isActive"] },
      },
    }
  );

  return Variant;
}

export default defineVariant;
