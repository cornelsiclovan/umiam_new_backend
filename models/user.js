const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    registryToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    registryTokenExpiration: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resetToken: {
        type: Sequelize.STRING,
        allowNull: true
    },
    resetTokenExpiration: {
        type: Sequelize.DATE,
        allowNull: true
    },
    isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isOwner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isEmployee: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    tableId: {
        type: Sequelize.INTEGER,
        defaultValue: null
    }
});

module.exports = User;