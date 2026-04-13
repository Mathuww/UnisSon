import { Request, Response, Router } from "express";
import pool from "../shared/db.js";
import { AuthService } from "../service/auth.service.js";
import { authMiddleware } from "../middleware/auth.js";
import { logger } from "../middleware/logger.js";
import { asyncHandler } from "../middleware/error.js";
import { create } from "node:domain";
import User from "../models/elem/User.model.js";

export const AuthController = {
    basicLogin: asyncHandler( async (req: Request, res: Response) => {
        if (!process.env.DEV_MODE)
            return res.status(403);

        const { nickname } = req.body;

        if (!nickname)
            return res.status(400).json({message: "Nickname missing from login request"});

        const user = await User.findOne({ where: { nickname: nickname }});

        if (user) 
            res.json({id: user.id});
        else 
            res.status(404).json({error: "User not found"});
    }),
    basicSignup: asyncHandler( async (req: Request, res: Response) => {
        if (!process.env.DEV_MODE)
            return res.status(403);

        const { nickname, email } = req.body;

        if (!nickname || !email)
            return res.status(400).json({message: "Nickname/mail missing from signup request"});

        const user = await User.create({nickname, email});

        res.json(user);
    }),
    googleLogin: asyncHandler( async (req: Request, res: Response) => {
        const { idToken }  = req.body;
        if (!idToken)
            return res.status(400).json({message: "Missing ID token"});

        const tokenResults = await AuthService.verifyGoogleToken(idToken); 

        if (!tokenResults)
            return res.status(403).json({message: "Cannot verify Google token"});

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

        if (created)
            return res.status(201).json({message: "User signed up", user: user});
        else 
            return res.status(200).json({message: "User logged in (already in DB)", user: user});

    }),
    checkToken: asyncHandler( async (req: Request, res: Response) => {
        const user : User = (req as any).user;
        return res.status(200).json({message: "JWT valid", user: user});
    })
}

