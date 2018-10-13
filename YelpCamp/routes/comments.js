var express=require("express");
var router=express.Router();
var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");

// /*****Comments routes******/

// new comment form
// check if user logged in before opening page
router.get("/campgrounds/:id/comments/new",isLoggedIn,function(req,res){
Campground.findById(req.params.id,function(err,camp) {
	if(err)
		console.log("Error!");
	else{
			res.render("./comments/new",{camp:camp});	
	}
});
	
});

// create new comment
router.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){

	Campground.findById(req.params.id,function(err,camp) {
		if(err)
			console.log("error");
		else{
			Comment.create(req.body.comment,function(err,comment) {
				if(err)
				console.log("error");
				else{
					
					// add username and id
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					
					// save to DB
					comment.save();

					// assoc with campground
					camp.comments.push(comment);
					camp.save();
					req.flash("success","Successfully added comment!");
					res.redirect("/campgrounds/"+req.params.id);
				}		
			});
		}
	});
});

// Update and destroy routes for comments
// Update comments
router.get("/campgrounds/:id/comments/:cid/edit",checkCommentOwnership,function(req,res) {
	Comment.findById(req.params.cid,function(err,comment) {
		if(err)
			console.log("cant find comment");
		else{
			res.render("comments/edit",{camp_id:req.params.id,comment:comment});

		}

	});
	});

router.put("/campgrounds/:id/comments/:cid",checkCommentOwnership,function(req,res){

	Comment.findByIdAndUpdate(req.params.cid,req.body.comment,function(err,updatedComment){
		if(err)
		{
			console.log("could not update comment");
			req.flash("error","could not update comment!");
			
		}
		else
		{
			req.flash("success","Successfully updated comment!");
			res.redirect("/campgrounds/"+req.params.id);
		}

	});
});

// Delete Comments Route
router.delete("/campgrounds/:id/comments/:cid",checkCommentOwnership,function(req,res){
Comment.findByIdAndRemove(req.params.cid,function(err) {
	if(err) console.log("couldnt delete comment");
	else
	{
		req.flash("success","Successfully deleted comment!");
			
		res.redirect("/campgrounds/"+req.params.id);

}});

});


// middleware for checking whether the user has logged in
function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You need to be logged in!");
	res.redirect("/login");
}



// middleware to check login and ownership of comments
function checkCommentOwnership(req,res,next) {
	// is user logged in 
		if(req.isAuthenticated()){
					// true
		// does the user own comment?
			Comment.findById(req.params.cid,function(err,foundComment){
	
			if(err){
				req.flash("error","couldnt find comment!");
					console.log("couldnt find comment");
					res.redirect("back");

			}
			else
			{	//check if user owns comment			
				//type mismatch so use .equals()
				if(foundComment.author.id.equals(req.user._id))
					// authorized
					next();
				else
					{req.flash("error","You dont have permission to do that as you are not the owner of the comment!");
	
					res.redirect("back");	}
			}	
			
		});
		}
		else{
			req.flash("error","You need to be logged in!");
			res.redirect("/login");
		}

}

module.exports=router;