const jwt = require("jsonwebtoken")
const {UnauthorizedError} = require("../errors/appError.js")
const bcrypt = require("bcrypt")

class AuthService{
    constructor(prisma){
        this.prisma = prisma
    }

    login = async(username, password, email) => {
        let query = {username}

        if(!username){
            query = {email}
        }
        //validate username or email
        const actualAccount = await this.prisma.user.findUnique({
            where:query
        })

        if(!actualAccount){
            throw new UnauthorizedError("Invalid username, email or password")
        }

        //match password
        const passwordMatch = await bcrypt.compare(password, actualAccount.password)

        if(!passwordMatch){
            throw new UnauthorizedError("Invalid username, email or password")
        }

        //create token
        const token = this.#createAuthToken(actualAccount.username, actualAccount.id, actualAccount.isAdmin)

        //return token
        return {
            token,
            id:actualAccount.id,
            username:actualAccount.username,
            email:actualAccount.email
        }
    }

    forgotPassword = async(email) => {
        //find account
        const account = await this.prisma.user.findUnique({
            where: {email}
        })

        if(!account){
            throw new UnauthorizedError("Invalid email")
        }

        //generate OTP/token (later)
        //save token in the DB (later)
        //return token
    }

    resetPassword = async(otp, newPassword) => {
        //validate opt/token (late)

        //hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        //update password in DB(later)
        //invalidate opt (later)
    }

    isActiveAccount = async(accountId) => {
        const account = await this.prisma.user.findUnique({
            where:{
                id:accountId,
            }
        })

        return account && account.isActive
    }

    #createAuthToken = (username, accountId, isAdmin) => {
        //accountDetails have only username, id, isAdmin
        const token = jwt.sign(
            {
                username,
                accountId,
                isAdmin,
            },
            process.env.JWT_SECRET, 
            {
                expiresIn:"3h"
            })

            return token
    }

}

module.exports = {AuthService}