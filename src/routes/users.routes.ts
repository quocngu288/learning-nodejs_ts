import express from 'express'
import { registerController } from '~/controllers/users.controllers'

export const userRouter = express.Router()

userRouter.post('/register', registerController)

userRouter.use('/users', userRouter)