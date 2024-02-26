import { NextFunction, Request, Response } from 'express'
import { check, checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import { httpStatus } from '~/constants/httpStatus'
import { userMessages } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TokenPayload } from '~/models/requests/User.request'
import databaseService from '~/services/db.services'
import userService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validator'

export const checkValidateLogin = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: userMessages.EMAIL_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: userMessages.EMAIL_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(userMessages.EMAIL_EXIST)
            }
            req.user = user // mục đích: truyền user ra ngoài userController
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
    },
    ['body']
  )
) // validate req body only

export const checkValidateRegistor = validate(
  checkSchema(
    {
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
          errorMessage: userMessages.EMAIL_INVALID
        },
        custom: {
          options: async (value) => {
            const result = await userService.checkEmail(value)
            if (result) {
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
          options: (value, { req }) => {
            if (value !== req.body.password) {
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
    },
    ['body']
  )
) // validate req body only

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            console.log('access_token', access_token)

            if (access_token === '') {
              throw new ErrorWithStatus({
                message: userMessages.ACCESS_TOKEN_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            const decode_authorization = await verifyToken({
              token: access_token,
              secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
            })
            console.log('decode_authorization', decode_authorization)

            req.decode_authorization = decode_authorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema({
    refresh_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: userMessages.REFRESH_TOKEN_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const [decode_refresh_token, refresh_token] = await Promise.all([
              await verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
              await databaseService.refreshTokens.findOne({ token: value })
            ])
            console.log('refresh_token', refresh_token)
            if (refresh_token === null) {
              throw new ErrorWithStatus({ message: 'Refresh token ko tồn tại hoặc đã sử dụng', status: 401 })
            }
            // return req về cho controller xử lý
            req.decode_refresh_token = decode_refresh_token
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: 'Refresh token không đúng', //error.message
                status: httpStatus.UNAUTHORIZED
              })
            }
            throw error
          }

          return true
        }
      }
    }
  })
)

export const emailVerifyTokenValidator = validate(
  checkSchema({
    email_verify_token: {
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: userMessages.EMAIL_VERIFY_TOKEN_REQUIRED,
              status: httpStatus.UNAUTHORIZED
            })
          }
          const decode_email_verify_token = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_VERIFY_EMAIL as string
          })
          // return req về cho controller xử lý
          ;(req as Request).decode_email_verify_token = decode_email_verify_token

          return true
        }
      }
    }
  })
)

export const forgotPasswordValidator = validate(
  checkSchema({
    email: {
      notEmpty: {
        errorMessage: userMessages.EMAIL_REQUIRED
      },
      trim: true,
      isEmail: {
        errorMessage: userMessages.EMAIL_INVALID
      },
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (user === null) {
            throw new Error(userMessages.USER_NOT_FOUND)
          }
          req.user = user
          return true
        }
      }
    }
  })
)

export const verifyForgotPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.FORGOT_PASSWORD_TOKEN_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decode_forgot_password_token, forgot_password_token] = await Promise.all([
                await verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string
                }),
                await databaseService.users.findOne({ forgot_password_token: value })
              ])
              if (forgot_password_token === null) {
                throw new ErrorWithStatus({ message: 'token ko tồn tại hoặc đã sử dụng', status: 401 })
              }
              req.decode_forgot_password_token = decode_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: 'token không đúng', //error.message
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: userMessages.FORGOT_PASSWORD_TOKEN_REQUIRED,
                status: httpStatus.UNAUTHORIZED
              })
            }
            try {
              const [decode_forgot_password_token, forgot_password_token] = await Promise.all([
                await verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string
                }),
                await databaseService.users.findOne({ forgot_password_token: value })
              ])
              if (forgot_password_token === null) {
                throw new ErrorWithStatus({ message: 'token ko tồn tại hoặc đã sử dụng', status: 401 })
              }
              req.decode_forgot_password_token = decode_forgot_password_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: 'token không đúng', //error.message
                  status: httpStatus.UNAUTHORIZED
                })
              }
              throw error
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
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error(userMessages.CONFIRM_PASSWORD_NOT_MATCH)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateMeValidator = validate(
  checkSchema({
    name: {
      notEmpty: {
        errorMessage: userMessages.NAME_REQUIRED
      },
      optional: true,
      trim: true,
      isLength: {
        options: {
          min: 3,
          max: 100
        },
        errorMessage: userMessages.NAME_LENGTH_3_TO_100
      }
    },
    date_of_birth: {
      isString: true,
      optional: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        },
        errorMessage: userMessages.DATE_OF_BIRTH_IS_ISO2801
      }
    },
    bio: {
      isString: {
        errorMessage: userMessages.BIO_MUST_BE_STRING
      },
      optional: true,
      trim: true
    },
    location: {
      isString: {
        errorMessage: userMessages.LOCATION_MUST_BE_STRING
      },
      optional: true,
      trim: true
    },
    website: {
      isString: {
        errorMessage: userMessages.WEBSITE_MUST_BE_STRING
      },
      optional: true,
      trim: true
    },
    username: {
      isString: {
        errorMessage: userMessages.USERNAME_MUST_BE_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 40
        },
        errorMessage: userMessages.USERNAME_LIMIT_LENGHT
      },
      optional: true,
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const username = await databaseService.users.findOne({ username: value })
          if (username) {
            throw Error('Username existed')
          }
        }
      }
    },
    avatar: {
      isString: {
        errorMessage: userMessages.IMG_URL_MUST_BE_STRING
      },
      optional: true,
      trim: true
    },
    cover_photo: {
      isString: {
        errorMessage: userMessages.IMG_URL_MUST_BE_STRING
      },
      optional: true,
      trim: true
    }
  })
)

export const followValidator = validate(
  checkSchema(
    {
      followed_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            // if (ObjectId.isValid(value)) {
            //   throw new ErrorWithStatus({
            //     message: 'Id invaid',
            //     status: httpStatus.NOT_FOUND
            //   })
            // }
            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: 'Id not found',
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const unFollowValidator = validate(
  checkSchema(
    {
      follow_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            // if (ObjectId.isValid(value)) {
            //   throw new ErrorWithStatus({
            //     message: 'Id invalid',
            //     status: httpStatus.NOT_FOUND
            //   })
            // }

            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })

            if (!followed_user) {
              throw new ErrorWithStatus({
                message: 'Id not found',
                status: httpStatus.NOT_FOUND
              })
            }
          }
        }
      }
    },
    ['params']
  )
)

export const verifyUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decode_authorization as TokenPayload
  console.log('verify', verify)

  if (verify !== UserVerifyStatus.Verified) {
    throw new ErrorWithStatus({ message: 'User not verify', status: httpStatus.FORBIDDEN })
  }
  next()
}
