const mongoose = require("mongoose");
const RecipesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    creatorName: {
        type: String,
        required: true,
    },
    file: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    ingredients: {
        type: String,
        required: true,
    },
    tags: {
        type: Array,
    },
    status: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Recipes = mongoose.model("Recipes", RecipesSchema);
module.exports = Recipes;