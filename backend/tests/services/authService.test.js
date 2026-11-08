const {
    prisma, 
    connectTestDataBase,
    createTestUserAccount, 
    createTestAdminAccount, 
    cleanupTestDatabase,
    disconnectTestDatabase
} = require("../setup/database")

const {AuthService} = require("../../src/services/authService")
const crypto = require("crypto")
const bcrypt = require("bcrypt")

//Testing the AuthService having all
//the methods related to user authentication

describe("AuthService", ()=>{
    let testUserAccounts
    let testAdminAccount
    let service
    //connecting to test database
    beforeAll(async()=>{
        await connectTestDataBase()
    })

    //creating test records in DB before each
    //testcase runs
    beforeEach(async()=>{
        testUserAccounts = await createTestUserAccount()
        testAdminAccount = await createTestAdminAccount()
        service = new AuthService(prisma)
    })

    //cleaning up DB after each testcase runs
    afterEach(async()=>{
        await cleanupTestDatabase()
    })

    //disconnecting DB after all 
    //testcases run
    afterAll(async()=>{
        await disconnectTestDatabase()
    })

    //login testcases
    describe("AuthService.login", ()=>{
        //valid testcase for login (through username)
        test("Should pass, username and password are correct", async()=>{
            const accountDetails = await service.login(
                testUserAccounts.userAccount1.username,
                "johnfernandes@123",
                null
            )
            expect(accountDetails).toBeDefined()
            expect(accountDetails.token).toBeTruthy()
            expect(accountDetails.id).toBe(testUserAccounts.userAccount1.id)
        })

        //valid testcase for login (through email)
        test("Should pass, email and password are correct", async()=>{
            const accountDetails = await service.login(
                null,
                "johnfernandes@123",
                testUserAccounts.userAccount1.email
            )
            expect(accountDetails).toBeDefined()
            expect(accountDetails.token).toBeTruthy()
            expect(accountDetails.id).toBe(testUserAccounts.userAccount1.id)
        })

        //invalid testcase for login (username does not exist)
        test("Should reject, username does not exist", async()=>{
            await expect(service.login(
                "john_1234",
                "johnfernandes@123",
                null
            )).rejects.toThrow("Invalid username, email or password")
        })

        //invalid testcase for login (email does not exist)
        test("Should reject, email does not exist", async()=>{
            await expect(service.login(
                null,
                "johnfernandes@123",
                "jonfernandes@gmail.com"
            )).rejects.toThrow("Invalid username, email or password")
        })

        //invalid testcase for login (incorrect password with correct username)
        test("Should reject, incorrect password with correct username", async()=>{
            await expect(service.login(
                testUserAccounts.userAccount1.username,
                "johnfernandes123",
                null
            )).rejects.toThrow("Invalid username, email or password")
        })
        
        //invalid testcase for login (incorrect password with correct email)
        test("Should reject, incorrect password with correct email", async()=>{
            await expect(service.login(
                null,
                "johnfernandes123",
                testUserAccounts.userAccount1.email
            )).rejects.toThrow("Invalid username, email or password")
        })

        //invalid testcase (account is deactivated)
        test("Should reject, account is deactivated", async()=>{
            await expect(service.login(
                null,
                "stacywilliams@123",
                testUserAccounts.deactivatedAccount.email
            )).rejects.toThrow("Your account has been deactivated")
        })
    })

    //forgotPassword testcases
    describe("AuthService.forgotPassword", ()=>{
        //valid testcase for forgotPassword
        test("Should pass, email exists", async()=>{
            //updating the email of an existing account
            //to an actual email
            await prisma.user.update({
                where:{
                    id:testUserAccounts.userAccount1.id
                },
                data:{
                    email:"muhtashamfarooqi433@gmail.com"
                }
            })
            const token = await service.forgotPassword("muhtashamfarooqi433@gmail.com")

            //updating the email back to mock email
            await prisma.user.update({
                where:{
                    id:testUserAccounts.userAccount1.id
                },
                data:{
                    email:"johnfernandes@gmail.com"
                }
            })

            //checking token in database
            const savedToken = await prisma.token.findFirst({
                where:{
                    userId:testUserAccounts.userAccount1.id
                }
            })

            expect(token).toBeTruthy()
            expect(savedToken).toBeDefined()
            expect(savedToken.tokenHash).toBe(crypto.createHash("sha256").update(token).digest("hex"))
        })

        //Invalid testcase for forgotPassword (email does not exist)
        test("Should reject, email does not exist", async()=>{
            await expect(service.forgotPassword("invalidemail@gmail.com")).rejects.toThrow(
                "If an account exists with this email, a reset link is sent on this email"
            )
        })
    })

    //resetPassword testcases
    describe("AuthService.resetPassword", ()=>{
        //valid testcase for resetPassword (token is valid)
        test("Should pass, token is valid", async()=>{
            //creating a known mock token in DB
            const tokenHash = crypto.createHash("sha256").update(process.env.MOCK_PASSWORD_RESET_TOKEN).digest("hex")
            const expiryTime = new Date(new Date().getTime() + 15*60*1000) 
            await prisma.token.create({
                data:{
                    tokenHash,
                    expiryTime,
                    userId:testUserAccounts.userAccount1.id
                }
            })

            //now passing the same original token 
            //and new password in resetPassword function
            const newPassword = "newpassword@123"
            const account = await service.resetPassword(process.env.MOCK_PASSWORD_RESET_TOKEN, newPassword)

            //fetching updated account from DB to check updated password
            const updatedAccount = await prisma.user.findUnique({
                where:{
                    id:testUserAccounts.userAccount1.id
                }
            })
            
            const savedToken = await prisma.token.findUnique({
                where: {
                     tokenHash
                }
            })

            const passwordUpdated = await bcrypt.compare("newpassword@123", updatedAccount.password)
            expect(account).toBeDefined()
            expect(account.id).toBe(testUserAccounts.userAccount1.id)
            expect(account.username).toBe(testUserAccounts.userAccount1.username)
            expect(passwordUpdated).toBe(true)
            expect(savedToken).toBeNull()
        })

        //invalid testcase for resetPassword(invalid token)
        test("Should reject, token does not exist", async()=>{
            //creating a mock token in DB
            await prisma.token.create({
                data:{
                    tokenHash:crypto.createHash("sha256").update(process.env.MOCK_PASSWORD_RESET_TOKEN).digest("hex"),
                    expiryTime: new Date(Date.now() + 15 * 60 * 1000),
                    userId:testUserAccounts.userAccount1.id
                }
            })
            await expect(service.resetPassword("randominvalidtoken", "newpassword@123")).rejects.toThrow(
                "Invalid reset token"
            )

            //checking password (should be unchanged)
            const account = await prisma.user.findUnique({
                where:{
                    id:testUserAccounts.userAccount1.id
                }
            })
            const isPasswordUnchanged = await bcrypt.compare("johnfernandes@123", account.password)

            expect(isPasswordUnchanged).toBe(true)
        })

        //invalid testcase for resetPassword(expired token)
        test("Should reject, expired token", async()=>{
            //creating an expired token in DB
            await prisma.token.create({
                data:{
                    tokenHash:crypto.createHash("sha256").update(process.env.MOCK_PASSWORD_RESET_TOKEN).digest("hex"),
                    expiryTime: new Date(Date.now()),
                    userId:testUserAccounts.userAccount1.id
                }
            })

            await expect(service.resetPassword(process.env.MOCK_PASSWORD_RESET_TOKEN, "newpassword@123")).rejects.toThrow(
                "Your reset token has been expired"
            )

            //checking password (should be unchanged)
            const account = await prisma.user.findUnique({
                where: {
                    id: testUserAccounts.userAccount1.id
                }
            })

            const isPasswordUnchanged = await bcrypt.compare(
                "johnfernandes@123",
                account.password
            )

            expect(isPasswordUnchanged).toBe(true)
        })
    })

    //isActiveAccount testcases
    describe("AuthService.isActiveAccount", ()=>{
        //valid testcase for isActiveAccount(id exists) <-- active account test
        test("Should pass, id exists (active account test)", async()=>{
            const accountActive = await service.isActiveAccount(testUserAccounts.userAccount1.id)
            expect(accountActive).toBe(true)
        })

        //valid testcase for isActiveAccount(id exists) <-- inactive account test
        test("Should pass, id exists (inactive account test)", async()=>{
            const accountActive = await service.isActiveAccount(testUserAccounts.deactivatedAccount.id)
            expect(accountActive).toBe(false)
        })

        //valid testcase for isActiveAccount(id does not exist but will return false, no error)
        test("Should pass, id does not exist (can return false)", async()=>{
            const accountActive = await service.isActiveAccount(100)
            expect(accountActive).toBeNull()
        })

        //--- NO INVALID TESTCASES REQUIRED ---
    })
})