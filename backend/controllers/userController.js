const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const comparePassword=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const crypto=require("crypto");

//Register a User
exports.registerUser = catchAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "this is a sample id",
            url: "profilepicUrl"
        }
    });
    sendToken(user, 201, res);
});

//User Login
exports.loginUser = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    //checking if user has given both email and password'
    if (!email || !password) {
        return next(new ErrorHandler("Please Enter a valid Email and Password", 400))
    }
    const user = await User.findOne({ email }).select("+password"); //ya select password kina gareko bhanda originally fina garda password select false rakheko thiyo 
    if (!user) {
        return next(new ErrorHandler("Invalid email or password"), 401);
    }
    const isPasswordMatched = await user.comparePassword(password);
    
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    };
    sendToken(user, 200, res);
});

//Logout User
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()), //aile ko aile expire garauna
        httpOnly: true,
    })
    res.status(200).json({
        success: true,
        message: "Logged Out",
    });
});


//Forgot password
exports.forgotPassword = catchAsyncError(async(req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    //Get ResetPasswordToken();
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false }); //user model ma banathyo getResetaPasswordToken but save bhako xaina so tyo paila save gareko 

    const resetPasswordUrl = `${req.protocol}://${req.get(
     'host'
    )}/api/v1/password/reset/${resetToken}`;

    const message=`Hey, ${user.name} Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not 
    requested this email then please ignore it`;

    try{
        await sendEmail({
            email:user.email,
            subject:`Ecommerce Password Recovery`,
            message,
        });
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`,
        })
    }
    catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        //yedi kei error ayo bhane token ra expiration undefined garera save garihalne tatkal
        return next(new ErrorHandler(error.message,500));
    }
});

//Reset Password
exports.resetPassword =catchAsyncError(async(req,res,next)=>{
    //created token hash of reseted password
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    console.log(resetPasswordToken);
    const user =await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt : Date.now()},
    });
    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 404));
    }

    // Verify if the password fields are not empty
    if (!req.body.password || !req.body.confirmPassword) {
        return next(new ErrorHandler('Password fields cannot be empty', 400));
    }
    if(req.body.password!==req.body.confirmPassword)
    {
        return next(new ErrorHandler("Password doesn't match", 404));
    }
    user.password = req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    

    await user.save();
    sendToken(user,200,res);
        
});

//Get User Details
exports.getUserDetails=catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    });
})

//Update User Password
exports.updatePassword=catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user.id).select("+password");
    const isPasswordMatched=user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old Password is Incorrect", 401));
    };
    if(req.body.newPassword!==req.body.confirmPassword){
        return next(new ErrorHandler("Password doesn't match", 401));
    }
    user.password =req.body.newPassword;
    await user.save();
    sendToken(user,200,res);
});

//Update User Profile
exports.updateProfile=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    };
    //we will add cloudinary later(avatar)
    const user =await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success:true,
    });
});

//Get all Users (admin)
exports.getAllUsers=catchAsyncError(async(req,res,next)=>{
    const users =await User.find();
    res.status(200).json({
        success:true,
        users,
    });
});

//Get Single User (admin)
exports.getSingleUser=catchAsyncError(async(req,res,next)=>{
    const user =await User.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User doesn't exit with ID: ${req.params.id}`))
    };
    res.status(200).json({
        success:true,
        user,
    });
});

//Update User Role(Admin)
exports.updateRole=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    };
    const user =await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify: false,
    });
    if(!user)
    {
        return next(new ErrorHandler(`User doesn't exist with ID: ${req.params.id}`));
    }
    res.status(200).json({
        success:true,
    });
});

//Delete User(Admin)
exports.deleteUser=catchAsyncError(async(req,res,next)=>{
    //we will remove cloudinary later
    const user=await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`User doesn't exist with ID: ${req.params.id}`));
    }

    await user.deleteOne();
    res.status(200).json({
        success:true,
        message:"User deleted Successfully"
    })
})