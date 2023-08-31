import express from 'express'
import { registerController } from '~/controllers/users.controllers'
import { checkValidateLogin, checkValidateRegistor } from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handler'

export const userRouter = express.Router()

// userRouter.post('/login', checkValidateLogin ,wrapAsync(loginController))
userRouter.post('/register', checkValidateRegistor ,wrapAsync(registerController))