const bcrypt = require("bcrypt");
const express = require("express");
const fileUpload = require("express-fileupload");
require('dotenv').config();
const {sequelize, connect} = require("./config_db/sequelize_conf");
const {createDropUser, User} = require("./models/User");
const {createDropFaceRecognition} = require("./models/FaceRecognation");
const {loadModels} = require("./face_api/models/face_rec_service");
const {userRegisterRoute} = require("./services/face_service");
const {loginRoute} = require("./services/login");
const {verifyToken} = require("./auth/jwt_service");
const {createDropWifiIp} = require("./models/WifiIp");
const port = process.env.SERVER_PORT || 8080

const app = express();
app.use(express.urlencoded({extended: true}))
app.use(
    fileUpload({useTempFiles: true})
);

app.use("/api", userRegisterRoute)
app.use("/api", loginRoute)

app.listen(port, async () => {
    console.log(`server started in ${port} port!`)
    await loadModels();
    await connect();
    // await createDropWifiIp()
    // await createDropFaceRecognition()
    // await createDropUser()
    //
    // await User.create({
    //     lastname: "Doe",
    //     firstname: "John",
    //     username: "admin123",
    //     password: await bcrypt.hash("admin123", 10)
    // })

    // console.log(await User.findAll())
})