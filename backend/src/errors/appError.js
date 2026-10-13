//A single class that defines the shape
//of the object that will be passed to
//error handeling middleware in case of
//an error

class ErrorModel {
    constructor(error, functionName, controllerName){
        this.error = error //the actual error object
        this.functionName = functionName //function in which error occured
        this.controllerName = controllerName //controller from which the function belongs 
    }
}


//One common AppError class for
//status code and common functionality
//extending the javascript's own Error class
//and each separate child class for 
//different type of errors having their own
//relevant message

class AppError extends Error{
    constructor(statusCode, message){
        super(message)
        this.statusCode = statusCode
    }
}

class NotFoundError extends AppError{
    constructor(message){
        super(404, message)
    }
}

class BadRequestError extends AppError{
    constructor(message){
        super(400, message)
    }
}

class UnauthorizedError extends AppError{
    constructor(message){
        super(401, message)
    }
}

class ForbiddenError extends AppError{
    constructor(message){
        super(403, message)
    }
}

class ConflictError extends AppError{
    constructor(message){
        super(409, message)
    }
}

module.exports = {
    ErrorModel,
    AppError,
    BadRequestError, 
    UnauthorizedError,
    NotFoundError,
    ForbiddenError,
    ConflictError
}