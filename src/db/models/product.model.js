import { Model, DataTypes, where } from "sequelize";

function defineProduct(sequelize) {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.ProductImage, { foreignKey: "productId" });
      Product.hasMany(models.Variant, { foreignKey: "productId" });
      Product.belongsToMany(models.Category, {
        through: models.ProductsCategory,
        foreignKey: "productId",
        onDelete: "CASCADE",
      });
      Product.hasMany(models.ProductVariantCombination, {
        foreignKey: "productId",
      });
    }

    static async updateStatusBasedOnStock(product) {
      if (product.stock === 0) {
        product.status = false;
      } else {
        const combinations =
          await sequelize.models.ProductVariantCombination.findAll({
            where: { productId: product.id },
          });

        const allCombinationsOutOfStock = combinations.every(
          (combination) => combination.stock === 0
        );

        product.status = !allCombinationsOutOfStock;
      }
    }
    static async updateMinPrice(product) {
      const combinations =
        await sequelize.models.ProductVariantCombination.findAll({
          where: { productId: product.id },
        });

      if (combinations.length > 0) {
        product.minPrice = Math.min(
          ...combinations.map(
            (combination) => combination.salePrice || combination.originalPrice
          )
        );
      } else {
        product.minPrice = null;
      }
    }

    static async updateMaxPrice(product) {
      const combinations =
        await sequelize.models.ProductVariantCombination.findAll({
          where: { productId: product.id },
        });

      if (combinations.length > 0) {
        product.maxPrice = Math.max(
          ...combinations.map(
            (combination) => combination.salePrice || combination.originalPrice
          )
        );
      } else {
        product.maxPrice = null;
      }
    }
  }
  Product.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "NoBrand",
      },
      purchases: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      rate: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true,
        defaultValue: 0.0,
        validate: {
          min: 0.0,
          max: 5.0,
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
      originalPrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      salePrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      defaultImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      minPrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      maxPrice: {
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
      tableName: "products",
      modelName: "Product",
      timestamps: false,
      defaultScope: {
        attributes: { exclude: ["isActive"] },
      },
    }
  );

  return Product;
}

export default defineProduct;
