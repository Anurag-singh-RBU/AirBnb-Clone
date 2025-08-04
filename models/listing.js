const Review = require('./review');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const MAPtoken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: MAPtoken });

const LIST_SCHEMA = new Schema({

    title : {
        
        type : String,
        required : true,
    
    },
    description : String,
    image : {        
        
        url : String,
        filename : String, 

    },

    price : Number,
    location : String,
    country : String,

    reviews : [{

        type: Schema.Types.ObjectId,
        ref: "Review"

    }],

    owner : {
        
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,

    },

    geometry : {

        type : {

            type: String,
            enum: ['Point'],
            required: true

        },

        coordinates: {

            type: [Number],
            required: true
            
        }

    }
});

LIST_SCHEMA.post("findOneAndDelete" , async (listing) => {

    if(listing){

        await Review.deleteMany({_id: {$in: listing.reviews}});
        
    }
    
})

const Listing = mongoose.model("Listing" , LIST_SCHEMA);
module.exports = Listing;