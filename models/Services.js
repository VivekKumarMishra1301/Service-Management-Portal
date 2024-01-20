const mongoose = require("mongoose");
const ServiceSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    serviceType: {
        type: String
    },
    amount: {
        type: String,
    },
    serviceTime: {
        type: String
    },
    rating: {
        type: String
    },
    category: {
        type: String
    }

});
const Service = mongoose.model("Services", ServiceSchema);
module.exports = Service;