const { DataTypes } = require('sequelize');
const sequelize = require('../util/database'); // Adjust the path as necessary

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'users' // Explicitly specify table name to avoid conflicts
});

module.exports = User;
