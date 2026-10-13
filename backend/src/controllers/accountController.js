const {AccountCreationInputsValidator, BaseAuthInputsValidator, AccountUpdationInputsValidator} = require("../validators/authInputsValidators")
const {BadRequestError, ErrorModel} = require("../errors/appError")

//Account controller that handles Http requests
//without directly interacting with database
//(it depends on AccountService for interacting
//with database)

class AccountController {
    constructor(accountService){
        this.accountService = accountService
    }

    createAccount = async(req, res, next) => {
        try {
            const userAccountDetails = req.body

            const inputsValidator = new AccountCreationInputsValidator()
            inputsValidator.validate(userAccountDetails)

            const account = await this.accountService.createAccount(userAccountDetails)

            res.status(201).json({
                success:true,
                message:"Account created",
                data:account
            })

        } catch (error) {
            next(
                new ErrorModel(
                    error, 
                    "createAccount", 
                    "AccountController"
                )   
            )
        }

    }

    updateAccount = async(req, res, next) => {
        try {
            const accountId = req.params.id
            const userAccountDetails = req.body

            const inputsValidator = new AccountUpdationInputsValidator()
            inputsValidator.validate(userAccountDetails)

            const updatedAccount = await this.accountService.updateAccount(userAccountDetails, Number(accountId))

            res.status(200).json({
                success:true,
                message:"Account updated",
                data:updatedAccount
            })
            
        } catch (error) {
            next(
                new ErrorModel(
                    error, 
                    "updateAccount",
                    "AccountController"
                )
            )
        }

    }

    deleteAccount = async(req, res, next) => {
        try {
            const accountId = req.params.id

            const account = await this.accountService.deleteAccount(Number(accountId))

            res.status(200).json({
                success:true,
                message:"Account deleted permanently",
                data:account
            })
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "deleteAccount",
                    "AccountController"
                )
            )
        }
    }

    changePassword = async(req, res, next) => {
        try {
            const accountId = req.params.id
            const {oldPassword, newPassword} = req.body

            if(!oldPassword || !newPassword){
                throw new BadRequestError("Old and new passwords are required")
            }

            const account = await this.accountService.changePassword(oldPassword, newPassword, Number(accountId))

            res.status(200).json({
                success:true,
                message:"Password updated",
                data:account
            })
            
        } catch (error) {
           next(
                new ErrorModel(
                    error,
                    "changePassword",
                    "AccountController"
                )
           )
        }

    }

    getProfile = async(req, res, next) => {
        try {
            const accountId = req.params.id

            const profile = await this.accountService.getProfile(Number(accountId))

            res.status(200).json({
                success:true,
                message:"Account fetched successfully",
                data:profile
            })
        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "getProfile",
                    "AccountController"
                )
            )
        }

    }
}


//Admin specific account controller, handeling
//requests that only an admin can make, inheriting
//from AccountController to handle general
//accout requests as well. Depends
//on AdminAccountService for interacting with
//database

class AdminAccountController extends AccountController {
    constructor(adminAccountService){
        super(adminAccountService);
    }

    getAllAccounts = async(req, res, next) => {
        try {
            const accounts = await this.accountService.getAllAccounts()

            res.status(200).json({
                success:true,
                message:"Accounts fetched",
                data:accounts
            })

        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "getAllAccounts",
                    "AdminAccountController"
                )
            )
        }
    }

    updateAccountActivity = async(req, res, next) => {
        try {
            const accountId = req.params.id
            const status = req.body.isActive

            if(typeof status !== "boolean"){
                throw new BadRequestError("Account activity status is required")
            }

            const account = await this.accountService.updateAccountActivity(Number(accountId), status)

            res.status(200).json({
                success:true,
                message:"Account activity status updated",
                data:account
            })

        } catch (error) {
            next(
                new ErrorModel(
                    error,
                    "updateAccountActivity",
                    "AdminAccountController"
                )
            )
        }
    }
}

module.exports = {AccountController, AdminAccountController}