import { Response, Request, NextFunction } from "express";
import userService from "~/services/users.services";
import {ParamsDictionary} from 'express-serve-static-core'
import { TokenPayload, UserRequestBody } from "~/models/requests/User.request";
import UserSchema from "~/models/schemas/users.schemas";
import { ObjectId } from "mongodb";
import databaseService from "~/services/db.services";
import { httpStatus } from "~/constants/httpStatus";


export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserSchema
    const user_id = user._id as ObjectId
    const result = await userService.login(user_id.toString())
    res.json({
        message: 'Login Success',
        result
    })
}

/**
 * @description Validate Body
 * @Body {name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO-Date}
 */

export const registerController = async (req: Request<ParamsDictionary, any, UserRequestBody>, res: Response, next: NextFunction) => {
    const result = await userService.register(req.body)
    res.json({
        message: 'Register Success',
        result
    })
}

export const logoutController = async(req: Request, res: Response) => {
    const {refresh_token} = req.body
    const result = await userService.logout(refresh_token)
    return res.json(result)

}

export const emailVerifyController = async (req: Request, res: Response) => {
    const {user_id} = req.decode_email_verify_token as TokenPayload
    const user = await databaseService.users.findOne({_id: new ObjectId(user_id)})

    // nếu ko tìm thấy user => show error

    if(!user){
        return res.status(httpStatus.NOT_FOUND).json({
            message: "không tìm thất user"
        })
    }
}