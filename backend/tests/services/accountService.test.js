const {
    prisma, 
    connectTestDataBase,
    createTestUserAccount, 
    createTestAdminAccount, 
    cleanupTestDatabase,
    disconnectTestDatabase
} = require("../setup/database")

const {
    connectRedis, 
    cleanupRedis, 
    disconnectRedis
} = require("../setup/redisClient")

const {AccountService, AdminAccountService} = require("../../src/services/accountService")
const crypto = require("crypto")
const { redisClient } = require("../../src/config/redisClient")
const bcrypt = require("bcrypt")

//Testing the AccountService class which 
//includes all the methods related to
//accounts handling

describe("AccountService", ()=>{
    let testUserAccounts
    let testAdminAccount
    let service
    let adminService
    //connecting to test redis client and database
    beforeAll(async()=>{
        await connectTestDataBase()
        await connectRedis()
    })

    //creating test records in DB before each
    //testcase runs
    beforeEach(async()=>{
        testUserAccounts = await createTestUserAccount()
        testAdminAccount = await createTestAdminAccount()
        service = new AccountService(prisma)
        adminService = new AdminAccountService(prisma)
    })

    //cleaning up DB and redis after each testcase runs
    afterEach(async()=>{
        await cleanupTestDatabase()
        await cleanupRedis()
    })

    //disconnecting to test redis client and DB after all 
    //testcases run
    afterAll(async()=>{
        await disconnectTestDatabase()
        await disconnectRedis()
    })

    //signup testcases
    describe("AccountService.signup", ()=>{
        //valid testcase for signup function(non existent username and email)
        test("Should pass, username and email does not already exist", async()=>{
            await expect(service.signup(
                {
                    username:"muhtasham_123",
                    firstname:"muhtasham",
                    lastname:"farooqi",
                    email:"muhtashamfarooqi433@gmail.com",
                    dateOfBirth:"2005-03-01",
                    password:"muhtasham@123"
                }
            )).resolves.toBeDefined()
        })

        //invalid testcases for signup function
        test.each([
            [
                "username already exists", 
                {
                    username:"john_123", //<-- already added in the DB at the start of each test
                    email:"johnklien@gmail.com", //<-- email is different from existing account
                    firstname:"john",
                    lastname:"klien",
                    dateOfBirth:"2005-03-01",
                    password:"johnklien@123"
                }
            ],
            [
                "email already exists", 
                {
                    username:"john_1234", //<-- username is differen from existing account
                    email:"johnfernandes@gmail.com", //<-- already added in the DB at the start of each test
                    firstname:"john",
                    lastname:"klien",
                    dateOfBirth:"2005-03-01",
                    password:"johnklien@123"
                }
            ],
            [
                "both username and email already exist", 
                {
                    username:"john_123", //<-- already added in the DB at the start of each test
                    email:"johnfernandes@gmail.com", //<-- already added in the DB at the start of each test
                    firstname:"john",
                    lastname:"klien",
                    dateOfBirth:"2005-03-01",
                    password:"johnklien@123"
                }
            ],
        ])("Should reject, %s", async(description, userAccountDetails)=>{
            await expect(service.signup(userAccountDetails)).rejects.toThrow(
                "Username or email already exists"
            )
        })
    })

    
    //createAccount testcases
    describe("AccountService.createAccount", ()=>{
        //valid testcase for createAccount function
        test("Should pass, valid token and unique username and email", async()=>{
            //calling signup function first to create a token
            //and storing it in redis
            const verificationToken = await service.signup({
                username:"muhtasham_123",
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123"
            })
            const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex")
            const redisKey = `signup:verification:${tokenHash}`      
    
            //now calling the createAccount function
            //and passing the generated valid token to it
            const userAccount = await service.createAccount(verificationToken)
            const dbAccount = await prisma.user.findUnique({
                where:{id: userAccount.id}
            })
            expect(userAccount).toBeDefined()
            expect(userAccount.username).toBe("muhtasham_123")
            expect(userAccount.email).toBe("muhtashamfarooqi433@gmail.com")
            expect(dbAccount).not.toBeNull()
            expect(dbAccount.username).toBe("muhtasham_123")
            expect(dbAccount.email).toBe("muhtashamfarooqi433@gmail.com")
    
            const redisRecord = await redisClient.hGetAll(redisKey)
            expect(redisRecord).toEqual({})  
        })
    
        //invalid testcase for createAccount(Invalid verification token)
        test("Should reject, invalid verification token", async()=>{
            await expect(service.createAccount("invalid_verification_token")).rejects.toThrow(
                "Invalid or expired verification token"
            )
        })
    
        //invalid testcase for createAccount(Expired verification token)
        test("Should reject, expired verification token", async()=>{
            //getting a valid token using signup and storing
            //in redis
            const verificationToken = await service.signup({
                username:"muhtasham_123",
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123"
            })
    
            //hashing token
            const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex")
    
            //expiring the token
            const redisKey = `signup:verification:${tokenHash}`
            await redisClient.expire(redisKey, 1)
            
            // Wait for Redis to expire the record
            await new Promise(resolve => setTimeout(resolve, 1500))
    
            await expect(service.createAccount(verificationToken)).rejects.toThrow(
                "Invalid or expired verification token"
            )
        })
    
        //invalid testcase for createAccount
        //(account already exists while creating one after token verification)
        test("Should reject, username and email are found after token verification", async()=>{
            //signing up to get a valid token
            const verificationToken = await service.signup({
                username:"muhtasham_123",
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123"
            })
    
            //adding an account with same username directly in DB
            await prisma.user.create({
                data:{
                    username:"muhtasham_123",
                    firstname:"calvin",
                    lastname:"fernandes",
                    dateOfBirth:new Date("2005-03-01"),
                    email:"calvinfernandes@gmail.com",
                    password:"calvinfernandes@123"
                }
            })
            //adding an account with same email directly in DB
            await prisma.user.create({
                data:{
                    username:"calvin_123",
                    firstname:"calvin",
                    lastname:"fernandes",
                    dateOfBirth:new Date("2005-03-01"),
                    email:"muhtashamfarooqi433@gmail.com",
                    password:"calvinfernandes@123"
                }
            })
    
            //creating the new account using createAccount function
            await expect(service.createAccount(verificationToken)).rejects.toThrow(
                "Username or email already exists"
            )
        })
    })

    
    //updateAccount testcases
    describe("AccountService.updateAccount", ()=>{
        //valid testcases for updateAccount(id exists and username is unique)
        test("Should pass, id exists and username is not being updated", async()=>{
            await expect(service.updateAccount(
                {
                    username:"linda_123",
                    firstname:"linda",
                    lastname:"watson",
                    dateOfBirth:"2006-05-10",
                },
                testUserAccounts.userAccount2.id,                
            )).resolves.toBeDefined()
        })
    
        //invalid testcases for updateAccount
        //id does not exist
        test("Should reject, id does not exist", async()=>{
            await expect(service.updateAccount(
                {
                    username:"linda_123",
                    firstname:"linda",
                    lastname:"watson",
                    dateOfBirth:"2006-05-10",
                },
                100
            )).rejects.toThrow(
                "Invalid account id"
            )
        })
    
        //username already exists
        test("Should reject, updated username already exists", async()=>{
            await expect(service.updateAccount(
                {
                    username:"john_123",
                    firstname:"linda",
                    lastname:"watson",
                    dateOfBirth:"2006-05-10",
                },
                testUserAccounts.userAccount2.id
            )).rejects.toThrow(
                "Username already exists"
            )
        })
    })

    //deleteAccount testcases
    describe("AccountService.deleteAccount", ()=>{
        //valid testcase for deleteAccount(id exists)
        test("Should pass, id exists", async()=>{
            await expect(service.deleteAccount(testUserAccounts.userAccount1.id)).resolves.toBeDefined()
            
            //trying to fetch the deleted account(should be null)
            const account = await prisma.user.findUnique({
                where:{id:testUserAccounts.userAccount1.id}
            })
            expect(account).toBeNull()
        })

        //invalid testcase for deleteAccount(id does not exist)
        test("Should reject, id does not exist", async()=>{
            await expect(service.deleteAccount(100)).rejects.toThrow(
                "Invalid account id"
            )
        })
    })

    //getProfile testcases
    describe("AccountService.getProfile", ()=>{
        //valid testcase for getProfile(id exists)
        test("Should pass, id exists", async()=>{
            const profile = await service.getProfile(testUserAccounts.userAccount1.id)
            expect(profile).toBeDefined()
            expect(profile.username).toBe("john_123")
            expect(profile.email).toBe("johnfernandes@gmail.com")
        })

        //invalid testcase for getProfile(id does not exist)
        test("Should reject, id does not exist", async()=>{
            await expect(service.getProfile(100)).rejects.toThrow(
                "Invalid account id"
            )
        })
    })

    //changePassword testcases
    describe("AccountService.changePassword", ()=>{
        //valid testcase for changePassword(id exists and old password matches)
        test("Should pass, id exists and old password matches", async()=>{
            const account = await service.changePassword(
                "johnfernandes@123",
                "john@//123",
                testUserAccounts.userAccount1.id,
            )
            
            const accountWithPassword = await prisma.user.findUnique({
                where:{id:account.id}
            })

            const passwordUpdated = await bcrypt.compare(
                "john@//123",
                accountWithPassword.password
            )
            expect(account).toBeDefined()
            expect(account.username).toBe("john_123")
            expect(account.email).toBe("johnfernandes@gmail.com")
            expect(passwordUpdated).toBe(true)
        })

        //invalid testcase for changePassword(id does not exist)
        test("Should reject, id does not exist", async()=>{
            await expect(service.changePassword(
                "johnfernandes@123",
                "john@//123",
                100,
            )).rejects.toThrow("Invalid account id")
        })

        //invalid testcase for changePassword(old password does not match)
        test("Should reject, old password does not match", async()=>{
            await expect(service.changePassword(
                "oldpassword@123",
                "john@//123",
                testUserAccounts.userAccount1.id,
            )).rejects.toThrow("Password does not match")
        })
    })

    //getAllAccounts(admin specific method in AdminAccountService) testcases
    describe("AdminAccountService.getAllAccounts", ()=>{
        //valid testcases for getAllAccounts(should return a list of accounts)
        test("Should pass, no input required", async()=>{
            const allAccounts = await adminService.getAllAccounts()
            expect(allAccounts).toBeDefined()
            expect(Array.isArray(allAccounts)).toBe(true)
        })

        
    })
    //--- NO INVALID TEST CASE ---

    //updateAccountActivity(admin specific method in AdminAccountService) testcases
    describe("AdminAccoutService.updateAccountActivity", ()=>{
        //valid testcase for updateAccountActivity(id exists)
        test("Should pass, id exists", async()=>{
            let account = await adminService.updateAccountActivity(
                testUserAccounts.userAccount1.id,
                false
            )
            
            //check update in DB
            const inactivatedAccount = await prisma.user.findUnique({
                where:{id:testUserAccounts.userAccount1.id}
            })

            //get other account and check its activity
            //to make sure it is not affected
            let activeAccounts = await prisma.user.findMany({
                where:{
                    id:{
                        notIn:[
                            testUserAccounts.userAccount1.id,
                            testUserAccounts.deactivatedAccount.id, 
                        ]
                    }
                },
                select:{
                    isActive:true
                }
            })

            let activityList = activeAccounts.map((a)=>a.isActive)

            expect(account).toBeDefined()
            expect(inactivatedAccount.isActive).toBe(false)
            expect(activityList.every((value)=> value===true)).toBe(true)
            
            //reactivating the inactivated account
            account = await adminService.updateAccountActivity(
                testUserAccounts.userAccount1.id,
                true                
            )

            //check update in DB
            const reactivatedAccount = await prisma.user.findUnique({
                where:{id:testUserAccounts.userAccount1.id}
            })            

            //get other account and check its activity
            //to make sure it is not affected
            activeAccounts = await prisma.user.findMany({
                where:{
                    id:{
                        notIn:[
                            testUserAccounts.userAccount1.id,
                            testUserAccounts.deactivatedAccount.id, 
                        ]
                    }
                },
                select:{
                    isActive:true
                }
            })
            activityList = activeAccounts.map((a)=>a.isActive)

            expect(account).toBeDefined()
            expect(reactivatedAccount.isActive).toBe(true)
            expect(activityList.every((value)=>value===true)).toBe(true)

        })
    })

    //invalid testcase for updateAccountActivity(id does not exist)
    test("Should reject, id does not exist", async()=>{
        await expect(adminService.updateAccountActivity(
            100,
            false
        )).rejects.toThrow("Invalid account id")

        //check update in DB
        const accountsActivity = await prisma.user.findMany({
            where:{
                id:{
                    not:testUserAccounts.deactivatedAccount.id
                }
            },
            select:{isActive:true}
        })

        const activityList = accountsActivity.map((a)=>a.isActive)

        expect(activityList.every((value)=>value===true)).toBe(true)
       
    })
})
