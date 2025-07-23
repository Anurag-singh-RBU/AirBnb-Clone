const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const plm = require("passport-local-mongoose");

const USER_SCHEMA = new Schema({

    email: {

        type: String,
        required: true,

    },

});

USER_SCHEMA.plugin(plm);
module.exports = mongoose.model("User", USER_SCHEMA);