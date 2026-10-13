//Accounts Service having all the shared
//functionalities for admin and general
//user related to accounts

const {ConflictError, NotFoundError, UnauthorizedError} = require("../errors/appError")

const bcrypt = require("bcrypt")

class AccountService {
    constructor(prisma){
        this.prisma = prisma
    }

    createAccount = async(userAccountDetails) => {
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

        //verify the email with OPT
        //if not verified throw error

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        //store user in database
        const account = await this.prisma.user.create({
            data:{
                username,
                firstname,
                lastname,
                dateOfBirth,
                email,
                password:hashedPassword
            }
        })
        
        return {
            id:account.id,
            username:account.username,
            firstname,
            lastname,
            dateOfBirth,
            email:account.email,
            isActive:account.isActive,
            isAdmin:account.isAdmin,
            createdAt:account.createdAt
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
                    dateOfBirth
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
            createdAt:updatedAccount.createdAt
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
            createdAt:deletedAccount.createdAt
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
                    password:hashedPassword
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
            createdAt:updatedAccount.createdAt
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
            createdAt:account.createdAt
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
                    createdAt: true
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
                data:{isActive:status}
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
            createdAt:inactivatedAccount.createdAt
        }
    }
}

module.exports = {AccountService, AdminAccountService}