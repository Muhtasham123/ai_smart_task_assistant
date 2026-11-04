const { redisClient } = require("../src/config/redisClient")

//Logs in a mock test user
const loginMockUser = async(agent, username, password)=>{
    const response = await agent.post("/api/auth/login").send({
        username,
        password
    })
    return response
}

//check in db whether a user account exists
const getAccountFromDb = async(prisma, getBy)=>{
    const account = await prisma.user.findUnique({
        where:getBy
    })

    return account
}

//check token in redis
const getTokenFromRedis = async(redisClient)=>{
    const result = await redisClient.scan("0", {
        MATCH:"signup:verification:*",
        COUNT:100
    })

    return result
}

module.exports = {
    loginMockUser, 
    getAccountFromDb,
    getTokenFromRedis
}