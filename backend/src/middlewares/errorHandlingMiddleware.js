const {ErrorModel} = require("../errors/appError")

//A central error handeling middleware
//capable of handeling different types
//of errors dynamically

const errorHandler = (errorDetails, req, res, next)=>{
    const message = errorDetails instanceof ErrorModel ? errorDetails.error?.message || "Internal server error" : "Internal server error"

    const statusCode = errorDetails instanceof ErrorModel ? errorDetails.error?.statusCode || 500 : 500

    if(errorDetails instanceof ErrorModel){
        console.log("Error occured in " + errorDetails.functionName + " function of " + errorDetails.controllerName + " controller")
    }

    console.error("Error:", message)
    console.error("Method:", req.method)
    console.error("URL:", req.originalUrl)

    res.status(statusCode).json({
        success:false,
        message
    })
}

module.exports = {errorHandler}