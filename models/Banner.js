const mongoose = require("mongoose");
const BannerSchema = new mongoose.Schema({
    image: {
        type: String
    }
});
const Banner = mongoose.model("Banner", BannerSchema);
module.exports = Banner;