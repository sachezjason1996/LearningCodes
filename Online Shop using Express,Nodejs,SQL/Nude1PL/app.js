const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const sequelize = require("./util/database.js");
const shopRoutes = require("./routes/shop");
const errorsController = require("./controllers/errors.js");
const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const { PassThrough } = require("stream");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // This is path for CSS
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});
app.use("/admin", adminRoutes); //Routes for admin.js
app.use(shopRoutes); //Routes for shop.js

app.use(errorsController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });




(async () => {
  try {
    console.log("Syncing models...");
    // Force recreation (optional)
    await sequelize.sync({ force: true });
    console.log("All models synced successfully.");

    // Seed a user (optional)
    let user = await User.findByPk(1);
    if (!user) {
      user = await User.create({ name: "Max", email: "test@test.com" });
    }

    // Seed product data (replace with your desired products)
    const products = [
      {
        title: "Product 1",
        price: 19.99,
        description: "A great product!",
        userId: user.id,
      },
      {
        title: "Product 2",
        price: 29.99,
        description: "Another awesome product!",
        userId: user.id,
      },
    ];

    const createdProducts = await Promise.all(products.map((product) => Product.create(product)));

    // Create a cart for the user
    let cart = await Cart.findOne({ where: { userId: user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: user.id });
    }

    // Add products to the cart
    await cart.addProducts(createdProducts);

    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Error syncing models:", err);
  }

  // Start the server
  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
})();
