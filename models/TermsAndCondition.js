const mongoose = require("mongoose");
const TermsAndConditionSchema = new mongoose.Schema({
    termsAndCondition: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const TermsAndCondition = mongoose.model("TermsAndCondition", TermsAndConditionSchema);
module.exports = TermsAndCondition;