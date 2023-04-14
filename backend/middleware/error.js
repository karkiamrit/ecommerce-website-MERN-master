const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;//yedi status code bhaye tei natra default ma 500
  err.message = err.message || "Internal server Error";
  
  //Wrong Mongodb Id error
  if(err.name==='CastError'){
    const message= `Resource not found,Invalid:${err.path}`;
    err=new ErrorHandler(message,400);
  }
  
  //Mongoose Duplicate Error
  if(err.code === 11000){
    const message=`Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message,400);
  }

  //Wrong JWT error
  if(err.name === 'JsonWebTokenError'){
    const message=`Json web token is invalid, please try again`;
    err = new ErrorHandler(message,400);
  }

  //JWT EXPIRE ERROR
  if(err.name === 'TokenExpireError'){
    const message=`Json web token is expired, please try again`;
    err = new ErrorHandler(message,400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,//err.stack garera complete error dekhauna ni milxa
  });
};
