const jwt = require("jsonwebtoken")
const {UnauthorizedError} = require("../errors/appError.js")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const {Resend} = require("resend")

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

        if(!actualAccount.isActive){
            throw new UnauthorizedError("Your account has been deactivated")
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
            throw new UnauthorizedError("If an account exists with this email, a reset link is sent on this email.")
        }

        //generate token and hash it
        const token = this.#createPasswordResetToken()
        const tokenHash = this.#hashPasswordResetToken(token)

        //make token expiry time for 15 minutes in future
        const expiryTime = new Date(new Date().getTime() + 15*60*1000) 

        //save token in the DB and send it via email
        const savedToken = await this.prisma.passwordResetToken.create({
            data:{
                tokenHash,
                expiryTime,
                userId:account.id
            }
        })
        const resend = new Resend(process.env.RESEND_API_KEY)
        const {data, error} = await resend.emails.send({
            from: "aismarttask@gmail.com",
            to: account.email,
            subject: "Reset password link",
            html: `<a href="${process.env.BASE_RESET_PAGE_URL}/${token}">Click here</a>`
        })

        return token
    }

    resetPassword = async(passwordResetToken, newPassword) => {
        //hash the token using the same algorithm
        const tokenHash = this.#hashPasswordResetToken(passwordResetToken)
        //hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        //update password and delete token in an atomic transaction
        const updatedAccount = await this.prisma.$transaction(async(tx)=>{
            //validate token
            const savedToken = await tx.passwordResetToken.findUnique({
                where:{
                    tokenHash
                }
            })

            if(!savedToken){
                throw new UnauthorizedError("Invalid reset token")
            }

            if (savedToken.expiryTime.getTime() <= Date.now()){
                throw new UnauthorizedError("Your reset token has been expired")
            } 

            //update password in DB
            const account = await tx.user.update({
                where:{
                    id: savedToken.userId
                },
                data:{
                    password: hashedPassword,
                    updatedAt:new Date(Date.now())
                }
            })

            //invalidate opt (later)
            await tx.passwordResetToken.delete({
                where: {
                    id: savedToken.id
                }
            })

            return account
        })

        return {
            id:updatedAccount.id,
            username:updatedAccount.username,
            firstname:updatedAccount.firstname,
            lastname:updatedAccount.lastname,
            dateOfBirth:updatedAccount.dateOfBirth,
            email:updatedAccount.email,
            isActive:updatedAccount.isActive,
            isAdmin:updatedAccount.isAdmin,
            createdAt:updatedAccount.createdAt,
            updatedAt:updatedAccount.updatedAt            
        }
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

    #createPasswordResetToken = ()=>{
        const token = crypto.randomBytes(32).toString("hex")
        return token
    }

    #hashPasswordResetToken = (token)=>{
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
        return tokenHash
    }

}

module.exports = {AuthService}