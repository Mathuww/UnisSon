import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from "express";
import { logger } from "./logger.js"

/**
 * Intercepteur d'erreurs, 
 * middleware utilisé pour toute l'app
 * @param err l'erreur
 * @param req 
 * @param res 
 * @param next 
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    logger.error(err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
}

/**
 * Encapsule une fonction async en interceptant son exception,
 * ce qui permet l'écriture de contrôleurs moins verbeux sans try/catch.
 * @param fn la fonction qui peut lancer une exception
 * @returns 
 */
export const asyncHandler = (fn: RequestHandler) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};