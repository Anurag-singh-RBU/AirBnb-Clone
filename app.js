const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js");
const path = require("path");

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

app.get("/" , (req , res) => {

    res.send("This is root");

});

app.get("/listings" , async (req , res) => {

    const allData = await Listing.find({});
    res.render("listings/index.ejs" , {allData});

});

app.get("/listings/:id" , async (req , res) => {

    let {id} = req.params;
    const list = await Listing.findById(id);
    res.render("listings/show.ejs" , {list});

})

app.listen(8080 , () => {

    console.log("Server is running on port 8080");

})