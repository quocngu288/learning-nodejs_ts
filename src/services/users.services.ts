import UserSchema from "~/models/schemas/users.schemas"
import databaseService from "./db.services"
import { UserRequestBody } from "~/models/requests/User.request"
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enum";
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

    async register(payload: UserRequestBody) {
        const result = await databaseService.users.insertOne(new UserSchema({
            ...payload,
            password: hashPassword(payload.password)
        }))
        const user_id =result.insertedId.toString()
        // sync
        // const access_token = this.signAccessToken(user_id)
        // const refresh_token = this.signRefreshToken(user_id)

        //async
        const [access_token, refresh_token] = await this.signAccessAndRefreshToken(user_id)
        await databaseService.refreshTokens.insertOne(new RefreshTokenSchema({token: refresh_token, user_id: new ObjectId(user_id)}))
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
} 
const userService = new UserService()

 export default userService