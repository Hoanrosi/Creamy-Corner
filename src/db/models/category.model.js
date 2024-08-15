import { Model, DataTypes } from "sequelize";

function defineCategory(sequelize) {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.Category, {
        foreignKey: "parentId",
        as: "parent",
      });
      Category.hasMany(models.Category, {
        foreignKey: "parentId",
        as: "children",
      });
      Category.belongsToMany(models.Product, {
        through: models.ProductsCategory,
        foreignKey: "categoryId",
        onDelete: "CASCADE",
      });
    }
  }
  Category.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "categories",
      modelName: "Category",
      timestamps: false,
    }
  );

  return Category;
}

export default defineCategory;
