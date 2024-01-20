var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');

const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
const PrivacyPolicy = require("../models/PrivatePolicy");


module.exports = {
    privacy_policy: async (req, res) => {
        try {
            let Privacy_policy = await PrivacyPolicy.find({});
            if (Privacy_policy) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "Privacy Policy",
                    'body': Privacy_policy
                });
            }
            else {
                return helper.failed(res, 'No tags yet.')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },
}