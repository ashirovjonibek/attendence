const express = require("express");
const router = express.Router();
const {User} = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("express");
require("dotenv").config();

router.post("/login", async (req, res) => {
        try {
            console.log(req.body)
            const {username, password} = req.body;
            if (!(username && password)) {
                res.status(422).send({status: 0, message: "Email and password is required!", data: null});
            }
            const user = await User.findOne({
                where: {username: username},
                attributes: ["firstname", "lastname", "username", "password"]
            });
            if (user && (await bcrypt.compare(password, user.password))) {

                console.log(user && (await bcrypt.compare(password, user.password)));
                let token = jwt.sign(
                    {user_id: user.id, username: user.username},
                    process.env.JWT_SECRET_KEY,
                    {
                        expiresIn: "24h",
                    }
                );
                let {firstname, lastname, username} = user;
                res.status(200).send({
                    status: 1, message: "User login successfully!", data: {
                        lastname, firstname, username, token
                    }
                });
            } else {
                res.status(401).send({status: 0, message: "Invalid login or password!", data: null});
            }
        } catch (err) {
            res.status(500).send({status: 0, message: "Error for login api!", data: err});
        }
    }
);

router.post("/auth-with-key", async (req, res) => {
    let {auth_key, ip} = req.body
    try {
        if (auth_key) {
            let user = await User.findOne({where: {auth_key}})
            if (user) {
                if (!user.connect_device) {
                    user.connect_device = true;
                    await user.save();
                    res.json({
                        status: true,
                        message: "success"
                    });
                } else {
                    res.json({message: "This user is connected to another device!", status: false})
                }
            } else {
                res.status(404).json({message: "No user found for this key!"})
            }
        } else {
            res.status(429).json({message: "Valid error", error: {auth_key: "Auth key is require!"}})
        }
    } catch (e) {
        res.status(500).json({message: "Error", error: e})
    }
})

router.post("/remove-device", async (req, res) => {
    let {auth_key} = req.body
    try {
        if (auth_key) {
            let user = await User.findOne({where: {auth_key}})
            if (user) {
                if (user.connect_device) {
                    user.connect_device = false;
                    await user.save();
                    res.json({
                        status: true,
                        message: "success"
                    });
                } else {
                    res.json({message: "This user is not connected to device!", status: false})
                }
            } else {
                res.status(404).json({message: "No user found for this key!"})
            }
        } else {
            res.status(429).json({message: "Valid error", error: {auth_key: "Auth key is require!"}})
        }
    } catch (e) {
        res.status(500).json({message: "Error", error: e})
    }
})

module.exports = {
    loginRoute: router
}