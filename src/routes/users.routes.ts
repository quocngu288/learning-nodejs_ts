import express from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordValidatorController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  checkValidateLogin,
  checkValidateRegistor,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const userRouter = express.Router()

userRouter.post('/login', checkValidateLogin, wrapAsync(loginController))
userRouter.post('/register', checkValidateRegistor, wrapAsync(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
userRouter.post('/verify-email', emailVerifyTokenValidator, wrapAsync(emailVerifyController))
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))
userRouter.post('/verify-forgot-password', verifyForgotPasswordValidator, wrapAsync(verifyForgotPasswordController))
userRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordValidatorController))

userRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))
userRouter.patch('/me', accessTokenValidator, verifyUserValidator, wrapAsync(updateMeController))
