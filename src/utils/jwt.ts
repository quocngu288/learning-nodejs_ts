import jwt, { SignOptions } from "jsonwebtoken";
import { config } from 'dotenv'
import { ErrorWithStatus } from "~/models/Errors";
import { httpStatus } from "~/constants/httpStatus";

config()

//note: trường họp params nhiều có thể nghĩ đến việc xử dụng object
interface ParamsSignToken {
    payload: string | Buffer | object
    privateKey: string
    options?: SignOptions
}

interface ParamsVerifyToken {
    token: string
    secretOrPublicKey: string
}


export const signToken = ({payload, privateKey, options = {algorithm: 'HS256'}}: ParamsSignToken) => {
    return new Promise<string>((resolve,reject) => {
        jwt.sign(payload, privateKey, options, (error, token) => {
            if(error) {
              throw reject(error)
            }
            return resolve(token as string)
        })
    })
}

export const verifyToken = ({token, secretOrPublicKey}: ParamsVerifyToken) => {
    return new Promise<jwt.JwtPayload>((resolve, reject) => {
        jwt.verify(token, secretOrPublicKey, (error, decode) => {
            if(error) {
                throw reject(new ErrorWithStatus({message: "Refesh token ko đúng định dạng", status: httpStatus.UNAUTHORIZED}))
            }
            resolve(decode as jwt.JwtPayload)
        })
    })
}