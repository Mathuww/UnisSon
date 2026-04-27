import { NextFunction, RequestHandler } from "express";
import winston from "winston";

export const logger = winston.createLogger({
    level: 'debug', // niveau minimal : 'info', 'warn', 'error', 'debug'
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint({
            colorize: true,
            depth: 3
        }),
    ),
    transports: [
        new winston.transports.Console(), 
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

export const loggerMiddleware: RequestHandler = (req, res, next) => {
    logger.info(`[REQ] Visited : ${req.method} ${req.url}`);
    logger.info('Request params : ', req.params);
    logger.info('Auth headers :', req.headers['authorization']);
    if (req.body) {
        logger.info('Body : ', req.body);
    }
    const oldJson = res.json;

    const logResponse = (body: any) => {
        logger.info({
            message: "[RES] Sending HTTP response",
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            body
        });
    };

    res.json = function (body) {
        logResponse(body);
        return oldJson.call(this, body);
    };

    next();
}