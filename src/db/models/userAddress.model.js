import { Model, DataTypes } from "sequelize";
import User from "./user.model";

class UserAddress extends Model {
  static associate(models) {
    UserAddress.belongsTo(models.User, { foreignKey: "userId" });
  }
}

function defineUserAddress(sequelize) {
  UserAddress.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      detail: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      province: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ward: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
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
      tableName: "user_addresses",
      modelName: "UserAddress",
      timestamps: false,
    }
  );

  return UserAddress;
}

export default defineUserAddress;
