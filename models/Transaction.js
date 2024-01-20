const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    status: {
        type: String
    },
    transactionId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;