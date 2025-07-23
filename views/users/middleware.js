module.exports.isLoggedIn = (req, res, next) => {

    if(!req.isAuthenticated()){

        req.session.redirectTo = req.originalUrl;
        req.flash("error" , "You must be logged in to create a listing");
        return res.redirect("/login");

    }

    next();

}