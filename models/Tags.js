const mongoose = require("mongoose");
const TagsSchema = new mongoose.Schema({
    tagName: {
        type: String,
        required: true,
    },
    status: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Tags = mongoose.model("Tags", TagsSchema);
module.exports = Tags;