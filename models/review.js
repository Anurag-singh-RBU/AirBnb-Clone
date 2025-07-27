const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const REVIEW_SCHEMA = new Schema({

    comment : String,
    rating : {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },  
    createdAt : {
        type: Date,
        default: Date.now
    },
    author : {
        type: Schema.Types.ObjectId,
        ref: "User",
    }
});

module.exports = mongoose.model("Review", REVIEW_SCHEMA);