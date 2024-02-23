import express from 'express'
import {
  emailVerifyController,
  forgotPasswordController,
  getMeController,
  getProfile,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordValidatorController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterBodyMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  checkValidateLogin,
  checkValidateRegistor,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyForgotPasswordValidator,
  verifyUserValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeRequestBody, UserRequestBody } from '~/models/requests/User.request'
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
userRouter.patch('/me',
                accessTokenValidator,
                verifyUserValidator,
                filterBodyMiddleware<UpdateMeRequestBody>(['name', 'avatar', 'bio', 'username', 'website', 'location','date_of_birth', 'cover_photo']),
                updateMeValidator,
                wrapAsync(updateMeController))
userRouter.get('/:username', wrapAsync(getProfile))