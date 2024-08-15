import { Model, DataTypes } from "sequelize";

class ProductVariantCombination extends Model {
  static associate(models) {
    ProductVariantCombination.belongsTo(models.Product, {
      foreignKey: "productId",
    });
  }
}

function defineProductVariantCombination(sequelize) {
  ProductVariantCombination.init(
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
      value1Id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      value2Id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 10,
      },

      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      originalPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      salePrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: "product_variant_combinations",
      modelName: "ProductVariantCombination",
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["isActive"] },
      },
    }
  );

  ProductVariantCombination.beforeSave(async (instance) => {
    instance.status = instance.stock > 0;
  });

  return ProductVariantCombination;
}

export default defineProductVariantCombination;
