const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")

const prisma = new PrismaClient()

const connectTestDataBase = async()=>{
    await prisma.$connect()
}

//Function for creating a test record in database
const createTestUserAccount = async()=>{
    const hashedPassword1 = await bcrypt.hash("johnfernandes@123",10)
    const hashedPassword2 = await bcrypt.hash("lindawatson@123",10)
    const hashedPassword3 = await bcrypt.hash("stacywilliams@123",10)
    const userAccount1 = await prisma.user.create({
        data:{
            username:"john_123",
            firstname:"john",
            lastname:"fernandes",
            email:"johnfernandes@gmail.com",
            password:hashedPassword1,
            dateOfBirth:new Date("2005-03-01")
        }
    })
    const userAccount2 = await prisma.user.create({
        data:{
            username:"linda_123",
            firstname:"linda",
            lastname:"watson",
            email:"lindawatson@gmail.com",
            password:hashedPassword2,
            dateOfBirth:new Date("2005-03-01")
        }
    })

    const deactivatedAccount = await prisma.user.create({
        data:{
            username:"stacy_123",
            firstname:"stacy",
            lastname:"williams",
            email:"stacywilliams@gmail.com",
            password:hashedPassword3,
            dateOfBirth:new Date("2005-03-01"),
            isActive:false
        }
    })

    return {userAccount1, userAccount2, deactivatedAccount}
}

//Function for creating a test admin account record in database
const createTestAdminAccount = async()=>{
    const hashedPassword = await bcrypt.hash("admin@123",10)
    const adminAccount = await prisma.user.create({
        data:{
            username:"admin_123",
            firstname:"admin",
            lastname:"admin",
            email:"admin@gmail.com",
            password:hashedPassword,
            dateOfBirth:new Date("2000-03-01"),
            isAdmin:true
        }
    })
    return adminAccount
}

//Function for cleaning up test database
const cleanupTestDatabase = async()=>{
    const databaseUrl = new URL(process.env.DATABASE_URL)

    if (databaseUrl.pathname !== `/${process.env.TEST_DB_NAME}`) {
        throw new Error(
            "Refusing to clean database: test database is not selected"
        )
    }

    await prisma.user.deleteMany()
    await prisma.token.deleteMany()
}

//Function for disconnecting database
const disconnectTestDatabase = async()=>{
    await prisma.$disconnect()
}

module.exports = { 
    prisma, 
    connectTestDataBase,
    createTestAdminAccount, 
    createTestUserAccount, 
    disconnectTestDatabase,
    cleanupTestDatabase
}