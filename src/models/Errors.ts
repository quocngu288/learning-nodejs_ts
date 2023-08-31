import { httpStatus } from "~/constants/httpStatus"
import { userMessages } from "~/constants/messages"

// Record<string, string> => {[key: string]: string}
type ErrorType = Record<string,{ 
    msg: string
    [key: string]: any
}>


export class ErrorWithStatus {
    message: string
    status: number
    constructor({message, status}: {message: string, status: number}){
        this.message = message
        this.status = status
    }
}

// Dành cho lỗi error
export class EntityError extends ErrorWithStatus {
    errors: ErrorType
    constructor({message = userMessages.VALIDATION_ERROR, errors}: {message?: string, errors: ErrorType}) {
        super({message, status: httpStatus.UNPROCESSABLE_ENTITY})
        this.errors = errors
    }
}