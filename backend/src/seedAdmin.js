const  {prisma} = require("../prisma/client")
const  bcrypt = require("bcrypt")

const seedAdmin = async()=>{
    try {
        const adminExists = await prisma.user.findFirst({
            where:{
                OR:[
                    {username:process.env.ADMIN_USERNAME},
                    {email:process.env.ADMIN_EMAIL}
                ]
            }
        })

        if(!adminExists){
            const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
            await prisma.user.create({
                data:{
                    firstname:process.env.ADMIN_FIRSTNAME,
                    lastname:process.env.ADMIN_LASTNAME,
                    username:process.env.ADMIN_USERNAME,
                    email:process.env.ADMIN_EMAIL,
                    password:passwordHash,
                    dateOfBirth: new Date(process.env.ADMIN_DATE_OF_BIRTH),
                    isAdmin:true,
                    isActive:true
                }
            })
            console.log("Admin account created successfully!")
        }else{
            console.log("Admin account already exists")
        }
    } catch (error) {
        console.log("Error in seedAdmin : " + error.message)
        throw error
    }
}

module.exports = seedAdmin