const {AccountUpdationInputsValidator} = require("../../src/validators/authInputsValidators")

//Validating the AccountUpdationInputsValidator
//specific for validating the inputs required
//for updating an account which is extending
//from BaseAuthInputsValidator class. It
//only has a validate method overridden in it

describe("AccountUpdationInputsValidator", ()=>{
    let validator
    
    beforeEach(()=>{
        validator = new AccountUpdationInputsValidator()
    })
    //valid testcase for the validate method
    test("Should accept, all required inputs are given", ()=>{
        const userAccountDetails = {
            username:"muhtasham_123", 
            firstname:"muhtasham",
            lastname:"farooqi",
            dateOfBirth:"2005-03-01",
        }
        expect(()=>validator.validate(userAccountDetails)).not.toThrow()
    })

    //missing required fields testcases for the validate method
    test.each([
        [
            "username not given",
            {
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
            }
        ],
        [
            "firstname not given",
            {
                username:"muhtasham_123",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
            }
        ],
        [
            "lastname not given",
            {
                username:"muhtasham_123",
                firstname:"muhtasham",
                dateOfBirth:"2005-03-01",
            }
        ],
        [
            "date of birth not given",
            {
                username:"muhtasham_123",
                firstname:"muhtasham",
                lastname:"farooqi",
            }
        ],
    ])("Should reject, %s", (description, userAccountDetails)=>{
        expect(()=>validator.validate(userAccountDetails)).toThrow("All fields are required")
    })

    //invalid username input testcase for validate method
    test("should reject, invalid username", ()=>{
        expect(()=>validator.validate(
            {
                username:"aka@123", 
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"2005-03-01",
            }
        )).toThrow(
            "Username must be 8-15 characters and can only contain letters, numbers and underscores"
        )
    })

    //invalid name input testcase for validate method
    test("should reject, invalid firstname and lastname", ()=>{
        expect(()=>validator.validate(
            {
                username:"muhtasham_123", 
                firstname:"muhammd muhtasham 1234",
                lastname:"farooqi_223",
                dateOfBirth:"2005-03-01",
            }
        )).toThrow(
            "Name must be between 3-19 characters and can only contain letters"
        )
    })    

    //invalid date of birth input testcase for validate method
    test("should reject, invalid date of birth", ()=>{
        expect(()=>validator.validate(
            {
                username:"muhtasham_123", 
                firstname:"muhtasham",
                lastname:"farooqi",
                dateOfBirth:"03-01-2005",
            }
        )).toThrow(
            "Date of birth must be in YYYY-MM-DD format"
        )
    })
})