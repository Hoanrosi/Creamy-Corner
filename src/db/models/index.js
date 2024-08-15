import { Sequelize } from "sequelize";
import config from "../config/config.mjs";
import defineCategory from "./category.model";
import defineOrder from "./order.model";
import defineOrderItem from "./orderItem.model";
import defineProduct from "./product.model";
import defineProductsCategory from "./productsCategory.model";
import defineProductImage from "./productImage.model";
import defineProductVariantCombination from "./productVariantCombination.model";
import defineUser from "./user.model";
import defineUserAddress from "./userAddress.model";
import defineVariant from "./variant.model";
import defineVariantValue from "./variantValue.model";

const env = process.env.NODE_ENV;
const dbConfig = config[env];
const db = {};

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}

const models = {
  Category: defineCategory(sequelize, Sequelize.DataTypes),
  Order: defineOrder(sequelize, Sequelize.DataTypes),
  OrderItem: defineOrderItem(sequelize, Sequelize.DataTypes),
  Product: defineProduct(sequelize, Sequelize.DataTypes),
  ProductsCategory: defineProductsCategory(sequelize, Sequelize.DataTypes),
  ProductImage: defineProductImage(sequelize, Sequelize.DataTypes),
  ProductVariantCombination: defineProductVariantCombination(
    sequelize,
    Sequelize.DataTypes
  ),
  User: defineUser(sequelize, Sequelize.DataTypes),
  UserAddress: defineUserAddress(sequelize, Sequelize.DataTypes),
  Variant: defineVariant(sequelize, Sequelize.DataTypes),
  VariantValue: defineVariantValue(sequelize, Sequelize.DataTypes),
};

for (let key in models) {
  db[models[key].name] = models[key];
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

export default db;
