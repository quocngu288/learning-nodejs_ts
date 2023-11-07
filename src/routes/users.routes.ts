import express from 'express'
import { emailVerifyController, loginController, logoutController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, checkValidateLogin, checkValidateRegistor, emailVerifyTokenValidator, refreshTokenValidator } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const userRouter = express.Router()

userRouter.post('/login', checkValidateLogin ,wrapAsync(loginController))
userRouter.post('/register', checkValidateRegistor ,wrapAsync(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator ,wrapAsync(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidator ,wrapAsync(emailVerifyController))