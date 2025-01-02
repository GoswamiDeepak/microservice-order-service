import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../../types";

export const canAccess = (roles: string[]) => {
    return (req:Request, res:Response, next:NextFunction) => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;

        if(!roles.includes(roleFromToken)){
            const err = createHttpError(403, "You don't have persmission!")
            return next(err)
        }
        next()
    }
}