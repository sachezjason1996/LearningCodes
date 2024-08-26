// const mysql = require('mysql2');

// const pool = mysql.createPool(
// {
//     host:  'localhost',
//     user: 'root',
//     database: 'nodecomplete',
//     password: '12345'
// });

// module.exports = pool.promise();

const Sequelize = require('sequelize');

const sequelize = new Sequelize('nodecomplete', 'root', '12345',{    
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;

