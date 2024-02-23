import { Response, Request, NextFunction } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload, UserRequestBody } from '~/models/requests/User.request'
import UserSchema from '~/models/schemas/users.schemas'
import { ObjectId } from 'mongodb'
import databaseService from '~/services/db.services'
import { httpStatus } from '~/constants/httpStatus'
import { userMessages } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enum'

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as UserSchema
  const user_id = user._id as ObjectId
  const result = await userService.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: 'Login Success',
    result
  })
}

/**
 * @description Validate Body
 * @Body {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO-Date}
 */

export const registerController = async (
  req: Request<ParamsDictionary, any, UserRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await userService.register(req.body)
  res.json({
    message: 'Register Success',
    result
  })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  return res.json(result)
}

export const emailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  // nếu ko tìm thấy user => show error

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  if (user.email_verify_token === '') {
    return res.status(httpStatus.OK).json({
      message: userMessages.EMAIL_VERIFIED_BEFORE
    })
  }
  const rs = await userService.verifyEmail(user_id)
  return res.json({
    message: 'Verify success',
    rs
  })
}
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  // nếu ko tìm thấy user => show error

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({
      message: userMessages.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(httpStatus.OK).json({
      message: userMessages.EMAIL_VERIFIED_BEFORE
    })
  }
  const rs = await userService.resendVerifyEmail(user_id)
  return res.json(rs)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { _id, verify } = req.user as UserSchema
  const rs = await userService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(rs)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  return res.json({
    message: 'verify forgot password success'
  })
}

export const resetPasswordValidatorController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { password } = req.body
  const rs = await userService.resetPassword(user_id, password)
  res.json(rs)
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const rs = await userService.getMe(user_id)
  return res.json({
    message: 'get me successfull',
    rs
  })
}

export const updateMeController = async (req: Request, res: Response) => {
  const {user_id} = req.decode_authorization as TokenPayload
  const rs = await userService.updateMe(user_id, req.body)
  return res.json({
    message: 'Verify Success',
    rs
  })
}
export const getProfile = async (req: Request, res: Response) => {
  const {username} = req.params
  const rs = await userService.getProfile(username)
  return res.json({
    message: 'Get Profile Successfull',
    rs
  })
}