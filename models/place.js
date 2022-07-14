const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Place = sequelize.define('place', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    location: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tableNumber: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
});

module.exports = Place;
