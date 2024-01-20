var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
const Category = require("../models/Category");
/* GET users listing. */



module.exports = {
    getCategory: async (req, res) => {
        try {
            let Categories = (await Category.find({})).filter((item) => item.parentCount == 0);
            if (Categories.length > 0) {
                return res.sendStatus("200").json({
                    'success': "1",
                    'code': 200,
                    'message': "SubCategories",
                    'body': Categories
                });;
            }
            else {
                return helper.failed(res, 'No Catgeories yet.')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },

    getSubCategoryOfCategory: async (req, res) => {
        try {
            let SubCategories = await Category.find({ "parent": req.body.category });
            if (SubCategories.length > 0) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "SubCategories",
                    'body': SubCategories
                });
            }
            else {
                return helper.failed(res, 'No Sub Catgeories yet.')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },


}