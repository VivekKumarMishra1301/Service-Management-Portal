const mongoose = require("mongoose");
const ReportsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Reports = mongoose.model("Reports", ReportsSchema);
module.exports = Reports;

