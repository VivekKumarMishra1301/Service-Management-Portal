var jwt = require("jsonwebtoken");
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(express.json());
const Users = require("../models/User");


async function authenticateToken(req, res, next) {
    if (req.headers && req.headers.authorization) {
        var authorization = req.headers.authorization,
            decoded;
        try {
            decoded = jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET);
        } catch (e) {
            return res.status(401).send('unauthorized');
        }
        var userId = decoded.id;
        // Fetch the user by id
        Users.findOne({ _id: userId }).then(function (user) {
            // Do something with the user
            req.user = user;
            next();
        });
    } else {
        return res.status(500);
    }
}

module.exports = authenticateToken
