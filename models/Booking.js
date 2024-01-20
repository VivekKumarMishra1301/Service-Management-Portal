const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema({
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    date: {
        type: String
    },
    service: {
        type: String
    }
});
const Booking = mongoose.model("Bookings", BookingSchema);
module.exports = Booking;