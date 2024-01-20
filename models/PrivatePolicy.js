const mongoose = require("mongoose");
const PrivatePolicySchema = new mongoose.Schema({
    policy: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const PrivatePolicy = mongoose.model("PrivatePolicy", PrivatePolicySchema);
module.exports = PrivatePolicy;