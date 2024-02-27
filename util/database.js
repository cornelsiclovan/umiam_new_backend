const Sequelize = require("sequelize");

const sequelize = new Sequelize("umiam_new", "root", "", {
  dialect: "mysql",
  host: "localhost",
  timezone: "+02:00"
});

module.exports = sequelize;