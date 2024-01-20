var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
const Tags = require("../models/Tags");


module.exports = {
    tags_list: async (req, res) => {
        try {
            const tags = await Tags.find();
            if (tags) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "",
                    'body': tags
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