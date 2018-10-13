var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");

// landing Page
router.get("/",function (req,res) {
	
	res.render("landing");

});

// routes are in compliance with RESTFUL routing
	
//**** Auth routes*****
router.get("/register",function(req,res) {

	res.render("register");
});

router.post("/register",function(req,res){
	var newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){

		if(err)
		{
			console.log(err);
			req.flash("error", err.message);
  			return res.redirect("/register");
		}
		// succesful registration, now log them in
		passport.authenticate("local")(req,res,function() {
			req.flash("success","Successfully Registered, Welcome!");
			res.redirect("/campgrounds");
		});
	});
});

// show login form
router.get("/login",function(req,res) {
// display the flash message too !
	res.render("login");
});
// run middleware authenticate
router.post("/login",passport.authenticate("local",
						{successRedirect:"/campgrounds",
						failureRedirect:"/login" }), function(req,res){});


router.get("/logout",function(req,res) {
	req.logout();
	req.flash("success","logged u out!");
	res.redirect("/campgrounds");
});




// middleware for checking whether the user has logged in
function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in!");
	res.redirect("/login");
}

module.exports=router;