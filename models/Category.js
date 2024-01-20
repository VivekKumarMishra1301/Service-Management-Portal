const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema({
    parent: {
        type: String,
        allowNull: false
    },
    parentCount:{
        type:Number
    },
    branch:{
        type:Array
    },
    name:{
        type:String,
    },
    created_by_user_id:{
        type: String
    }
});
const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category;