const {AuthService} = require("../services/authService")
const {AuthController} = require("../controllers/authController")
const {authenticate} = require("../middlewares/authMiddlewares")
const express = require("express")
const {prisma} = require("../../prisma/client")
const {loginRateLimiter} = require("../middlewares/rateLimitMiddlewares")

const authService = new AuthService(prisma)
const authController = new AuthController(authService)

const authRouter = express.Router()

authRouter.post("/login", loginRateLimiter, authController.login)
authRouter.post("/logout", authenticate(authService), authController.logout)
authRouter.post("/forgotpassword", authController.forgotPassword)
authRouter.put("/resetpassword", authController.resetPassword)

module.exports = {authRouter}