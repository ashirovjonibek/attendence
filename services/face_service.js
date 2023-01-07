const uuid = require("uuid")
const express = require("express");
const router = express.Router();
const {getDescriptions, getDescriptorsFromDB} = require("../face_api/models/face_rec_service");
const {FaceRecognition} = require("../models/FaceRecognation");
const {User} = require("../models/User");
const {verifyToken} = require("../auth/jwt_service");
const {WifiIp} = require("../models/WifiIp");

router.post("/post-user", verifyToken, async (req, res) => {
    console.log(req.body)
    let {firstname, lastname} = req.body
    let key = uuid.v4().toString()
    let files = req.files
    if (files && files.files && files.files.length) {
        let errors = {};
        if (!lastname) {
            errors.lastname = "Last name is require!";
        }
        if (!firstname) {
            errors.firstname = "First name is require!";
        }
        if (Object.keys(errors).length > 0) {
            res.status(429).json({
                message: "Validator errors!",
                errors: errors
            })
        }

        let dirs = files.files.map(f => f.tempFilePath)
        let desc = await getDescriptions(dirs, "data");
        User.create({
            lastname, firstname, auth_key: key
        }).then(async () => {
            await FaceRecognition.create({
                key,
                descriptions: desc
            })
            res.json({m: "success", message: "User registered successfully"})
        }).catch(errors => {
            res.status(500).json({message: "Error!!", errors: errors})
        })
    } else {
        res.status(429).json({message: "File is require!"})
    }
})

router.post("/check-face", async (req, res) => {
    let img = req.files.img
    try {
        if (img) {
            let result = await getDescriptorsFromDB(img.tempFilePath);
            result = result[0]
            res.json({
                message: "success",
                data: await User.findOne({
                    where: {auth_key: result["_label"]},
                    attributes: ["id", "lastname", "firstname", "auth_key", "createdAt", "updatedAt"]
                })
            });
        } else {
            res.status(429).json({
                message: "Img is require"
            })
        }
    } catch (e) {
        res.status(500).json({
            message: "Error",
            error: e
        })
    }
})

router.post("/add-wifi-ip", verifyToken, async (req, res) => {
    let {ip, name} = req.body
    if (ip) {
        let wifiIp = await WifiIp.findOne({where: {ip}})
        if (wifiIp) {
            res.status(429).json({message: "Wi-Fi is available at this IP address. Please change the ip and try again!"})
        } else {
            let newWifi = await WifiIp.create({
                name, ip
            })
            res.json({message: "Success", data: newWifi})
        }
    } else res.status(429).json({message: "Ip is required!"})
})

router.get("/get-all-wifi", verifyToken, async (req, res) => {
    try {
        res.json({message: "All wifi addresses!", data: await WifiIp.findAndCountAll()})
    } catch (e) {
        res.status(500).json({message: "Error", error: e})
    }
})

router.delete("/delete-wifi", verifyToken, async (req, res) => {
    try {
        let {ip} = req.query
        let wifi = await WifiIp.findOne({where: {ip}})
        if (wifi) {
            res.json({message: "Wifi deleted successfully!", data: await WifiIp.destroy({where: {ip}})})
        } else {
            res.status(404).json({message: "Wifi ip address not fount!"})
        }
    } catch (e) {
        res.status(500).json({message: "Error", error: e})
    }
})

router.get("/check-wifi-ip", verifyToken, async (req, res) => {
    let {ip} = req.query
    if (ip) {
        let wifiIp = await WifiIp.findOne({where: {ip}})
        if (wifiIp) {
            res.status(401).json({message: "It is not possible to log in with this IP address!"})
        } else {
            res.json({message: "Success", auth: true})
        }
    } else res.status(429).json({message: "Ip is required!"})
})

module.exports = {
    userRegisterRoute: router
}