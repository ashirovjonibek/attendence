const {sequelize} = require("../config_db/sequelize_conf");
const {DataTypes, Model} = require('sequelize');

class FaceRecognition extends Model {
}

FaceRecognition.init({
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    descriptions: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'FaceRecognition'
});

async function createDropFaceRecognition() {
    try {
        await FaceRecognition.sync({force: true});
        console.log("The table for the FaceRecognition model was just (re)created!");
    } catch (e) {
        console.log("Error drop and create FaceRecognition!")
    }
}

module.exports = {
    FaceRecognition,
    createDropFaceRecognition
}