import { Model, DataTypes, Op } from "sequelize";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function defineUser(sequelize) {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserAddress, {
        foreignKey: "userId",
        as: "userAddress",
      });
      User.hasMany(models.Order, { foreignKey: "userId" });
    }

    async correctPassword(inputPassword, userPassword) {
      return await bcrypt.compare(inputPassword, userPassword);
    }

    changedPasswordAfter(JWTTimestamp) {
      if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );
        return JWTTimestamp < changedTimestamp;
      }
      return false;
    }

    createPasswordResetToken() {
      const resetToken = crypto.randomBytes(32).toString("hex");
      this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
      return resetToken;
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM,
        values: ["guest", "user", "admin"],
        allowNull: true,
        defaultValue: "user",
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
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
      tableName: "users",
      modelName: "User",
      timestamps: false,
      hooks: {
        beforeSave: async (user, options) => {
          if (user.changed("password")) {
            user.password = await bcrypt.hash(user.password, 12);
          }
          if (!user.isNewRecord && user.changed("password")) {
            user.passwordChangedAt = Date.now() - 1000;
          }
        },
      },
      defaultScope: {
        attributes: {
          exclude: ["passwordChangedAt", "resetToken", "passwordExpire"],
        },
      },
    }
  );

  return User;
}

export default defineUser;
