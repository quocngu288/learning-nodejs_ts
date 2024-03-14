import { JwtPayload } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'

export interface UserRequestBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}

export interface UpdateMeRequestBody {
  name?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  cover_photo?: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType,
  verify: UserVerifyStatus,
  exp: number
}
