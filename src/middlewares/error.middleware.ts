import { NextFunction, Request, Response } from "express";
import { httpStatus } from "~/constants/httpStatus";

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.log('err', err);
    res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(err)
}