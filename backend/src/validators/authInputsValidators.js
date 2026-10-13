const {BadRequestError} = require("../errors/appError")

//Base class having all the common functionality in both login and account creation
class BaseAuthInputsValidator {
    static validUsernamePattern = /^[a-zA-Z0-9_]{8,15}$/ //only allows letters, numbers and underscores and forces to 8-15 characters

    static validNamePattern = /^[a-zA-Z]{3,19}$/ //only allows letters and forces 3-19 characters

    static dateOfBirthPattern = /^\d{4}-\d{2}-\d{2}$/
    static minimumAge = 13
    static maximumAge = 120

    //common in both account creation and login
    validateUsername(username){
        if(!BaseAuthInputsValidator.validUsernamePattern.test(username)){
            throw new BadRequestError("Username must be 8-15 characters and can only contain letters, numbers and underscores")
        }
    }

    validateName(name){
        if(!BaseAuthInputsValidator.validNamePattern.test(name)){
            throw new BadRequestError("Name must be between 3-19 characters and can only contain letters")
        }
    }

    validateDateOfBirth(dateOfBirth){
        if(!BaseAuthInputsValidator.dateOfBirthPattern.test(dateOfBirth)){
            throw new BadRequestError("Date of birth must be in YYYY-MM-DD format")
        }

        const [year, month, day] = dateOfBirth.split("-").map(Number)
        const parsedDate = new Date(dateOfBirth)

        //reject dates JS silently "rolled over" (e.g. Feb 31 -> Mar 3)
        if(
            parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() + 1 !== month ||
            parsedDate.getDate() !== day
        ){
            throw new BadRequestError("Date of birth is not a valid calendar date")
        }

        if(parsedDate.getTime() > Date.now()){
            throw new BadRequestError("Date of birth cannot be in the future")
        }

        const age = this.#calculateAge(parsedDate)

        if(age < BaseAuthInputsValidator.minimumAge){
            throw new BadRequestError(`You must be at least ${BaseAuthInputsValidator.minimumAge} years old`)
        }

        if(age > BaseAuthInputsValidator.maximumAge){
            throw new BadRequestError("Date of birth is not valid")
        }
    }

    #calculateAge(dateOfBirth){
        const today = new Date()
        let age = today.getFullYear() - dateOfBirth.getFullYear()

        const hasHadBirthdayThisYear =
            today.getMonth() > dateOfBirth.getMonth() ||
            (today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate())

        if(!hasHadBirthdayThisYear){
            age--
        }

        return age
    }

    validate(){
        throw new Error("Validate must be implemented in the child classes")
    }
}

//Both login and account creation have a little bit
//different machanism for validating account.
//Login only requires one of email or username
//while account creation requires both

class LoginInputsValidator extends BaseAuthInputsValidator {

    validate(username, email, password){
        if((!username && !email) || !password){
            throw new BadRequestError("Username or email and password are required")
        }
        
        if(username){
            this.validateUsername(username)
        }
    }
}

class AccountCreationInputsValidator extends BaseAuthInputsValidator{

    validate(userAccountDetails){
        const {
            username, 
            firstname, 
            lastname, 
            dateOfBirth, 
            email,
            password
        } = userAccountDetails

        if(!username || !email || !password || !firstname || !lastname || !dateOfBirth){
            throw new BadRequestError("All fields are required")
        }

        this.validateUsername(username)
        this.validateName(firstname)
        this.validateName(lastname)
        this.validateDateOfBirth(dateOfBirth)
    }
}

class AccountUpdationInputsValidator extends BaseAuthInputsValidator{

    validate(userAccountDetails){
        const {
            username, 
            firstname, 
            lastname, 
            dateOfBirth, 
        } = userAccountDetails

        if(!username || !firstname || !lastname || !dateOfBirth){
            throw new BadRequestError("All fields are required")
        }

        this.validateUsername(username)
        this.validateName(firstname)
        this.validateName(lastname)
        this.validateDateOfBirth(dateOfBirth)
    }
}

module.exports = {
    BaseAuthInputsValidator,
    LoginInputsValidator,
    AccountCreationInputsValidator,
    AccountUpdationInputsValidator
}