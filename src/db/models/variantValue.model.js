import { Model, DataTypes } from "sequelize";

class VariantValue extends Model {
  static associate(models) {
    VariantValue.belongsTo(models.Variant, { foreignKey: "variantId" });
  }
}

function defineVariantValue(sequelize) {
  VariantValue.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      variantId: {
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
      tableName: "variant_values",
      modelName: "VariantValue",
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["isActive"] },
      },
    }
  );

  return VariantValue;
}

export default defineVariantValue;
