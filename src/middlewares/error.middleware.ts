import { NextFunction, Request, Response } from "express";
import { httpStatus } from "~/constants/httpStatus";
import { ErrorWithStatus } from "~/models/Errors";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof ErrorWithStatus) {
        return res.status(err.status).json(err)
    }
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        message: err.message,
        errorInfo: err
    })
}