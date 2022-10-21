const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    placeId: {
        type: Sequelize.INTEGER,
        autoIncrement: false,
        allowNull: true,
    },
    total: {
        type: Sequelize.FLOAT,
        allowNull: true
    }
});

module.exports = Order;
