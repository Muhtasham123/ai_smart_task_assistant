require("dotenv").config();
const {redisClient} = require("./config/redisClient.js")
const app = require("./app")
const seedAdmin = require("./seedAdmin.js")

const startServer = async()=>{
    try {
        await seedAdmin()
        app.listen(process.env.PORT, async()=>{    
           console.log("Server is listening on port:", process.env.PORT)
        })

    } catch (error) {
        console.log("Server startup failed : " + error.message)
        process.exitCode = 1;
    }
}

startServer()