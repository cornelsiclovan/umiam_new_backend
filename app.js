const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");

const multer = require("multer");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const OrderItem = require("./models/order-item");
const Order = require("./models/order");
const Category = require("./models/category");
const Type = require("./models/type");
const Place = require("./models/place");

// swagger configuration

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Shop API",
//       version: "1.0.0",
//       description: "A basic Shop API",
//     },
//     servers: [
//       {
//         url: "http://localhost:8080",
//       },
//     ],
//   },
//   apis: ["./routes/*.js"],
// };

// const specs = swaggerJsDoc(options);

// end swagger configuration

const app = express();

// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const date = new Date().toISOString().replace(/:/g, "-");
    cb(null, date + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});


app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));


app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message: message, data: data });
});

/// Relations
Product.belongsTo(User, { constraints: true, onDelete: "RESTRICT" });
User.hasMany(Product);

Product.belongsTo(Category, { constraints: true, onDelete: "RESTRICT" });
Category.hasMany(Product);

Product.belongsTo(Type, { constraints: true, onDelete: "RESTRICT" });
Type.hasMany(Product);

Type.belongsTo(Category, { constraints: true, onDelete: "RESTRICT" });
Category.hasMany(Type);


Product.belongsTo(Place, { constraints: true, onDelete: "RESTRICT" });
Place.hasMany(Product);

Type.belongsTo(Place, { constraints: true, onDelete: "RESTRICT" });
Place.hasMany(Type);

Type.belongsTo(User, {constraints: true, onDelete: "RESTRICT"});
User.hasMany(Type);

User.hasOne(Cart);
Cart.belongsTo(User);

Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsTo(Place, {constraints: true, onDelete: "RESTRICT"});
Place.hasMany(Order)

Cart.belongsTo(Place, {constraints: true, onDelete: "RESTRICT"});
Place.hasMany(Cart);

Place.belongsTo(User, {constraints: true, onDelete: "RESTRICT"});
User.hasMany(Place);

Order.belongsToMany(Product, { through: OrderItem });

/// End relations

try {
//sequelize.sync({force: true});
sequelize.sync();
} catch (error) {  
  console.log(error);
}   
       
app.listen(8080);  
  