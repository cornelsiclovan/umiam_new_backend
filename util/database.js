const Sequelize = require("sequelize");

const sequelize = new Sequelize("umiam_new", "root", "", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
