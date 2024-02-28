const Sequelize = require("sequelize");

const sequelize = new Sequelize("umiam_new", "root", "", {
  dialect: "mysql",
  host: "localhost",
  dialectOptions: {
    options: {
      useUTC: false, // for reading from database
    },
  },
  timezone: "+02:00"
});

module.exports = sequelize;  