var express=require("express");
var router=express.Router();
var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");

// INDEX Page
router.get("/campgrounds",function (req,res) {

	// get all Camp grounds from DB and send to campground.ejs to render it
	Campground.find({},function(err,camps)
	{
		if(err)
			console.log("Could not retrive from DB");
		else
			console.log("Retreived the following Camps:\n"+camps);
	// send all found camps and also send the user info to check if user logged in
			res.render("./campgrounds/campgrounds",{campgrounds:camps});
	});
	
});

// add new campgrounds
// NEW route
router.get("/campgrounds/new",isLoggedIn,function (req,res) {

	res.render("./campgrounds/new");
});

// Create route
router.post("/campgrounds",isLoggedIn,function(req,res){

	// get data from form 
	var name=req.body.cname;
	var img=req.body.cimg;
	var desc=req.body.cdesc;
	var author={id:req.user._id,
				username:req.user.username};

	var newCamp={name:name,image:img,desc:desc,author:author};
	
	// add data to campground DB
	Campground.create(newCamp,function (err,newcamp) {
		// body...

		if(err)
		{
			console.log("Something Went wrong! Could not save to DB");
		}
		else
		{
			console.log("Yeppee!! Succesfully addded new Camp!: ",newcamp);
			req.flash("success","Successfully added camp!");
					
			// redirect to /campgrounds page
			res.redirect("/campgrounds");

		}
	});
});

// Display individual Camp Details--should be after camp../new
// SHOW route
router.get("/campgrounds/:id",function(req,res){

	// find the campground by ID and pop comments and  render page
	var id=req.params.id;
	Campground.findById(id).populate("comments").exec(function (err,foundCamp) {
	
		if(err)
		{
			console.log("Something went really wrong!!");
		}
		else
		{
			res.render("./campgrounds/show",{campDetails:foundCamp});		
		}
	});
	
});

// EDIT campground route
	router.get("/campgrounds/:id/edit",checkCampOwnership,function(req,res){
		
		// authenticated and authorized
			Campground.findById(req.params.id,function(err,foundCamp){
					if(err) console.log("error");
					else
					res.render("campgrounds/edit",{camp:foundCamp});
				
			});
	});

// UPDATE campground route
	router.put("/campgrounds/:id",checkCampOwnership,function(req,res) {
		
		var updatedCamp={name:req.body.cname,
						image:req.body.cimg,
						desc:req.body.cdesc};
		
		// find the campground and update
		Campground.findByIdAndUpdate(req.params.id,updatedCamp,function(err,updatedCamp){

			if(err)
				console.log("couldnt update camp");
			else
				{ req.flash("success","Successfully updated camp!");
				res.redirect("/campgrounds/"+updatedCamp._id);	
				}
		});	
	});

// deleting a  Campground DESTROY
router.delete("/campgrounds/:id",checkCampOwnership,function(req,res) {
	// find camp and remove comments assoc with it
	Campground.findById(req.params.id,function(err,camp){
		if(err)
			console.log("couldnt find camp");
		else{
				//find every assoc comment and delete it
				camp.comments.forEach(function(comment_id) {

					console.log(comment_id);

					Comment.findByIdAndRemove(comment_id,function(err) {
						if(err)
							console.log("couldnt'delete comments");
					});
				}) ;
		} });

// Now, finally delete Campground
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err)
			console.log("Could not delete!");
		res.redirect("/campgrounds");
	});


});

// middleware for checking whether the user has logged in
function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in!");
	res.redirect("/login");
}


// middleware to check login and ownership of camp
function checkCampOwnership(req,res,next) {
	// is user logged in 
		if(req.isAuthenticated()){
					// true
		// does the user own campground?
			Campground.findById(req.params.id,function(err,foundCamp){
	
			if(err){
				console.log("couldnt find campground");
				req.flash("error","couldnt find campground");
				res.redirect("back");
	
			}
			else
			{	//check if user owns campground				
				//type mismatch so use .equals()
				if(foundCamp.author.id.equals(req.user._id))
					// authorized
					next();
				else
					{req.flash("error","You dont have permission to do that as you are not the owner of the post!");
	
					res.redirect("back");	}
			}
			
		});
		
		}else{
			req.flash("error","You need to be logged in!");
			res.redirect("/login");
		}

}


module.exports=router;
