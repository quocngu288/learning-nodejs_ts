// mở rộng kiểu dữ liệu của REQUEST
import { Request } from "express";
import User from "./models/schemas/users.schemas";
declare module 'express' {
    interface Request {
        user?: User
    }
}