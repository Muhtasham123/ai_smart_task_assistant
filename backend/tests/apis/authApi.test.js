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
const {AuthController} = require("../../src/controllers/authController")
const jwt = require("jsonwebtoken")

//Testing the authentication related APIs
describe("/api/auth", ()=>{
    let testUserAccounts
    let testAdminAccount

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

    //login api testcases
    describe("POST : /api/auth/login", ()=>{
        //valid testcases for login api
        test.each([
            [
                "correct username and password",
                ()=>({
                    username:testUserAccounts.userAccount1.username,
                    password:"johnfernandes@123"
                })
            ],
            [
                "correct email and password",
                ()=>({
                    email:testUserAccounts.userAccount1.email,
                    password:"johnfernandes@123"
                })
            ]
        ])("Should pass, %s", async(description, getBody)=>{
            const body = getBody()
            const response = await request(app).post("/api/auth/login").send(body)
            expect(response.statusCode).toBe(200)
            expect(response.body).toBeDefined()
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Login successful")
            expect(response.body.data).toBeDefined()
            expect(response.body.data.id).toBe(testUserAccounts.userAccount1.id)

            //checking whether token was set in cookie or not
            const cookies = response.headers["set-cookie"]
            expect(cookies).toBeDefined()
            expect(cookies.length).toBeGreaterThan(0)

            const authCookie = cookies.find((cookie)=>{
                return cookie.startsWith("token=")
            })

            expect(authCookie).toBeDefined()
            expect(authCookie).toContain("HttpOnly")
            expect(authCookie).toContain("Path=/")

            const maxAge = String(AuthController.COOKIE_EXPIRY_TIME/1000)
            expect(authCookie).toContain(`Max-Age=${maxAge}`)
        })

        //invalid testcases for login api

        //missing inputs
        test.each([
            [
                "no input is given",
                ()=>(
                    {}
                )
            ],
            [
                "only username is given",
                ()=>({
                    username:testUserAccounts.userAccount1.username
                })
            ],
            [
                "only email is given",
                ()=>({
                    email:testUserAccounts.userAccount1.email
                })
            ],
            [
                "only password is given",
                ()=>({
                    password:"johnfernandes@123"
                })
            ],
        ])("Should reject, %s", async(description, getBody)=>{
            const body = getBody()
            const response = await request(app).post("/api/auth/login").send(body)

            expect(response.statusCode).toBe(400)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Username or email and password are required")

            //checking cookie (should not be set)
            const cookies = response.headers["set-cookie"]
            expect(cookies).not.toBeDefined()
        })

        //incorrect credentials
        test.each([
            [
                "incorrect username and correct password",
                ()=>({
                    username:"jon_1234",
                    password:"johnfernandes@123"
                })
            ],
            [
                "incorrect email and correct password",
                ()=>({
                    email:"jonfernandes@gmail.com",
                    password:"johnfernandes@123"
                })
            ],
            [
                "correct username and incorrect password",
                ()=>({
                    username:testUserAccounts.userAccount1.username,
                    password:"jonfernandes@123"
                })
            ],
            [
                "correct email and incorrect password",
                ()=>({
                    email:testUserAccounts.userAccount1.email,
                    password:"jonfernandes@123"
                })
            ],
        ])("Should reject, %s", async(description, getBody)=>{
            const body = getBody()
            const response = await request(app).post("/api/auth/login").send(body)

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Invalid username, email or password")

            //checking cookie (should not be set)
            const cookies = response.headers["set-cookie"]
            expect(cookies).not.toBeDefined()
        })

        //inactive account
        test.each([
            [
                "account is inactive(test through username login)",
                ()=>({
                    username:testUserAccounts.deactivatedAccount.username,
                    password:"stacywilliams@123"
                })
            ],
            [
                "account is inactive(test through email login)",
                ()=>({
                    email:testUserAccounts.deactivatedAccount.email,
                    password:"stacywilliams@123"
                })
            ]
        ])("Should reject, %s", async(description, getBody)=>{
            const body = getBody()
            const response = await request(app).post("/api/auth/login").send(body)

            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Your account has been deactivated")

            //checking cookie (should not be set)
            const cookies = response.headers["set-cookie"]
            expect(cookies).not.toBeDefined()
        })
    })

    //logout api testcases
    describe("POST : /api/auth/logout", ()=>{
        //valid testcases for logout api
        test("Should pass, user is logged in", async () => {

            // Creating an agent
            const agent = request.agent(app)
        
            // Logging in
            const loginResponse = await agent
                .post("/api/auth/login")
                .send({
                    username: testUserAccounts.userAccount1.username,
                    password: "johnfernandes@123"
                })
        
            expect(loginResponse.statusCode).toBe(200)
        
            // Logging out
            const response = await agent
                .post("/api/auth/logout")
        
            expect(response.statusCode).toBe(200)
            expect(response.body.success).toBe(true)
            expect(response.body.message).toBe("Logged out successfully")
            expect(response.body.data).toEqual({})
        
            // Checking whether cookie was cleared
            const logoutCookies = response.headers["set-cookie"]
        
            expect(logoutCookies).toBeDefined()
        
            const clearedCookie = logoutCookies.find(cookie =>
                cookie.startsWith("token=")
            )
        
            expect(clearedCookie).toBeDefined()
            expect(clearedCookie).toContain("token=;")

            // Trying to access protected profile API after logout
            const profileResponse = await agent.get(`/api/account/${testUserAccounts.userAccount1.username}`)
            
            expect(profileResponse.statusCode).toBe(401)
        })
        
        //invalid testcases for logout 

        //token not provided
        test("Should reject, authentication token is not provided", async () => {

            const response = await request(app)
                .post("/api/auth/logout")
        
            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Authentication required")
        
            // Checking that no cookie was cleared
            expect(response.headers["set-cookie"]).not.toBeDefined()
        })

        //expired token
        test("Should reject, authentication token is expired", async () => {

            // Creating an expired JWT
            const expiredToken = jwt.sign(
                {
                    username: testUserAccounts.userAccount1.username,
                    accountId: testUserAccounts.userAccount1.id,
                    isAdmin: false
                },
                process.env.JWT_SECRET,
                { expiresIn: "-1s" }
            )
        
            const response = await request(app)
                .post("/api/auth/logout")
                .set("Cookie", `token=${expiredToken}`)
        
            expect(response.statusCode).toBe(401)
            expect(response.body.success).toBe(false)
            expect(response.body.message).toBe("Expired or malformed token")
        
            // Checking that no cookie was cleared
            expect(response.headers["set-cookie"]).not.toBeDefined()
        })
    })

    //forgot password api testcases
    describe("POST : /api/auth/forgotpassword", ()=>{
        //valid testcases for forgot password api
        //invalid testcases for forgot password api
    })

    //reset password api testcases
    describe("PUT : /api/auth/resetpassword", ()=>{
        //valid testcases for reset password api
        //invalid testcases for reset password api
    })
})