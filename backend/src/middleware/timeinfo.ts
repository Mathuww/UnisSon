import { RequestHandler } from "express";
import { TimeManager } from "../shared/TimeManager.js";

/**
 * Middleware qui enrichit les réponses du backend d'une propriété "meta",
 * qui comprend notamment le temps fictif utilisé côté serveur.
 * @param req 
 * @param res 
 * @param next 
 */
export const timeInfoMiddleware: RequestHandler = (req, res, next) => {
    // Réécriture de .json(....) pour ajouter les métadonnées
    const originalJson = res.json;

    res.json = function (body: any) {
        const enrichedBody = {
            ...body,
            meta: {
                timestamp: new Date().toISOString(),
                path: req.path,
                simulationTime: TimeManager.now().toISOString()
            }
        };

        return originalJson.call(this, enrichedBody);
    };

    next();
}