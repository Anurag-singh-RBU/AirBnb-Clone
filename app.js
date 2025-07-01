const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

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

app.get("/" , (req , res) => {

    res.send("This is root");

});

app.get("/listings" , async (req , res) => {

    const allData = await Listing.find({});
    res.render("listings/index.ejs" , {allData});

});

app.get("/listings/new" , (req , res) => {

    res.render("listings/new.ejs");

});

app.post("/listings" , async (req , res) => {

    const new_listing = new Listing(req.body.listing);
    await new_listing.save();

    res.redirect("/listings");

});

app.get("/listings/:id/edit" , async (req , res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs" , {listing});

});

app.put("/listings/:id" , async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});

    res.redirect(`/listings/${id}`);

});

app.delete("/listings/:id" , async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");

})

app.get("/listings/:id" , async (req , res) => {

    let {id} = req.params;
    const list = await Listing.findById(id);
    res.render("listings/show.ejs" , {list});

});


app.listen(8080 , () => {

    console.log("Server is running on port 8080");

})