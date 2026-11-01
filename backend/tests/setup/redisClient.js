const { redisClient } = require("../../src/config/redisClient")

//connect to redis
const connectRedis = async()=>{
   if(!redisClient.isOpen){    
       await redisClient.connect()
   }
}

//cleanup redis
const cleanupRedis = async()=>{
    const redisUrl = new URL(process.env.REDIS_URL)
    if(redisUrl.pathname != "/1"){ //<-- making sure test db gets cleaned up
        throw new Error("Refusing to clean Redis: test database DB 1 is not selected")
    }
    await redisClient.flushDb()
}

//disconnect redis
const disconnectRedis = async()=>{
    if(redisClient.isOpen){
        await redisClient.quit()
    }
}

module.exports = {connectRedis, cleanupRedis, disconnectRedis}