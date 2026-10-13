require("dotenv").config();
const express = require("express")
const {accountRouter} = require("./routes/accountRouter")
const {authRouter} = require("./routes/authRouter")
const cookieParser = require("cookie-parser")
const {errorHandler} = require("./middlewares/errorHandlingMiddleware")
const {redisClient} = require("./config/redisClient")
const {globalRateLimiter} = require("./middlewares/rateLimitMiddlewares")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use("/api", globalRateLimiter) // applying rate limiting on api requests

app.use("/api/account", accountRouter)
app.use("/api/auth", authRouter)

app.use(errorHandler)

app.listen(process.env.PORT, ()=>{    
    console.log("Server is listening on port:", process.env.PORT)
})