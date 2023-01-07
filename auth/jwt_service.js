const jwt = require("jsonwebtoken");

const config = process.env;

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).send({status: 0, message: "A token is required for authentication", data: null});
    }
    try {
        let tkn = token.substring(token.indexOf("Bearer ") + 7, token.length);
        let user = jwt.verify(tkn, config.JWT_SECRET_KEY);
        console.log(new Date(user.exp));
        if (new Date().getTime() + user.exp < new Date().getTime()) {
            return res.status(403).send({status: 0, message: "A token is expire!", data: null});
        }
        req.user = user;
    } catch (err) {
        return res.status(401).send({status: 0, message: "Invalid token!", data: null});
    }
    return next();
};

module.exports = {verifyToken};