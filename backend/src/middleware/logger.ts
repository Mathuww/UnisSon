import { NextFunction, RequestHandler } from "express";

export const logger: RequestHandler = (req, res, next) => {
    console.log(`[LOG TEST] Visited : ${req.method} ${req.url}`);
    next();
}