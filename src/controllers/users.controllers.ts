import { Response, Request } from "express";
import User from "~/models/schemas/users.schemas";
import databaseService from "~/services/db.services";

export const registerController = (req: Request, res: Response) => {
    const {name, password} = req.body
    try {

    } catch (error) {
        
    }
    databaseService.users.insertOne(new User({
        name,
        password
    }))
}