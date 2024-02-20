import UserSchema from "~/models/schemas/users.schemas"
import databaseService from "./db.services"
import { UserRequestBody } from "~/models/requests/User.request"
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType, UserVerifyStatus } from "~/constants/enum";
import RefreshTokenSchema from "~/models/schemas/refreshToken.schemas";
import { ObjectId } from "mongodb";
import { config } from 'dotenv'

config()
class UserService {
    private signAccessToken = (user_id:string) => {
        return signToken({
            payload: {user_id, token_type: TokenType.AccessToken},
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
            options: {expiresIn: '15m'}})
    }

    private signRefreshToken = (user_id:string) => {
        return signToken({
            payload: {user_id, token_type: TokenType.RefreshToken},
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
            options: {expiresIn: '100d'}})
    }

    private signAccessAndRefreshToken = (user_id: string) => {
        return Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
        ])
    }

    private signEmailVerifyToken = (user_id:string) => {
        return signToken({
            payload: {user_id, token_type: TokenType.EmailVerifyToken},
            privateKey: process.env.JWT_SECRET_VERIFY_EMAIL as string,
            options: {expiresIn: '7d'}})
    }

    async register(payload: UserRequestBody) {
        const user_id = new ObjectId()
        const email_verify_token = await this.signEmailVerifyToken(user_id.toString())
        await databaseService.users.insertOne(new UserSchema({
            ...payload,
            _id: user_id,
            email_verify_token,
            date_of_birth: new Date(payload.date_of_birth),
            password: hashPassword(payload.password),
    
        }))
        // sync
        // const access_token = this.signAccessToken(user_id)
        // const refresh_token = this.signRefreshToken(user_id)

        //async
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id.toString())
        await databaseService.refreshTokens.insertOne(new RefreshTokenSchema({token: refresh_token, user_id: new ObjectId(user_id)}))
        
        console.log('email_verify_token', email_verify_token);
        
        return {
            access_token,
            refresh_token
        }
    }

    async login(user_id: string) {
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        await databaseService.refreshTokens.insertOne(new RefreshTokenSchema({token: refresh_token, user_id: new ObjectId(user_id)}))
        return {
            access_token,
            refresh_token
        }
    }

    async checkEmail(valueEmail: string) {
        const result = await databaseService.users.findOne({email: valueEmail})
        return Boolean(result)
    }

    async logout(refresh_token: string) {
        await databaseService.refreshTokens.deleteOne({token: refresh_token})
        return {
            message: "Logout success"
        }
    }

    async verifyEmail(user_id: string) {
        await databaseService.users.updateOne(
            {_id: new ObjectId(user_id)},
            {
                $set:{
                    email_verify_token: '',
                    verify: UserVerifyStatus.Verified,

                },
                $currentDate: {
                    updated_at: true
                }
            })
            const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        return {
            message: "Verified Success",
            access_token,
            refresh_token
        }
    }

    async resendVerifyEmail (user_id: string) {
        const email_verify_token = await this.signEmailVerifyToken(user_id)
        // gui lai email
        console.log('resend email verify', email_verify_token);
        await databaseService.users.updateOne({_id: new ObjectId(user_id)}, {$set: {email_verify_token}, $currentDate: {updated_at: true}})
        return {
            message: "Resend Verified Success",
        }
    }
} 
const userService = new UserService()

 export default userService