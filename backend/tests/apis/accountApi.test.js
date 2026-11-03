const app = require("../../src/app")
const request = require("supertest")
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
const {AccountController} = require("../../src/controllers/accountController")
const {AccountService} = require("../../src/services/accountService")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const { redisClient } = require("../../src/config/redisClient")

//Testing all the account related apis
describe("/api/account", ()=>{
    let testUserAccounts
    let testAdminAccount
    let service

    //connecting to test redis client and database
    //before execution of testcases(once at start)
    beforeAll(async()=>{
        await connectTestDataBase()
        await connectRedis()

    })
    
    //creating mock user and admin accounts in test database
    //before each testcase runs
    beforeEach(async()=>{
        testUserAccounts = await createTestUserAccount()
        testAdminAccount = await createTestAdminAccount()
        service = new AccountService(prisma)
    })
    
    //cleaning up test database and redis client
    //after each testcase completes
    afterEach(async()=>{
        await cleanupTestDatabase()
        await cleanupRedis()        
    })

    //disconnecting test database and redis client
    //after all testcases complete
    afterAll(async()=>{
        await disconnectTestDatabase()
        await disconnectRedis()
    })

    //testcases for signup api
    describe("POST : /api/account/", ()=>{
        //valid testcases for signup api
        test("Should pass, all the required inputs are provided", async()=>{
            const response = await request(app).post("/api/account/").send({
                firstname:"muhtasham",
                lastname:"farooqi",
                username:"muhtasham_123",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Verification email sent to the user")

            //checking whether the verification token was
            //created in redis against provided credentials
            const result = await redisClient.scan("0", {
                MATCH:"signup:verification:*",
                COUNT:100
            })

            expect(result.keys.length).toBeGreaterThan(0)

            const userData = await redisClient.hGetAll(result.keys[0])

            expect(userData).toBeDefined()
            expect(userData.username).toBe("muhtasham_123")
            expect(userData.email).toBe("muhtashamfarooqi433@gmail.com")
        })

        //invalid testcases for signup api

        //missing inputs (only one testcase regarding 
        //inputs because input validator is tested in detail
        //for missing and wrong input so this test is only
        //to make sure that input validator is being
        //used while signup)
        test("Should reject, username is not provided", async()=>{
            const response = await request(app).post("/api/account/").send({
                firstname:"muhtasham",
                lastname:"farooqi",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })
            
            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("All fields are required")

            //checking whether the verification token was
            //created in redis against provided credentials(should not be created)
            const result = await redisClient.scan("0", {
                MATCH:"signup:verification:*",
                COUNT:100
            })

            expect(result.keys).toHaveLength(0)
        })
    })

    //testcases for create account api
    describe("POST : /api/account/create", ()=>{
        //valid testcases for create account api
        test("Should pass, verification is given", async()=>{
            //signing up first using the AccountService 
            //to create a token in redis and using it for
            //account creation
            const verificationToken = await service.signup({
                firstname:"muhtasham",
                lastname:"farooqi",
                username:"muhtasham_123",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })

            //hitting the api with the token
            const response = await request(app).post("/api/account/create").send({
                verificationToken
            })

            expect(response.statusCode).toBe(201)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Account created")
            expect(response.body.data).toBeDefined()

            //checking whether the record was created in the
            //DB or not
            const account = await prisma.user.findUnique({
                where:{
                    id:response.body.data.id
                }
            })

            expect(account).not.toBeNull()
            expect(account.username).toBe("muhtasham_123")
            
            //checking whether the token was removed
            //from redis after successfull account creation
            const result = await redisClient.scan("0", {
                MATCH:"signup:verification:*",
                COUNT:100
            })

            expect(result.keys).toHaveLength(0)
        })

        //invalid testcases for create account api

        //token not provided
        test("Should reject, token is not given", async()=>{
            //signing up first using the AccountService 
            //to create a token in redis and check credentials
            //in DB
            const verificationToken = await service.signup({
                firstname:"muhtasham",
                lastname:"farooqi",
                username:"muhtasham_123",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })
            const response = await request(app).post("/api/account/create").send({})

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Verification Token is required")

            //checking whether the record was created in the
            //DB or not (should not be created)
            const account = await prisma.user.findUnique({
                where:{
                    username:"muhtasham_123"
                }
            })

            expect(account).toBeNull()

            //checking whether the token was removed
            //(should not be removed because account 
            //creation was not successfull)
            const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex")
            const userData = await redisClient.hGetAll(`signup:verification:${tokenHash}`)
            
            expect(userData).toBeDefined()
            expect(userData.username).toBe("muhtasham_123")
        })

        //invalid token
        test("Should reject, invalid token is given", async()=>{
            //signing up first using the AccountService 
            //to create a token in redis and check credentials
            //in DB
            const verificationToken = await service.signup({
                firstname:"muhtasham",
                lastname:"farooqi",
                username:"muhtasham_123",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })
            const response = await request(app).post("/api/account/create").send({
                verificationToken:"invalidrandomtokem" //<-- invalid token being sent
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Invalid or expired verification token")

            //checking whether the record was created in the
            //DB or not (should not be created)
            const account = await prisma.user.findUnique({
                where:{
                    username:"muhtasham_123"
                }
            })

            expect(account).toBeNull()

            //checking whether the token was removed
            //(should not be removed because account 
            //creation was not successfull)
            const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex")
            const userData = await redisClient.hGetAll(`signup:verification:${tokenHash}`)
            
            expect(userData).toBeDefined()
            expect(userData.username).toBe("muhtasham_123")
        })

        //expired token
        test("Should reject, expired token is given", async()=>{
            //signing up first using the AccountService 
            //to create a token in redis and check credentials
            //in DB
            const verificationToken = await service.signup({
                firstname:"muhtasham",
                lastname:"farooqi",
                username:"muhtasham_123",
                email:"muhtashamfarooqi433@gmail.com",
                password:"muhtasham@123",
                dateOfBirth:"2005-03-01"
            })

            //expiring the token
            const tokenHash =  crypto.createHash("sha256").update(verificationToken).digest("hex")
            await redisClient.expire(
                `signup:verification:${tokenHash}`,
                0
            )

            //hitting the api with expired token
            const response = await request(app).post("/api/account/create").send({
                verificationToken:verificationToken //<-- expired token being sent
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Invalid or expired verification token")

            //checking whether the record was created in the
            //DB or not (should not be created)
            const account = await prisma.user.findUnique({
                where:{
                    username:"muhtasham_123"
                }
            })

            expect(account).toBeNull()

        })
    })

    //testcases for update account api
    describe("PUT : /api/account/:id", ()=>{
        //valid testcases for update account api
        //invalid testcases for update account api
    })

    //testcases for delete account api
    describe("DELETE : /api/account/:id", ()=>{
        //valid testcases for delete account api
        //invalid testcases for delete account api
    })

    //testcases for get profile api
    describe("GET : /api/account/:id", ()=>{
        //valid testcases for get profile api
        //invalid testcases for get profile api
    })

    //testcases for change password api
    describe("PUT : /api/account/changepassword/:id", ()=>{
        //valid testcases for change password api
        //invalid testcases for change password api
    })
})

//Testing admin specific apis that can only
//be accessed through an admin account
describe("/api/account/admin", ()=>{
    //testcases for getting accounts lists
    describe("GET : /api/account/admin", ()=>{
        //valid testcases for getting accounts lists
        //invalid testcases for getting accounts lists
    })

    //testcases for inactivating an account
    describe("PUT : /api/account/admin/:id", ()=>{
        //valid testcases for inactivating account
        //invalid testcases for inactivating account
    })

    //testcases for deleting ANY account
    describe("DELETE : /api/account/admin/:id", ()=>{
        //valid testcases for deleting ANY account
        //invalid testcases for deleting ANY account
    })
})