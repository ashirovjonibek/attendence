const {sequelize} = require("../config_db/sequelize_conf");
const {DataTypes, Model} = require('sequelize');

class WifiIp extends Model {
}

WifiIp.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ip: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'WifiIp'
});

async function createDropWifiIp() {
    try {
        await WifiIp.sync({force: true});
        console.log("The table for the WifiIp model was just (re)created!");
    } catch (e) {
        console.log("Error drop and create WifiIp!")
    }
}

module.exports = {
    WifiIp,
    createDropWifiIp
}