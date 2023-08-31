import { checkSchema } from "express-validator";
import { userMessages } from "~/constants/messages";
import userService from "~/services/users.services";
import { validate } from "~/utils/validator";


export const checkValidateLogin = validate(checkSchema({
    email: {
        notEmpty: {
            errorMessage: userMessages.EMAIL_REQUIRED
        },
        trim: true,
        isEmail: {
            errorMessage:userMessages.EMAIL_INVALID
        },
        custom: {
            options: async (value) => {
                const result = await userService.checkEmail(value)
                if(result) {
                    throw new Error(userMessages.EMAIL_EXIST)
                }
                return true
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: userMessages.PASSWORD_REQUIRED
        },
        trim: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: userMessages.PASSWORD_LENGTH_6_TO_50
        }
    }
}))

export const checkValidateRegistor = validate(checkSchema({
    name: {
        notEmpty: {
            errorMessage: userMessages.NAME_REQUIRED
        },
        trim: true,
        isLength: {
            options: {
                min: 3,
                max: 100
            },
            errorMessage: userMessages.NAME_LENGTH_3_TO_100
        }
    },
    email: {
        notEmpty: {
            errorMessage: userMessages.EMAIL_REQUIRED
        },
        trim: true,
        isEmail: {
            errorMessage:userMessages.EMAIL_INVALID
        },
        custom: {
            options: async (value) => {
                const result = await userService.checkEmail(value)
                if(result) {
                    throw new Error(userMessages.EMAIL_EXIST)
                }
                return true
            }
        }
    },
    password: {
        notEmpty: {
            errorMessage: userMessages.PASSWORD_REQUIRED
        },
        trim: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: userMessages.PASSWORD_LENGTH_6_TO_50
        }
    },
    confirm_password: {
        notEmpty: {
            errorMessage: userMessages.CONFIRM_PASSWORD_REQUIRED
        },
        trim: true,
        isLength: {
            options: {
                min: 6,
                max: 50
            },
            errorMessage: userMessages.CONFIRM_PASSWORD_LENGTH_6_TO_50
        },
        custom: {
            options: (value, {req}) => {
                if(value !== req.body.password) {
                    throw new Error(userMessages.CONFIRM_PASSWORD_NOT_MATCH)
                }
                return true
            }
        }
    },
    date_of_birth: {
        isISO8601: {
            options: {
                strict: true,
                strictSeparator: true
            },
            errorMessage: userMessages.DATE_OF_BIRTH_IS_ISO2801
        }
    }
}))