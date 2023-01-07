const {Sequelize} = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:root123@localhost:5432/postgres');

async function connect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {connect, sequelize}
