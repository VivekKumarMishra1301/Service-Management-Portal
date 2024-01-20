var express = require('express');
var router = express.Router();
const { Validator } = require('node-input-validator');
const helper = require('../helper');
var jwt = require("jsonwebtoken");
const Users = require("../models/User");
const Recipes = require("../models/Recipies");


module.exports = {
    recipe_details: async (req, res) => {
        try {
            const recipeID = req.query.recipeID;
            const recipe = await Recipes.findOne({ _id: recipeID });
            if (recipe) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "",
                    'body': recipe
                });
            }
            else {
                return helper.failed(res, 'Recipe not found')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },


    recipe_list: async (req, res) => {
        try {
            const recipes = await Recipes.find();
            if (recipes) {
                return res.status(200).json({
                    'success': "1",
                    'code': 200,
                    'message': "",
                    'body': recipes
                });
            }
            else {
                return helper.failed(res, 'No recipes yet.')
            }
        } catch (error) {
            console.log(error, '======error');
        }
    },

    add_recipe: async (req, res) => {
        try {
            let v = new Validator(req.body, {
                name: 'required',
                tags: 'required',
                creatorName: "required",
                status: 'required',
                description: 'required',
                ingredients: 'required'
            });

            var errorsResponse
            await v.check().then(function (matched) {
                if (!matched) {
                    var valdErrors = v.errors;
                    var respErrors = [];
                    Object.keys(valdErrors).forEach(function (key) {
                        if (valdErrors && valdErrors[key] && valdErrors[key].message) {
                            respErrors.push(valdErrors[key].message);
                        }
                    });
                    errorsResponse = respErrors.join(', ');
                }
            });
            if (errorsResponse) {
                return helper.failed(res, errorsResponse)
            }
            let { name,
                tags,
                creatorName,
                status,
                description,
                ingredients } = req.body;
            if (req.file) {
                const file = req.file.filename;
                const fileType = req.file.mimetype.split('/')[0];
                if (fileType == "video") {
                    let saveRecipes = await Recipes.create({
                        name: name,
                        creatorName: creatorName,
                        tags: tags,
                        status: status,
                        description: description,
                        ingredients: ingredients,
                        file: file,
                        fileType: fileType
                    });
                    if (saveRecipes) {
                        return res.status(200).json({
                            'success': "1",
                            'code': 200,
                            'message': "Recipe added successfully",
                            'body': saveRecipes
                        });
                    }
                } else {
                    return helper.failed(res, 'Video must be valid !');

                }
            } else {
                return helper.failed(res, 'Video is required!');

            }
        } catch (error) {
            console.log(error, '======error');
        }
    },

}