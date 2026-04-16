import { Request, Response, Router } from "express";
import pool from "../../shared/db.js";
import { AuthService } from "../../service/auth.service.js";
import { authMiddleware } from "../../middleware/auth.js";
import { logger } from "../../middleware/logger.js";
import { asyncHandler } from "../../middleware/error.js";
import { create } from "node:domain";
import User from "../../models/elem/User.model.js";

export const AuthController = {
    basicLogin: asyncHandler( async (req: Request, res: Response) => {
        if (!process.env.DEV_MODE)
            return res.status(403).json({error: {message: "Not in dev mode"}});

        const { nickname } = req.body;

        if (!nickname)
            return res.status(400).json({error: {message: "Nickname missing from login request"}});

        const user = await User.findOne({ where: { nickname: nickname }});

        if (user) 
            res.status(200).json({data: user});
        else 
            res.status(404).json({error: {message: "User not found"}});
    }),
    basicSignup: asyncHandler( async (req: Request, res: Response) => {
        if (!process.env.DEV_MODE)
            return res.status(403).json({error: {message: "Not in dev mode"}});

        const { nickname, email } = req.body;

        if (!nickname || !email)
            return res.status(400).json({error: {message: "Nickname/mail missing from signup request"}});

        const user = await User.create({nickname, email});

        res.json({data: user});
    }),
    googleLogin: asyncHandler( async (req: Request, res: Response) => {
        const { idToken }  = req.body;
        if (!idToken)
            return res.status(400).json({error: {message: "Missing ID token"}});

        const tokenResults = await AuthService.verifyGoogleToken(idToken); 

        if (!tokenResults)
            return res.status(403).json({error: {message: "Cannot verify Google token"}});

        const { email, name, picture, googleId } = tokenResults;

        const [user, created] = await User.findOrCreate({
                where: {
                    email: email
                },
                defaults: {
                    email: email,
                    nickname: name,
                    providerLoginID: googleId
                }
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

