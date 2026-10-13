const {BadRequestError, ErrorModel} = require("../errors/appError")
const {LoginInputsValidator} = require("../validators/authInputsValidators") 

class AuthController {
    constructor(authService){
        this.authService = authService
    }

    login = async(req, res, next) => {
        try {
            const {username, email, password} = req.body
            const loginInputsValidator = new LoginInputsValidator()

            //validate the input fields
            loginInputsValidator.validate(
                username,
                email,
                password
            )

            const account = await this.authService.login(username, password, email)

            res.cookie("token", account.token, {
                httpOnly:true,
                secure:false,
                sameSite:"lax",
                maxAge: 3 * 60 * 60 * 1000
            })

            res.status(200).json({
                success:true,
                message:"Login successful",
                data:{
                    id:account.id,
                    username:account.username,
                    email:account.email
                }
            })
            
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "login",
                    "AuthController"
                )
            )
        }
    }

    logout = async(req, res, next) => {
        try {
            res.clearCookie("token",{
                httpOnly:true,
                secure:false,
                sameSite:"lax",
            })

            res.status(200).json({
                success:true,
                message:"Logged out successfully",
                data:{}
            })
            
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "logout",
                    "AuthController"
                )
            )
        }
    }

    forgotPassword = async(req, res, next) => {
        try {
            const email = req.body.email

            if(!email){
                throw new BadRequestError("Email is required")
            }

            const resetToken = await this.authService.forgotPassword(email)
            //send token via email

            res.status(200).json({
                success:true,
                message:"Token sent to the user",
                data:{}
            })
            
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "forgotPassword",
                    "AuthController"
                )
            )
        }
    }

    resetPassword = async(req, res, next) => {
        try {
            const {resetToken, newPassword} = req.body

            if(!newPassword || !resetToken){
                throw new BadRequestError("Password and reset token are required")
            }

            await this.authService.resetPassword(resetToken, newPassword)

            res.status(200).json({
                success:true,
                message:"Password updated successfully",
                data:{}
            })
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "resetPassword",
                    "AuthController"
                )
            )            
        }
    }
}

module.exports = {AuthController}