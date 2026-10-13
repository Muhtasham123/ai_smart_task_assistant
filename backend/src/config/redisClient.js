//Configuring a redis client so that to make
//connection to it and allowing express-rate-limit
//to ue use redis as a shared storage for request counters

const {createClient} = require("redis")

const redisClient = createClient({
    url:process.env.REDIS_URL
})

redisClient.on("error", err=>console.log("Redis client error", err.message))

const connectToRedis = async ()=>{
    await redisClient.connect()
}

connectToRedis().catch((error)=>{
    console.log("Failed to connect to redis. Rate limiting will be ignored ", error.message)
})

module.exports = {redisClient}