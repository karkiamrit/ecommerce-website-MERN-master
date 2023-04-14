const mongoose=require('mongoose');

const productSchema=new mongoose.Schema({
    name:{
        type:String,
        require:[true,"Please enter product name"], //if false then warn to enter product name
        trim:true
    },
    description:
    {
        type:String,
        require:[true,"Please enter product description"]
    },
    price:{
        type:Number,
        require:[true,"Please enter product price"] ,
        maxLength:[8,'Price cannot exceed 8 digits']
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }],
    category:{
        type:String,
        require:[true,"Please enter product category"]
    },
    Stock:
    {
        type:Number,
        required:[true,'Please enter product stock'],
        maxLength:[4,"Stock cannot exceed 4 characters"],
        default:1
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{
            type:mongoose.Schema.ObjectId,
            ref:"User",
            required:true,
        },
        name:{
            type:String,
            required:true
        },
        rating:{
            type:String,
            required:true
        },
        comment:{
            type:String,
            required:true
        }
    }],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
module.exports=mongoose.model("Product",productSchema);