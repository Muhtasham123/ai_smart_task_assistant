const jwt = require("jsonwebtoken")
const {UnauthorizedError, ForbiddenError, ErrorModel} = require("../errors/appError")

//Created a factory that returns the actual middleware
//because it needs authService and we are not calling it
//explicitly so we cannot pass service directly to it.
//Instead express calls this middleware implicitly and will
//not pass servcie to it
const authenticate = (authService)=>{
    return async (req, res, next)=>{
        try {
        //validate the user's token
        const token = req.cookies.token
        if(!token){
            throw new UnauthorizedError("Authentication required")
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        //check if account is active or not
        const active = await authService.isActiveAccount(payload.accountId)
        if(!active){
            throw new ForbiddenError("Your account is not active")
        }

        req.user = payload // attach payload to the req object to access it later
        next()

        } catch (error) {
            if(error?.name === "TokenExpiredError" || error?. name === "JsonWebTokenError"){
                error = new UnauthorizedError("Expired or malformed token")
            }
            next(
                new ErrorModel(
                    error,
                    "authenticate",
                    ""
                )
            )
        }
    }

}

const authorize = async(req, res, next)=>{
    //validate if the user is admin or not
    try {
        if(!req.user.isAdmin){
            throw new ForbiddenError("You are not authorized for this action")
        }

        next()
    } catch (error) {
        next(
            new ErrorModel(
                error,
                "authorize",
                ""
            )
        )        
    }
}

const isAccountOwner = async(req, res, next)=>{
    try {
        //check if the user is the owner of the
        //data he is trying to update or delete or fetch
        if (req.user.accountId !== Number(req.params.id)){
            throw new ForbiddenError("You are not authorized for this action")
        }

        next()        
    } catch (error) {
        next(
            new ErrorModel(
                error,
                "isAccountOwner",
                ""
            )
        )
    }
   
} 

module.exports = {authorize, authenticate, isAccountOwner}