import jwt, { SignOptions } from "jsonwebtoken";


//note: trường họp params nhiều có thể nghĩ đến việc xử dụng object
interface ParamsSignToken {
    payload: string | Buffer | object
    privateKey?: string
    options?: SignOptions
}


export const signToken = ({payload, privateKey = process.env.JWT_SECRET as string, options = {algorithm: 'HS256'}}: ParamsSignToken) => {
    return new Promise<string>((resolve,reject) => {
        jwt.sign(payload, privateKey, options, (error, token) => {
            if(error) {
              throw reject(error)
            }
            return resolve(token as string)
        })
    })
}
