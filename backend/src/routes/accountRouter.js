const express = require("express")
const {AccountService, AdminAccountService} = require("../services/accountService")
const {AccountController, AdminAccountController} = require("../controllers/accountController")
const {authorize, authenticate, isAccountOwner} = require("../middlewares/authMiddlewares")
const {prisma} = require("../../prisma/client")
const {AuthService} = require("../services/authService")

//Services and Controllers instances to use them
const accountService = new AccountService(prisma)
const adminAccountService = new AdminAccountService(prisma)
const authService = new AuthService(prisma)

const accountController = new AccountController(accountService)
const adminAccountController = new AdminAccountController(adminAccountService)


//Common Admin and General User Routes
const accountRouter = express.Router()

accountRouter.post("/", accountController.createAccount)

accountRouter.put("/changepassword/:id", authenticate(authService), isAccountOwner, accountController.changePassword)

accountRouter.put("/:id", authenticate(authService), isAccountOwner, accountController.updateAccount)

accountRouter.get("/:id", authenticate(authService), isAccountOwner, accountController.getProfile)

accountRouter.delete("/:id", authenticate(authService), isAccountOwner, accountController.deleteAccount)

//Admin specific routes
accountRouter.get("/admin", authenticate(authService), authorize, adminAccountController.getAllAccounts)

accountRouter.put("/admin/inactivate/:id", authenticate(authService), authorize, adminAccountController.updateAccountActivity)

accountRouter.delete("/admin/:id", authenticate(authService), authorize, adminAccountController.deleteAccount)

module.exports = {accountRouter}