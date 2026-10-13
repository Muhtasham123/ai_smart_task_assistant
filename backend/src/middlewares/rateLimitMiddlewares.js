const {rateLimit} = require("express-rate-limit")
const {RedisStore} = require("rate-limit-redis")
const {redisClient} = require("../config/redisClient")

//Reusable function to create a redis store
function createRedisStore(prefix){

    return new RedisStore({
        prefix,
        sendCommand:(...args) => redisClient.sendCommand(args)
    })
}

//Global rate limiter for all the routes
//allowing 100 requests per minute
const redisGlobalRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore("rl:global:"),
    message: {
        success: false,
        message: "Too many requests. Please try again later"
    }
}
)

//Login specific rate limiter with strict rate
//limiting policy allowing 5 requests per 10 minutes
const redisLoginRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRedisStore("rl:login:"),
    message: {
        success: false,
        message: "Too many requests. Please try again later"
    }
})


//Wrappers that actually call the middleware returned
//by the above function. This is necessary because
//if redis is down, we want to unable the rate
//limiting and move to the next route directly
//(We do not want to down the whole application if redis
//is down and was unable to connect)
const globalRateLimiter = (req, res, next) => {
    if(redisClient.isReady){
        return redisGlobalRateLimiter(req, res, next)
    }
    next()
}

const loginRateLimiter = (req, res, next) => {
    if(redisClient.isReady){
        return redisLoginRateLimiter(req, res, next)
    }
    next()
}

module.exports = {
    globalRateLimiter,
    loginRateLimiter
}