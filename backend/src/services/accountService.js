//Accounts Service having all the shared
//functionalities for admin and general
//user related to accounts

const {ConflictError, NotFoundError, UnauthorizedError} = require("../errors/appError")
const bcrypt = require("bcrypt")
const {redisClient} = require("../config/redisClient")

class AccountService {
    constructor(prisma){
        this.prisma = prisma
    }

    signup = async(userAccountDetails) => {
        const {
            username, 
            firstname, 
            lastname, 
            dateOfBirth, 
            email, 
            password
        } = userAccountDetails

        //check if account (username or email) already exists
        if(await this.#usernameOrEmailExists(username, email)){
            throw new ConflictError("Username or email already exists")
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //create email verification token and send email
        const token = this.#createEmailVerificationToken()
        const tokenHash = this.#hashEmailVerificationToken(token)
        
        //store credentials temporarily for 15 min in redis against token
        await redisClient.multi()
        .hSet(`signup:verification:${tokenHash}`, {
            username,
            firstname,
            lastname,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : "",
            email,
            password:hashedPassword
        }).expire(`signup:verification:${tokenHash}`, 900)
        .exec()

        //send token to the user
        const emailObject = {
            from: process.env.RESEND_FROM_EMAIL,
            to: email,
            subject: "Email verification link",
            html: `<a href="${process.env.BASE_EMAIL_VERIFICATION_URL}/${token}">Click here to verify</a>`
        }

        const data = await this.#sendEmail(emailObject)
        return token
    }

    createAccount = async(verificationToken)=>{
        const tokenHash = this.#hashEmailVerificationToken(verificationToken)

        //getting credentials using token from redis(if expired, key will not be found)
        const userData = await redisClient.hGetAll(`signup:verification:${tokenHash}`)

        if(Object.keys(userData).length === 0){
            throw new UnauthorizedError("Invalid or expired verification token")
        }

        //check if account (username or email) already exists
        if(await this.#usernameOrEmailExists(userData.username, userData.email)){
            await redisClient.del(`signup:verification:${tokenHash}`)
            throw new ConflictError("Username or email already exists")
        }

        //store user in database
        const account = await this.prisma.user.create({
            data:{
                username:userData.username,
                firstname:userData.firstname,
                lastname:userData.lastname,
                dateOfBirth:userData.dateOfBirth ? new Date(userData.dateOfBirth):null,
                email:userData.email,
                password:userData.password
            }
        })

        //removing the key from redis
        await redisClient.del(`signup:verification:${tokenHash}`)
        
        return {
            id:account.id,
            username:account.username,
            firstname:account.firstname,
            lastname:account.lastname,
            dateOfBirth:account.dateOfBirth,
            email:account.email,
            isActive:account.isActive,
            isAdmin:account.isAdmin,
            createdAt:account.createdAt,
            updatedAt:account.updatedAt
        }
    }

    updateAccount = async(userAccountDetails, accountId) => {
        const {
            username,
            firstname,
            lastname,
            dateOfBirth
        } = userAccountDetails

        //check if account is valid (id found)
        const account = await this.getAccountById(accountId)
        if(!account){
            throw new NotFoundError("Invalid account id")
        }

        //check if username already exists
        if(await this.#usernameOrEmailExists(username, null, accountId)){
            throw new ConflictError("Username or email already exists")
        }

        //update the user data in the database
        const updatedAccount = await this.prisma.user.update(
            {
                where: {id:accountId},
                data: {
                    username,
                    firstname,
                    lastname,
                    dateOfBirth,
                    updatedAt:new Date(Date.now())
                } 
            }
        )

        //later there might be more updations like profile picture

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

    deleteAccount = async(accountId) => {
        //check if account exists based on id
        const account = await this.getAccountById(accountId)
        if(!account){
            throw new NotFoundError("Invalid account id")
        }

        //delete the account from the database(hard delete for now)
        const deletedAccount = await this.prisma.user.delete(
            {
                where:{id:accountId}
            }
        )
        
        return {
            id:deletedAccount.id,
            username:deletedAccount.username,
            firstname:deletedAccount.firstname,
            lastname:deletedAccount.lastname,
            dateOfBirth:deletedAccount.dateOfBirth,
            email:deletedAccount.email,
            isActive:deletedAccount.isActive,
            isAdmin:deletedAccount.isAdmin,
            createdAt:deletedAccount.createdAt,
            updatedAt:deletedAccount.updatedAt
        }
    }

    changePassword = async(oldPassword, newPassword, accountId) => {
        //check if acccount exists
        const account = await this.getAccountById(accountId)
        if(!account){
            throw new NotFoundError("Invalid account id")
        }

        //check if old password matches
        const passwordMatch = await bcrypt.compare(oldPassword, account.password)
        if(!passwordMatch){
            throw new UnauthorizedError("Password does not match")
        } 

        //hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        //update password in database
        const updatedAccount = await this.prisma.user.update(
            {
                where:{id:accountId},
                data:{
                    password:hashedPassword,
                    updatedAt:new Date(Date.now())
                }
            }
        )

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

    getProfile = async(accountId) => {
        //check if account exists based on id
        const account = await this.getAccountById(accountId)
        if(!account){
            throw new NotFoundError("Invalid account id")
        }
        
        return {
            id:account.id,
            username:account.username,
            firstname:account.firstname,
            lastname:account.lastname,
            dateOfBirth:account.dateOfBirth,
            email:account.email,
            isActive:account.isActive,
            isAdmin:account.isAdmin,
            createdAt:account.createdAt,
            updatedAt:account.updatedAt
        }
    }

    getAccountById = async(accountId) => {
        //find user account based on id
        const account = await this.prisma.user.findUnique(
            {
                where:{
                    id:accountId
                }
            }
        )
        return account
    }

    #usernameOrEmailExists = async(username, email=null, accountId=null)=>{
        let query = null

        //for update, we only need to check username because email cannot be updated
        if(email !== null){
            query = {
                OR:[
                    {username},{email}
                ]
            }
        }else{
            query = {username}
        }

        if(accountId != null){
            query.id = {not:accountId}
        }

        //check in database if username or email already exists
        const account = await this.prisma.user.findFirst(
            {
                where: query
            }
        )
        //if exists return true
        if(account){
            return true
        }
        return false
    }

    #createEmailVerificationToken = ()=>{
        const token = crypto.randomBytes(32).toString("hex")
        return token
    }

    #hashEmailVerificationToken = (token)=>{
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex")
        return tokenHash
    }

