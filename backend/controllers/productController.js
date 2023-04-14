const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const ApiFeatures = require("../utils/apifeatures");

//create product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

//get All Products
exports.getAllProdcuts = catchAsyncError(async (req, res) => {
  const resultperPage = 5;
  const productCount= await Product.countDocuments();
  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultperPage); //euta page ma kati product display garne
  const products = await apiFeature.query; // class le return gareko query yaniki Product.find() nei ho
  res.status(200).json({
    success: true,
    products,
    productCount
  });
});

//get Single Product Details
exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404)); //ya next callback function ho 
  }
  res.status(200).json({
    success: true,
    product,
  });
});

//Update Product --Admin

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

//Delete Product

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(500).json({
      success: false,
      message: "Product not found",
    });
  }
  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});


//Create new review or update the review
exports.createProductReview=catchAsyncError(async(req,res,next)=>{
  const {rating,comment,productId}= req.body//yellai destructuring bhanxa  
  const review ={
      user:req.user._id,
      name:req.user.name,
      rating:Number(rating), //yo user le deko rating ho
      comment,
    };
    const product=await Product.findById(productId);
    const isReviewed = product.reviews.find(rev=>rev.user.toString()===req.user._id.toString())//(rev=>rev.user yelle review garne user ko id dinxa ra tespaxi yo id bata review garexa ki nai bhanne check garne logged in user ko id snga compare garera)
    
    if(isReviewed){
        product.reviews.forEach(rev=>{
          if(rev=>rev.user.toString()===req.user._id.toString())
            (rev.rating=rating),
            (rev.comment=comment);
          
        });
    }
    else{
      product.reviews.push(review);
      product.numofReviews=product.reviews.length;
    }
    let avg=0;
    product.reviews.forEach(rev=>{//yo product ko average rating ho overall
      avg+=rev.rating  
    });
    
    product.ratings= avg/product.reviews.length; 

    await product.save({
      validateBeforeSave:false,
    })
    res.status(200).json({
      success:true
    });
});
    

//Get All Reviews of a product
exports.getProductReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler("Product Not Found",404));

  }
  res.status(200).json({
    success:true,
    reviews: product.reviews,
  });
});

//Delete Review of a product
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.ProductId);
  if(!product){
    return next(new ErrorHandler("Product Not Found",404));

  }
  const reviews = product.reviews.filter(rev=>rev._id.toString()!== req.query.id.toString());//delete nagarne review filter out garne sab
  let avg=0;
    reviews.forEach(rev=>{//yo product ko average rating ho overall
      avg+=rev.rating  
    });
    
  const ratings= avg/reviews.length; 
   const numofReviews=reviews.length;
   await product.findByIdAndUpdate(req.query.productId,{
    reviews,
    ratings,
    numofReviews
   },
   {
    new:true,
    runValidators:true,
    useFindAndModify:false,
   })

  res.status(200).json({
    success:true,
  });


});

