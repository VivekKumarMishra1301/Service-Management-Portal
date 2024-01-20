var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
const TermsAndCondition = require("../models/TermsAndCondition");


module.exports = {
    terms_and_condition: async (req, res) => {
        try {
            let TermAndCondition= await TermsAndCondition.find();
            if (TermAndCondition) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': " Terms and Conditions",
                    'body': TermAndCondition
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