    #sendEmail = async(emailObject)=>{
        const resend = new Resend(process.env.RESEND_API_KEY)
        const {data, error} = await resend.emails.send(emailObject)

        if(error){
            throw new Error(`Failed to send password reset email : ${error.message}`)
        }

        return data
    }
}


//Accounts service specifically for
//admin only functionalities 
//inheriting from AccountsService class

class AdminAccountService extends AccountService{
    getAllAccounts = async() => {
        //fetch all the accounts from the database
        const accounts = await this.prisma.user.findMany(
            {
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    dateOfBirth: true,
                    email: true,
                    isActive: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        )
        return accounts
    }

    updateAccountActivity = async(accountId, status) => {
        //check if account exists based on id
        const account = await this.getAccountById(accountId)
        if(!account){
            throw new NotFoundError("Invalid account id")
        }

        //set isActive to false
        const inactivatedAccount = await this.prisma.user.update(
            {
                where: {id:accountId},
                data:{
                    isActive:status,
                    updatedAt:new Date(Date.now())
                }
            }
        )
        
        return {
            id:inactivatedAccount.id,
            username:inactivatedAccount.username,
            firstname:inactivatedAccount.firstname,
            lastname:inactivatedAccount.lastname,
            dateOfBirth:inactivatedAccount.dateOfBirth,
            email:inactivatedAccount.email,
            isActive:inactivatedAccount.isActive,
            isAdmin:inactivatedAccount.isAdmin,
            createdAt:inactivatedAccount.createdAt,
            updatedAt:inactivatedAccount.updatedAt
        }
    }
}

module.exports = {AccountService, AdminAccountService}