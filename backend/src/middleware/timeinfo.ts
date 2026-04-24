import { RequestHandler } from "express";
import { TimeManager } from "../shared/TimeManager.js";

export const timeInfoMiddleware: RequestHandler = (req, res, next) => {
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