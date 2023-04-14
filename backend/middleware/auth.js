const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
//yo chai eg kunai specific product wala fxn yedi registered user lai matra dekhaune ho bhane types kam garna
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_PRIVATE);
    req.user = await User.findById(decodedData.id);
    next();
});
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) { //roles admin pass garyo tara default role user bhaye access garna milena
            return next(
                new ErrorHandler(`Role: ${req.user.role} is not allowed to access this resource`
                ,403
                )    
            );
        }
        next();
    }
}

