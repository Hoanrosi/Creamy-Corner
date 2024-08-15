import { Model, DataTypes } from "sequelize";

function defineOrderItem(sequelize) {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: "orderId" });
      OrderItem.belongsTo(models.Product, {
        foreignKey: "productId",
        constraints: false,
      });
      OrderItem.belongsTo(models.ProductVariantCombination, {
        foreignKey: "productVariantCombinationId",
        constraints: false,
      });
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      productId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      productVariantCombinationId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "order_items",
      modelName: "OrderItem",
      timestamps: false,
      hooks: {
        beforeSave: async (orderItem, options) => {
          if (
            (!orderItem.productId && !orderItem.productVariantCombinationId) ||
            (orderItem.productId && orderItem.productVariantCombinationId)
          ) {
            throw new Error(
              "Either productId or productVariantCombinationId must be set, but not both."
            );
          }

          if (orderItem.productId) {
            const productExists = await Product.findByPk(orderItem.productId);
            if (!productExists) {
              throw new Error(
                `Product with ID ${orderItem.productId} not found.`
              );
            }
          }

          if (orderItem.productVariantCombinationId) {
            const variantExists = await ProductVariantCombination.findByPk(
              orderItem.productVariantCombinationId
            );
            if (!variantExists) {
              throw new Error(
                `ProductVariantCombination with ID ${orderItem.productVariantCombinationId} not found.`
              );
            }
          }
        },
      },
    }
  );

  return OrderItem;
}

export default defineOrderItem;
