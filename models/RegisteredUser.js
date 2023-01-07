const {sequelize} = require("../config_db/sequelize_conf");
const {DataTypes, Model} = require('sequelize');

class User extends Model {
}

User.init({
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING
    },
    auth_key: {
        type: DataTypes.STRING
    },
    username: {
        type: DataTypes.STRING
    },
    password: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Users'
});

async function createDropUser() {
    try {
        await User.sync({force: true});
        console.log("The table for the User model was just (re)created!");
    } catch (e) {
        console.log("Error drop and create User!")
    }
}

module.exports = {
    User,
    createDropUser
}