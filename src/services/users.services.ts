import User from "~/models/schemas/users.schemas"
import databaseService from "./db.services"
import { UserRequestBody } from "~/models/requests/User.request"
import { hashPassword } from "~/utils/crypto";
import { signToken } from "~/utils/jwt";
import { TokenType } from "~/constants/enum";

class UserService {
    private signAccessToken = (user_id:string) => {
        return signToken({payload: {user_id, token_type: TokenType.AccessToken}, options: {expiresIn: '15m'}})
    }
    private signRefreshToken = (user_id:string) => {
        return signToken({payload: {user_id, token_type: TokenType.RefreshToken}, options: {expiresIn: '100d'}})
    }
    async register(payload: UserRequestBody) {
        const result = await databaseService.users.insertOne(new User({
            ...payload,
            password: hashPassword(payload.password)
        }))
        const user_id =result.insertedId.toString()
        // sync
        // const access_token = this.signAccessToken(user_id)
        // const refresh_token = this.signRefreshToken(user_id)

        //async
        const [access_token, refresh_token] = await Promise.all([
            this.signAccessToken(user_id),
            this.signRefreshToken(user_id)
        ])
        return {
            access_token,
            refresh_token
        }
    }

    async checkEmail(valueEmail: string) {
        const result = await databaseService.users.findOne({email: valueEmail})
        return Boolean(result)
    }
} 
const userService = new UserService()

 export default userService