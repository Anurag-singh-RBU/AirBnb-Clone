const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LIST_SCHEMA = new Schema({

    title : {
        
        type : String,
        required : true,
    
    },
    description : String,
    image : {        
        
        type : String,
        default : "https://unsplash.com/photos/man-jumped-on-a-river-TEZZzuQTt8g",
        set : (v) => v === "" ? "https://unsplash.com/photos/man-jumped-on-a-river-TEZZzuQTt8g" : v,
    
    },
    price : Number,
    location : String,
    country : String,

});

const Listing = mongoose.model("Listing" , LIST_SCHEMA);
module.exports = Listing;