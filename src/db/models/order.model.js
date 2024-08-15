import { Model, DataTypes } from "sequelize";

function defineOrder(sequelize) {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: "userId" });
      Order.belongsTo(models.UserAddress, { foreignKey: "addressId" });
      Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
    }

    // static async calculateOrderValue(order) {
    //   console.log(order);

    //   console.log(await sequelize.models.OrderItem.findAll());

    //   const orderItems = await sequelize.models.OrderItem.findAll({
    //     where: { orderId: order.dataValues.id },
    //     // include: [
    //     //   { model: sequelize.models.Product },
    //     //   { model: sequelize.models.ProductVariantCombination },
    //     // ],
    //   });

    //   console.log(orderItems);

    //   const totalValue = orderItems.reduce((sum, item) => {
    //     let price = 0;
    //     if (item.productVariantCombination) {
    //       price =
    //         item.productVariantCombination.salePrice ||
    //         item.productVariantCombination.originalPrice;
    //     } else if (item.product) {
    //       price = item.product.salePrice || item.product.originalPrice || 0;
    //     }
    //     return sum + price * item.quantity;
    //   }, 0);

    //   order.value = totalValue;
    // }
  }
  Order.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      addressId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: [
          "pending",
          "approved",
          "shipping",
          "delivered",
          "rejected",
          "cancelled",
        ],
        defaultValue: "pending",
      },
      addressDetail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ward: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "orders",
      modelName: "Order",
      timestamps: false,
      // hooks: {
      //   beforeSave: async (order, options) => {
      //     await Order.calculateOrderValue(order);
      //   },
      // },
    }
  );

  return Order;
}

export default defineOrder;
