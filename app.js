if(process.env.NODE_ENV !== "production"){

    require('dotenv').config();

}

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
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./views/users/middleware.js");
const multer = require("multer");
const {storage} = require("./cloudConfig.js");
const upload = multer({storage});

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

const sessionOptions = {

    secret: "SECRET_KEY",
    resave: false,
    saveUninitialized: true,
    cookie: {

        expires : Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days (in ms) -> days * hrs * mins * secs * ms
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,

    }

}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.current = req.user;

    next();
    
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/demo" , async (req , res) => {

    let FAKE = new User({email: "churan@gmail.com" , username: "churan"});
    let FAKE_USER = await User.register(FAKE , "churan123");

    res.send(FAKE_USER);

});

app.get("/" , (req , res) => {

    console.log("Current user : ", req.user);
    res.send("This is root");

});

app.get("/listings" , wrapAsync(async (req , res) => {

    const allData = await Listing.find({});
    res.render("listings/index.ejs" , {allData});

}));

app.get("/listings/new" , isLoggedIn , (req , res) => {

    res.render("listings/new.ejs");

});

app.post("/listings" , upload.single("listing[image]") , wrapAsync(async (req , res , next) => {
    
    // let result = LIST_SCHEMA.validate(req.body);

    // if(result.error) throw new ExpressError(400 , result.error);

    // const new_listing = new Listing(req.body.listing); 
    
    // new_listing.owner = req.user._id;

    // await new_listing.save();

    // res.redirect("/listings");

    res.send(req.file);

}));

app.get("/listings/:id/edit" , isLoggedIn , wrapAsync(async (req , res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs" , {listing});

}));

app.put("/listings/:id" , isLoggedIn , wrapAsync(async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndUpdate(id , {...req.body.listing});

    res.redirect(`/listings/${id}`);

}));

app.delete("/listings/:id" , isLoggedIn , wrapAsync(async (req , res) => {

    let {id} = req.params;
    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");

}));

app.post("/listings/:id/reviews" , isLoggedIn , wrapAsync(async (req , res) => {

    let listing = await Listing.findById(req.params.id)
    let new_review = new Review(req.body.review);

    new_review.author = req.user._id;

    listing.reviews.push(new_review);

    await new_review.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));


app.get("/listings/:id" , isLoggedIn , wrapAsync(async (req , res) => {
    
    let {id} = req.params;
    const list = await Listing.findById(id).populate({path : "reviews" , populate : {path : "author"}}).populate("owner");
    res.render("listings/show.ejs" , {list});
    
}));

app.get("/signup" , (req , res) => {

    res.render("users/signup.ejs");

});

app.post("/signup" , wrapAsync (async (req , res) => {

    try{

        let {email , username , password} = req.body;
        let NEW_USER = new User({email , username});
        const REGISTERD = await User.register(NEW_USER , password);

        req.login(REGISTERD , (err) => {

            if(err) return next(err);

            req.flash("success" , "Welcome to Wanderlust !");
            return res.redirect("/listings");

        });

    } catch(err) {

        req.flash("error" , err.message); 
        res.redirect("/signup");

    }


}));

app.get("/login" , (req , res) => {

    res.render("users/login.ejs");

});

app.post("/login" , passport.authenticate("local" , {failureFlash: true ,failureRedirect: "/login",}), (req , res) => {

    req.flash("success" , "Welcome Back !");
    res.redirect(req.session.redirectTo || "/listings");

});

app.get("/logout" , (req , res , next) => {

    req.logout((err) => {

        if(err) return next(err);

        req.flash("success" , "Logged out successfully");
        res.redirect("/listings");

    });
});

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