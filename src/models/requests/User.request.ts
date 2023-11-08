import { JwtPayload } from "jsonwebtoken"
import { TokenType } from "~/constants/enum"

export interface UserRequestBody {
    name: string,
    email: string,
    password: string,
    confirm_password: string
    date_of_birth: Date
}

export interface TokenPayload extends JwtPayload {
    user_id: string
    token_type: TokenType
}