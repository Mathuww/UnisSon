import { NextFunction, RequestHandler } from "express";
import winston from "winston";

export const logger = winston.createLogger({
    level: 'info', // niveau minimal : 'info', 'warn', 'error', 'debug'
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(), 
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

export const loggerMiddleware: RequestHandler = (req, res, next) => {
    logger.info(`[REQ] Visited : ${req.method} ${req.url}`);
    next();
}