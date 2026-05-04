import { Request, Response, Router } from "express";
import pool from "../../shared/db.js";
import { AuthService } from "../../service/auth.service.js";
import { authMiddleware } from "../../middleware/auth.js";
import { logger } from "../../middleware/logger.js";
import { asyncHandler } from "../../middleware/error.js";
import { create } from "node:domain";
import User from "../../models/elem/User.model.js";

export const AuthController = {
    googleLogin: asyncHandler( async (req: Request, res: Response) => {
        const { idToken, authCode }  = req.body;
        if (!idToken)
            return res.status(400).json({error: {message: "Missing ID token."}});

        const tokenResults = await AuthService.verifyGoogleToken(idToken);

        if (!tokenResults)
            return res.status(403).json({error: {message: "Cannot verify Google token"}});

        const { email, name, picture, googleId } = tokenResults;
        const nickname = name.slice(0, 16);

        const [user, created] = await User.findOrCreate({
                where: {
                    email: email
                },
                defaults: {
                    email: email,
                    nickname: nickname,
                    providerLoginID: googleId
                }
        });


        const response = await AuthService.exchangeServerAuthCode(authCode);
        if (!response || !response.tokens) {
            return res.status(500).json({error: {message: "Cannot exchange access token from auth code"}});
        }
        await user.update({
            accessToken: response.tokens.access_token,
            refreshToken: response.tokens.refresh_token,
            tokenExpireAt: response.tokens.expiry_date ? new Date(response.tokens.expiry_date) : null
        });

        const jwt = await AuthService.signToken({sub: user.id.toString()});

        if (created)
            return res.status(201).json({data: {token: jwt, user}});
        else 
            return res.status(200).json({data: {token: jwt, user}});

    }),
    checkToken: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        return res.status(200).json({data: user});
    })
}

