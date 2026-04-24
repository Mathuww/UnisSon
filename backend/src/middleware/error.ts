import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { logger } from "./logger.js"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    logger.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
}

export const asyncHandler = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};