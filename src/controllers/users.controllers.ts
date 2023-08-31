import { Response, Request, NextFunction } from "express";
import userService from "~/services/users.services";
import {ParamsDictionary} from 'express-serve-static-core'
import { UserRequestBody } from "~/models/requests/User.request";


// export const loginController = async (req: Request<ParamsDictionary, any, Pick<UserRequestBody, "email" | "password">>, res: Response, next: NextFunction) => {
//     const result = await userService.login(req.body)
//     res.json({
//         message: 'Login Success',
//         result
//     })
// }

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