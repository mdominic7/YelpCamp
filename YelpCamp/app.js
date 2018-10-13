var express=require("express");
var app=express();

// body parser
var bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

// mongoose
var	mongoose=require("mongoose");

// passport 
var passport=require("passport");
var LocalStrategy=require("passport-local");

// method override
var methodOverride= require("method-override");
app.use(methodOverride("_method"));


// User
var User=require("./models/user");

// from models/campgrounds.js
var Campground=require("./models/campgrounds");

// seeds file
//var seedDB=require("./seeds");

app.use(express.static(__dirname+"/public"));
// IMPORTANT if u want to seed the DB with sample data, uncomment the line below
// connect to the mongoDB; is the name of the DB to connect to, if none exists,it will be newly created
var options={
	useNewUrlParser:true,
};
mongoose.connect("mongodb://localhost:27017/yelpCamp_app_v7",options);
// seedDB();

// comments
var Comment=require("./models/comment");

// passport conf
app.use(require("express-session")({
	secret: "Rusty",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// connect-flash for messages
var flash=require("connect-flash");
app.use(flash());


// set view engine
app.set("view engine","ejs");

// define middleware for user login info for all routes for navbar display
app.use(function(req,res,next) {
	// respond sending currentUser local var
	res.locals.currentUser=req.user;
	//send all error flash messages to messages vars thats available throughout 
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

// ROUTES
var commentRoutes=require("./routes/comments");
var campgroundRoutes=require("./routes/campgrounds");
var auth_indexRoutes=require("./routes/index");
app.use(auth_indexRoutes);
app.use(campgroundRoutes);
app.use(commentRoutes);

app.listen(3000,function () {
	// body...
	console.log("The YELP Server Started!");
});