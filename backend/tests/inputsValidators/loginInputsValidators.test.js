const {LoginInputsValidator} = require("../../src/validators/authInputsValidators")

//Validating the LoginInputsValidator
//specific for validating the inputs required
//for login which is extending
//from BaseAuthInputsValidator class. It
//only has a validate method overridden in it

describe("LoginInputsValidator", ()=>{
    let validator
    
    beforeEach(()=>{
        validator = new LoginInputsValidator()
    })
    //valid testcase for the validate method (login with both username and email)
    test("Should accept, all required inputs are given", ()=>{
        expect(()=>validator.validate(
            "muhtasham_123", 
            "muhtashamfarooqi@gmail.com", 
            "muhtasham@123"
        )).not.toThrow()
    })

    //valid testcase for the validate method (login with both username only, not email)
    test("Should accept, username and password are given", ()=>{
        expect(()=>validator.validate(
            "muhtasham_123", 
            "", 
            "muhtasham@123"
        )).not.toThrow()
    })
    
    //valid testcase for the validate method (login with email only, not username)
    test("Should accept, email and password are given", ()=>{
        expect(()=>validator.validate(
            "", 
            "muhtashamfarooqi@gmail.com", 
            "muhtasham@123"
        )).not.toThrow()
    })

    //missing required fields testcases for the validate method
    test("Should reject, username, email and password are not given", ()=>{
        expect(()=>validator.validate(
            "", 
            "", 
            ""
        )).toThrow("Username or email and password are required")
    })

    //invalid testcase for missing password only
    test("should reject, passwrod is not given", ()=>{
        expect(()=>validator.validate(
           "muhtasham_123",
           "muhtashamfarooqi@gmail.com",
           ""
        )).toThrow(
            "Username or email and password are required"
        )
    })

    //invalid testcase for missing username and email
    test("should reject, email and username both are not given", ()=>{
        expect(()=>validator.validate(
            "",
            "",
            "muhtasham@123"
        )).toThrow(
            "Username or email and password are required"
        )
    })    

    //testcase for invalid username input
    test("should reject, username is invalid", ()=>{
        expect(()=>validator.validate(
            "aka@123",
            "",
            "muhtasham@123"
        )).toThrow(
            "Username must be 8-15 characters and can only contain letters, numbers and underscores"
        )
    })
})