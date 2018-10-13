var	mongoose=require("mongoose");
// set up mDB schema
var campGroundSchema=new mongoose.Schema({

	name:String,
	image:String,
	desc:String,
	
	author: {
    			id:{
    					type:mongoose.Schema.Types.ObjectId,
    					ref: "User"
    			   },
    			username:String   

    		},

	comments:[{
				type:mongoose.Schema.Types.ObjectId,
				ref: "Comment"
	}]

});

// make model of Schema
module.exports=mongoose.model("Campground",campGroundSchema);

