import UserSchema from '~/models/schemas/users.schemas'
import databaseService from './db.services'
import { UpdateMeRequestBody, UserRequestBody } from '~/models/requests/User.request'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshTokenSchema from '~/models/schemas/refreshToken.schemas'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import { ErrorWithStatus } from '~/models/Errors'
import { userMessages } from '~/constants/messages'
import { httpStatus } from '~/constants/httpStatus'
import FollowSchema from '~/models/schemas/follow.schemas'

config()
class UserService {
  private signAccessToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: { user_id, token_type: TokenType.AccessToken, verify },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: { expiresIn: '15m' }
    })
  }

  private signRefreshToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: { user_id, token_type: TokenType.RefreshToken, verify },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: { expiresIn: '100d' }
    })
  }

  private signAccessAndRefreshToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }

  private signEmailVerifyToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: { user_id, token_type: TokenType.EmailVerifyToken, verify },
      privateKey: process.env.JWT_SECRET_VERIFY_EMAIL as string,
      options: { expiresIn: '7d' }
    })
  }

  private signForgotPasswordToken = ({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) => {
    return signToken({
      payload: { user_id, token_type: TokenType.ForgotPasswordToken, verify },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD as string,
      options: { expiresIn: '7d' }
    })
  }

  async register(payload: UserRequestBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new UserSchema({
        ...payload,
        username: `username-${user_id}`,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // sync
    // const access_token = this.signAccessToken(user_id)
    // const refresh_token = this.signRefreshToken(user_id)

    //async
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshTokenSchema({ token: refresh_token, user_id: new ObjectId(user_id) })
    )

    console.log('email_verify_token', email_verify_token)

    return {
      access_token,
      refresh_token
    }
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id,
      verify: verify
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshTokenSchema({ token: refresh_token, user_id: new ObjectId(user_id) })
    )
    return {
      access_token,
      refresh_token
    }
  }

  async checkEmail(valueEmail: string) {
    const result = await databaseService.users.findOne({ email: valueEmail })
    return Boolean(result)
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: 'Logout success'
    }
  }

  async verifyEmail(user_id: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify: UserVerifyStatus.Verified
    })
    return {
      message: 'Verified Success',
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    // gui lai email
    console.log('resend email verify', email_verify_token)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
    return {
      message: 'Resend Verified Success'
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )
    // => gửi email kèm đường link về user
    console.log('forgot_password_token', forgot_password_token)
    return {
      message: 'Check email to reset password'
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { password: hashPassword(password), forgot_password_token: '' }, $currentDate: { updated_at: true } }
    )
    return {
      message: 'reset password successfull'
    }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMe(user_id: string, body: UpdateMeRequestBody) {
    const _payload = body.date_of_birth ? { ...body, date_of_birth: new Date(body.date_of_birth) } : { ...body }
    const dataUpdateUser = await databaseService.users.findOneAndUpdate(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          ...(_payload as UpdateMeRequestBody & { date_of_birth?: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    console.log('dataUpdateUser', dataUpdateUser)

    return dataUpdateUser.value
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (!user) {
      throw new ErrorWithStatus({
        message: userMessages.USER_NOT_FOUND,
        status: httpStatus.NOT_FOUND
      })
    }
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follows.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    console.log('follow', follower)

    if (follower) {
      return {
        message: 'User is followed before'
      }
    }
    const follow = await databaseService.follows.insertOne(
      new FollowSchema({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
    console.log('follow', follow)
    return {
      message: 'Follow user successfull'
    }
  }

  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.follows.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })
    if (follower) {
      await databaseService.follows.deleteOne(
        new FollowSchema({
          user_id: new ObjectId(user_id),
          followed_user_id: new ObjectId(followed_user_id)
        })
      )
      return {
        message: 'Unfollow user successfull'
      }
    }
    return {
      message: 'User is not followed before'
    }
  }
}
const userService = new UserService()

export default userService
