const mongoose = require("mongoose");
const contactUsSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const contactUs = mongoose.model("contactUs", contactUsSchema);
module.exports = contactUs;