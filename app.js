const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {LIST_SCHEMA} = require("./schema.js");
const {REVIEW_SCHEMA} = require("./schema.js");
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {

    console.log("connected to DB");

}).catch((err) => {

    console.log(err);

})

async function main(){

    await mongoose.connect(MONGO_URL);

}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname , "/public")));
app.engine('ejs' , ejsMate);

app.get("/" , (req , res) => {

    res.send("This is root");

});

app.get("/listings" , wrapAsync(async (req , res) => {

    const allData = await Listing.find({});
    res.render("listings/index.ejs" , {allData});

}));

app.get("/listings/new" , (req , res) => {

    res.render("listings/new.ejs");

});

app.post("/listings" , wrapAsync(async (req , res , next) => {
    
    let result = LIST_SCHEMA.validate(req.body);

    if(result.error) throw new ExpressError(400 , result.error);

    const new_listing = new Listing(req.body.listing); 
    await new_listing.save();
    res.redirect("/listings");

}));

app.get("/listings/:id/edit" , wrapAsync(async (req , res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs" , {listing});

}));

app.put("/listings/:id" , wrapAsync(async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});

    res.redirect(`/listings/${id}`);

}));

app.delete("/listings/:id" , wrapAsync(async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");

}));

app.post("/listings/:id/reviews" , wrapAsync(async (req , res) => {

    let listing = await Listing.findById(req.params.id)
    let new_review = new Review(req.body.review);

    listing.reviews.push(new_review);

    await new_review.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));


app.get("/listings/:id" , wrapAsync(async (req , res) => {
    
    let {id} = req.params;
    const list = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs" , {list});
    
}));

app.delete("/listings/:id/reviews/:reviewId" , wrapAsync(async (req , res) => {

    let {id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);

}));

app.use((err , req , res , next) => {

    let {status = 500 , msg = "Something went wrong"} = err;
    res.status(status).render("listings/error.ejs" , {err});

})

app.listen(8080 , () => {

    console.log("Server is running on port 8080");

})