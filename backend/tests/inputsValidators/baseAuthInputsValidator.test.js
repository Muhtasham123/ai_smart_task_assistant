const {BaseAuthInputsValidator} = require("../../src/validators/authInputsValidators")

//Validating the common BaseInputsValidator
//class having all the common functions
//used by LoginInputsValidator, AccountCreationInputsValidator
//, and AccountUpdationInputsValidator. There is
//a separate valid and invalid test for each input 
describe("BaseAuthInputsValidator", ()=>{
    let validator

    beforeAll(() => {
        jest.useFakeTimers();

        jest.setSystemTime(
          new Date("2026-10-30T12:00:00")
        );
    });

    beforeEach(()=>{
        validator = new BaseAuthInputsValidator()
    })

    describe("Test username validity", ()=>{
        //valid and boundary testcases for the username input
        test.each([
            ["valid username from all aspects", "user_1234"], 
            ["valid username with exactly 8 characters", "user_123"],//<-- username with exactly 8 characters (boundary testcase)
            ["valid username with exactly 15 characters", "usernamevalid_1"]//<-- username with exactly 15 characters (boundary testcase)
        ])("Should accept %s", (description, username)=>{
            expect(()=>validator.validateUsername(username)).not.toThrow()
        })

        //invalid testcases for the username input
        test.each([
            ["username less that 8 characters", "user"], //<-- short username
            ["username more than 15 characters", "usernameexceededallowedlength"], //<-- long username
            ["username having a symbol except underscore", "user@123"] //<-- having symbol except _
        ])("Should reject %s", (description, username) => {
            expect(()=>validator.validateUsername(username)).toThrow(
                "Username must be 8-15 characters and can only contain letters, numbers and underscores"
            )
        })
    })

    describe("Test firstname and lastname validity", ()=>{
        //valid and boundary testcases for name input
        test.each([
            ["valid name from all aspects", "muhtasham"], 
            ["valid name with exactly 3 characters", "aka"],//<-- name with exactly 3 characters (boundary testcase)
            ["valid name with exactly 19 characters", "namevalidatboundary"]//<-- name with exactly 19 characters (boundary testcase)
        ])("Should accept %s", (description, name)=>{
            expect(()=>validator.validateName(name)).not.toThrow()
        })

        //invalid testcases for name input
        test.each([
            ["name less than 3 chanracters", "ak"],//<-- short name 
            ["name greater than 19 characters", "muhtashamisaverylongname"],//<-- long name
            ["name with space", "M Muhtasham"],//<-- name with space
            ["name with symbols", "muhtasham@"],//<-- name with symbol
            ["name with numbers", "muhtasham123"]//<-- name with numbers
        ])("Should reject %s", (description, name)=>{
            expect(()=>validator.validateName(name)).toThrow(
                "Name must be between 3-19 characters and can only contain letters"
            )
        })
    })

    describe("Test date of birth validity", () => {

        beforeAll(() => {
            jest.useFakeTimers()
            jest.setSystemTime(new Date("2026-10-30T12:00:00"))
        })
    
        afterAll(() => {
            jest.useRealTimers()
        })
    
        // Valid date of birth test cases
        test.each([
            ["birthday has passed", "2005-03-01"],
            ["birthday is today", "2005-10-30"],
            ["valid date with leap year", "2004-02-29"]
        ])("Should accept, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).not.toThrow()
        })
    
    
        // Invalid date format test cases
        test.each([
            ["MM-DD-YYYY format", "03-21-2005"],
            ["DD-MM-YYYY format", "21-03-2005"],
            ["MM-YYYY-DD format", "03-2005-21"],
            ["DD-YYYY-MM format", "21-2005-03"],
            ["date with slashes", "2005/03/21"],
            ["date with missing day", "2005-03"],
            ["date with missing month", "2005-21"],
            ["empty date", ""]
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow(
                "Date of birth must be in YYYY-MM-DD format"
            )
        })
    
    
        // Invalid calendar date test cases
        test.each([
            ["invalid day in February", "2005-02-30"],
            ["invalid month", "2005-13-10"],
            ["month zero", "2005-00-10"],
            ["day zero", "2005-03-00"],
            ["invalid leap year date", "2005-02-29"],
            ["invalid day in April", "2005-04-31"],
            ["YYYY-DD-MM format", "2005-21-03"],
            ["future date with invalid calendar day", "2027-11-31"]
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow(
                "Date of birth is not a valid calendar date"
            )
        })
    
    
        // Future date of birth test cases
        test.each([
            ["tomorrow", "2026-10-31"],
            ["next month", "2026-11-10"],
            ["next year", "2027-10-30"],
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow(
                "Date of birth cannot be in the future"
            )
        })
    
    
        // Minimum age validation test cases
        test.each([
            ["age below 13 years", "2020-10-23"],
            ["will turn 13 tomorrow", "2013-10-31"],
            ["will turn 13 next month", "2013-11-01"]
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow(
                "You must be at least 13 years old"
            )
        })
    
        // Maximum age validation test cases
        test.each([
            ["age greater than 120 years", "1900-10-23"],
            ["turned 121 earlier this year", "1905-09-12"],
            ["exactly 121 years old", "1905-10-30"],
            ["one day older than 121", "1905-10-29"]
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow(
                "Date of birth is not valid"
            )
        })
    
        // Minimum and maximum age boundary test cases
        test.each([
            ["exactly 13 years old", "2013-10-30"],
            ["exactly 120 years old", "1906-10-30"]
        ])("Should accept, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).not.toThrow()
        })
        test.each([
            ["one day younger than 13", "2013-10-31"],
            ["one day older than 120", "1905-10-29"]
        ])("Should reject, %s", (description, dateOfBirth) => {
            expect(() => validator.validateDateOfBirth(dateOfBirth)).toThrow()
        })

    })
   
})