import { checkSchema } from "express-validator";
import { JsonWebTokenError } from "jsonwebtoken";
import { httpStatus } from "~/constants/httpStatus";
import { userMessages } from "~/constants/messages";
import { ErrorWithStatus } from "~/models/Errors";
import databaseService from "~/services/db.services";
import userService from "~/services/users.services";
import { hashPassword } from "~/utils/crypto";
import { verifyToken } from "~/utils/jwt";
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
            options: async (value, {req}) => {
                const user = await databaseService.users.findOne({email: value, password: hashPassword(req.body.password)})
                if(user === null) {
                    throw new Error(userMessages.EMAIL_EXIST)
                }
                req.user = user // mục đích: truyền user ra ngoài userController
                return  true
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
}, ['body'])) // validate req body only

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
}, ['body'])) // validate req body only

export const accessTokenValidator = validate(checkSchema({
    Authorization: {
        notEmpty: {
            errorMessage: userMessages.ACCESS_TOKEN_REQUIRED
        },
        custom: {
            options: async (value, {req}) => {
                const access_token = value.split(' ')[1]
                if(access_token === '') {
                    throw new ErrorWithStatus({message: userMessages.ACCESS_TOKEN_REQUIRED, status: httpStatus.UNAUTHORIZED})
                }
                const decode_authorization = await verifyToken({token: access_token})
                req.decode_authorization = decode_authorization
                return true
            }
        }
    }
}, ['headers']))

export const refreshTokenValidator = validate(checkSchema({
    refresh_token: {
        notEmpty: {
            errorMessage: userMessages.REFRESH_TOKEN_REQUIRED
        },
        custom: {
            options: async (value, {req}) => {
                try {
                    const [decode_refresh_token, refresh_token] = await Promise.all([
                        await verifyToken({token: value}),
                        await databaseService.refreshTokens.findOne({token: value})
                    ])
                    console.log("refresh_token",refresh_token);
                    if(refresh_token === null) {
                        throw new ErrorWithStatus({message: "Refresh token ko tồn tại", status: 401})
                    }                    
                    // return req về cho controller xử lý
                    req.decode_refresh_token =decode_refresh_token

                } catch (error) {
                    if(error instanceof JsonWebTokenError) {
                        throw new ErrorWithStatus({
                            message: "Refresh token không đúng",
                            status: httpStatus.UNAUTHORIZED
                        })
                    }
                    throw error
                }

                
                return true
            }
        }
    }
}))