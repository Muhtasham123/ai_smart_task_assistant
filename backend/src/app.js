const express = require("express")
const {accountRouter} = require("./routes/accountRouter.js")
const {authRouter} = require("./routes/authRouter.js")
const cookieParser = require("cookie-parser")
const {errorHandler} = require("./middlewares/errorHandlingMiddleware.js")
const {globalRateLimiter} = require("./middlewares/rateLimitMiddlewares.js")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use("/api", globalRateLimiter) // applying rate limiting on api requests

app.use("/api/account", accountRouter)
app.use("/api/auth", authRouter)

app.use(errorHandler)

module.exports = app
