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
const {
    loginMockUser, 
    getAccountFromDb,
    getTokenFromRedis
} = require("../utils")

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
            const result = await getTokenFromRedis(redisClient)

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
            const result = await getTokenFromRedis(redisClient)

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
            const account = await getAccountFromDb(prisma, {id:response.body.data.id})

            expect(account).not.toBeNull()
            expect(account.username).toBe("muhtasham_123")
            
            //checking whether the token was removed
            //from redis after successfull account creation
            const result = await getTokenFromRedis(redisClient)

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
            const account = await getAccountFromDb(prisma, {username:"muhtasham_123"})

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
            const account = await getAccountFromDb(prisma, {username:"muhtasham_123"})

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
            const account = await getAccountFromDb(prisma, {username:"muhtasham_123"})

            expect(account).toBeNull()

        })
    })

    //testcases for update account api
    describe("PUT : /api/account/:id", ()=>{
        //valid testcases for update account api
        test("Should pass, user is logged in, account exists and all inputs are valid", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/${testUserAccounts.userAccount1.id}`).send({
                firstname:"john",
                lastname:"williams",
                username:"john_123",
                email:"johnwilliams@gmail.com",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Account updated")
            expect(response.body.data).toBeDefined()
            expect(response.body.data.id).toBe(testUserAccounts.userAccount1.id)
            expect(response.body.data.lastname).toBe("williams")
            expect(response.body.data.email).toBe(testUserAccounts.userAccount1.email)

            //checking update in DB
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.lastname).toBe("williams")
            expect(account.email).toBe(testUserAccounts.userAccount1.email)
        })

        //invalid testcases for update account api
        //user is not logged in
        test("Should reject, token is not given", async()=>{
            //hitting the api without logging in
            let response = await request(app).put(`/api/account/${testUserAccounts.userAccount1.id}`)
            .send({
                firstname:"john",
                lastname:"williams",
                username:"john_123",
                email:"johnwilliams@gmail.com",
                dateOfBirth:"2005-03-01"
            })
            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Authentication required")

            //checking account in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.lastname).toBe(testUserAccounts.userAccount1.lastname)
        })

        test.each([
            [
                "token is expired",
                ()=>(
                    jwt.sign(
                        {
                            username: testUserAccounts.userAccount1.username,
                            accountId: testUserAccounts.userAccount1.id,
                            isAdmin: false
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "-1s" }
                    )
                )
            ],
            [
                "token is malformed",
                ()=>(
                    "randominvalidtoken"
                )
            ],
        ])("Should reject, %s", async(description, getToken)=>{

            const token = getToken()
            //hitting the api with expired token
            const response = await request(app).put(`/api/account/${testUserAccounts.userAccount1.id}`)
            .set("Cookie", `token=${token}`)
            .send({
                firstname:"john",
                lastname:"williams",
                username:"john_123",
                email:"johnwilliams@gmail.com",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Expired or malformed token")

            //checking account in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.lastname).toBe(testUserAccounts.userAccount1.lastname)
        })
        
        //trying to update account that belongs to another user 
        test("Should reject, account belongs to another user", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/${testUserAccounts.userAccount2.id}`).send({
                firstname:"john",
                lastname:"williams",
                username:"john_123",
                email:"johnwilliams@gmail.com",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(403)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("You are not authorized for this action")
        })

        //username already exists
        test("Should reject, username already exists", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/${testUserAccounts.userAccount1.id}`).send({
                firstname:"john",
                lastname:"williams",
                username:"linda_123",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(409)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Username already exists")

            //checking update in DB
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.lastname).toBe(testUserAccounts.userAccount1.lastname)
            expect(account.username).toBe(testUserAccounts.userAccount1.username)
        })

        //empty input
        test("Should reject, firstname is not given", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/${testUserAccounts.userAccount1.id}`).send({
                lastname:"williams",
                username:"linda_123",
                dateOfBirth:"2005-03-01"
            })

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("All fields are required")

            //checking update in DB
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.lastname).toBe(testUserAccounts.userAccount1.lastname)
            expect(account.username).toBe(testUserAccounts.userAccount1.username)
            expect(account.firstname).toBe(testUserAccounts.userAccount1.firstname)
        })

    })

    //testcases for delete account api
    describe("DELETE : /api/account/:id", ()=>{
        //valid testcases for delete account api
        test("Should pass, user is logged in and account exists", async()=>{
            //creating an agent for maintaining
            //cookies acrosss multiple apis because
            //auth token is stored in cookies
            const agent = request.agent(app)
        
            //using the same agent for logging in
            //and deleting account
            await loginMockUser(
                agent, 
                testUserAccounts.userAccount1.username, 
                "johnfernandes@123"
            )

            //hitting delete account api
            const deleteResponse = await agent.delete(`/api/account/${testUserAccounts.userAccount1.id}`)

            expect(deleteResponse.statusCode).toBe(200)
            expect(deleteResponse.body.success).toBe(true)
            expect(deleteResponse.body.message).toBe("Account deleted permanently")
            expect(deleteResponse.body.data).toBeDefined()
            expect(deleteResponse.body.data.id).toBe(testUserAccounts.userAccount1.id)

            //checking in DB whether account was deleted
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account).toBeNull()

            //trying to login with the deleted account
            //(should not login)
            const loginResponse = await loginMockUser(
                agent, 
                testUserAccounts.userAccount1.username, 
                "johnfernandes@123"
            )

            expect(loginResponse.statusCode).toBe(401)
            expect(loginResponse.body.success).toBe(false)
            expect(loginResponse.body.message).toBe("Invalid username, email or password")

        })

        //invalid testcases for delete account api

        //user is not logged in
        test("Should reject, token is not given", async()=>{
            //hitting the api without logging in
            let response = await request(app).delete(`/api/account/${testUserAccounts.userAccount1.id}`)
            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Authentication required")

            //checking account in DB (should not be deleted)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account).not.toBeNull()
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
        })

        test.each([
            [
                "token is expired",
                ()=>(
                    jwt.sign(
                        {
                            username: testUserAccounts.userAccount1.username,
                            accountId: testUserAccounts.userAccount1.id,
                            isAdmin: false
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "-1s" }
                    )
                )
            ],
            [
                "token is malformed",
                ()=>(
                    "randominvalidtoken"
                )
            ],
        ])("Should reject, %s", async(description, getToken)=>{

            const token = getToken()
            //hitting the api with expired token
            const response = await request(app).delete(`/api/account/${testUserAccounts.userAccount1.id}`)
            .set("Cookie", `token=${token}`)

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Expired or malformed token")

            //checking account in DB (should not be deleted)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account).not.toBeNull()
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
        })

    })

    //testcases for get profile api
    describe("GET : /api/account/:id", ()=>{
        //valid testcases for get profile api
        test("Should pass, user is logged in and is accessing his own profile", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting api
            const response = await agent.get(`/api/account/${testUserAccounts.userAccount1.id}`)
            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Account fetched successfully")
            expect(response.body.data.id).toBe(testUserAccounts.userAccount1.id)
            expect(response.body.data.username).toBe(testUserAccounts.userAccount1.username)
            expect(response.body.data.email).toBe(testUserAccounts.userAccount1.email)
        })

        //invalid testcases for get profile api

        //user is not logged in
        test("Should reject, token is not given", async()=>{
            //hitting the api without logging in
            let response = await request(app).get(`/api/account/${testUserAccounts.userAccount1.id}`)
            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Authentication required")
        })

        test.each([
            [
                "token is expired",
                ()=>(
                    jwt.sign(
                        {
                            username: testUserAccounts.userAccount1.username,
                            accountId: testUserAccounts.userAccount1.id,
                            isAdmin: false
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "-1s" }
                    )
                )
            ],
            [
                "token is malformed",
                ()=>(
                    "randominvalidtoken"
                )
            ],
        ])("Should reject, %s", async(description, getToken)=>{

            const token = getToken()
            //hitting the api with expired token
            const response = await request(app).get(`/api/account/${testUserAccounts.userAccount1.id}`)
            .set("Cookie", `token=${token}`)

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Expired or malformed token")
        })

        //trying to get profile that belongs to another user 
        test("Should reject, profile belongs to another user", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.get(`/api/account/${testUserAccounts.userAccount2.id}`)

            expect(response.statusCode).toBe(403)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("You are not authorized for this action")
        })
    })

    //testcases for change password api
    describe("PUT : /api/account/changepassword/:id", ()=>{
        //valid testcases for change password api
        test("Should pass, user is logged in, account exists, old and new passwords are given", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting change password api
            const response = await agent.put(`/api/account/changepassword/${testUserAccounts.userAccount1.id}`).send({
                oldPassword:"johnfernandes@123",
                newPassword:"johnfernandes_1234"
            })

            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Password updated")
            expect(response.body.data).toBeDefined()
            expect(response.body.data.id).toBe(testUserAccounts.userAccount1.id)
            expect(response.body.data.email).toBe(testUserAccounts.userAccount1.email)
            expect(response.body.data.username).toBe(testUserAccounts.userAccount1.username)
            expect(response.body.data.password).not.toBeDefined()

            //checking update in DB
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)

            const isPasswordChanged = await bcrypt.compare("johnfernandes_1234", account.password)
            expect(isPasswordChanged).toBe(true)
        })

        //invalid testcases for change password api

        //user is not logged in
        test("Should reject, token is not given", async()=>{
            //hitting the api without logging in
            let response = await request(app).put(`/api/account/changepassword/${testUserAccounts.userAccount1.id}`)
            .send({
                oldPassword:"johnfernandes@123",
                newPassword:"johnfernandes_1234"
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Authentication required")

            //checking password in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            
            const isPasswordChanged = await bcrypt.compare("johnfernandes_1234", account.password)
            expect(isPasswordChanged).toBe(false)
        })

        test.each([
            [
                "token is expired",
                ()=>(
                    jwt.sign(
                        {
                            username: testUserAccounts.userAccount1.username,
                            accountId: testUserAccounts.userAccount1.id,
                            isAdmin: false
                        },
                        process.env.JWT_SECRET,
                        { expiresIn: "-1s" }
                    )
                )
            ],
            [
                "token is malformed",
                ()=>(
                    "randominvalidtoken"
                )
            ],
        ])("Should reject, %s", async(description, getToken)=>{

            const token = getToken()
            //hitting the api with expired token
            const response = await request(app).put(`/api/account/changepassword/${testUserAccounts.userAccount1.id}`)
            .set("Cookie", `token=${token}`)
            .send({
                oldPassword:"johnfernandes@123",
                newPassword:"johnfernandes_1234"
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Expired or malformed token")

            //checking password in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})
            expect(account.id).toBe(testUserAccounts.userAccount1.id)

            const isPasswordChanged = await bcrypt.compare("johnfernandes_1234", account.password)
            expect(isPasswordChanged).toBe(false)
        })
        
        //trying to change another user's password
        test("Should reject, account belongs to another user", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting change password api
            const response = await agent.put(`/api/account/changepassword/${testUserAccounts.userAccount2.id}`).send({
                oldPassword:"johnfernandes@123",
                newPassword:"johnfernandes_1234"
            })

            expect(response.statusCode).toBe(403)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("You are not authorized for this action")

            //checking password in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount2.id})

            const isPasswordChanged = await bcrypt.compare("johnfernandes_1234", account.password)
            expect(isPasswordChanged).toBe(false)
        })

        //incorrect old password
        test("Should reject, incorrect old password", async()=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/changepassword/${testUserAccounts.userAccount1.id}`).send({
                oldPassword:"johnfernandes_123", //<-- _ instead of @
                newPassword:"johnfernandes_1234"
            })

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Password does not match")

            //checking password in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})

            const isPasswordNotChanged = await bcrypt.compare("johnfernandes@123", account.password)
            expect(isPasswordNotChanged).toBe(true)
        })

        //empty input
        test.each([
            [
                "old password is not given",
                {
                    newPassword:"johnfernandes_123"
                }
            ],
            [
                "new password is not given",
                {
                    oldPassword:"johnfernandes@123"
                }
            ],
        ])("Should reject, %s", async(description, body)=>{
            const agent = request.agent(app)

            //logging in
            await loginMockUser(
                agent,
                testUserAccounts.userAccount1.username,
                "johnfernandes@123"
            )

            //hitting update api
            const response = await agent.put(`/api/account/changepassword/${testUserAccounts.userAccount1.id}`).send(body)

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Old and new passwords are required")

            //checking password in DB (should not be updated)
            const account = await getAccountFromDb(prisma, {id:testUserAccounts.userAccount1.id})

            const isPasswordNotChanged = await bcrypt.compare("johnfernandes@123", account.password)
            expect(isPasswordNotChanged).toBe(true)
        })
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