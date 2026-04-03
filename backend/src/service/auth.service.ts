import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt, { Secret } from 'jsonwebtoken'; 
import { UserRepository } from "../repository/users.repository.js";
import pool from "../dbpool.js";
import { logger } from "../middleware/logger.js";

export class AuthService {
    static client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    static async verifyGoogleToken (req: Request, res: Response) {
        let conn;
        try {
            const { idToken } = req.body;

            if (!idToken) {
                return res.status(400).json({ message: "idToken missing" });
            }

            const ticket = await AuthService.client.verifyIdToken({
                idToken,
                audience: [
                    process.env.GOOGLE_WEB_CLIENT_ID || "",
                    process.env.GOOGLE_AND_CLIENT_ID || "",
                    process.env.GOOGLE_IOS_CLIENT_ID || ""
                ],
            });

            const payload = ticket.getPayload();
            if (!payload) 
                return res.status(500).json({ message: "could not extract payload from google ticket" });
            logger.info({
                aud: payload.aud,
                iss: payload.iss,
                exp: payload.exp,
            });
            const { email, name, picture, sub: googleId } = payload;

            if (!email || !googleId || !name)
                return res.status(500).json({ message : "could not retrieve data from payload"});

            // 3. Logique de Base de Données (Exemple pseudo-code)
        
            conn = await pool.getConnection();
            await conn.beginTransaction();

            let userId = await UserRepository.findUserByEmail(conn, email);

            if (!userId) {
                logger.info("User not existing in DB, creating user...");
                userId = await UserRepository.createUser(
                    conn,
                    email,
                    name,
                    googleId
                );
            }

            await conn.commit(); 
            
            const appToken = jwt.sign(
                { sub: userId }, 
                process.env.JWT_SECRET as Secret, 
                { expiresIn: '7d' } 
            );

            res.status(200).json({
                message: "Google auth success",
                token: appToken,
                userId: userId
            });
        } catch (error) {
            conn?.rollback();
            logger.error("Google auth error : ", error);
            res.status(401).json({ message: "invalid or expired Google token" });
        } finally {
            conn?.release();
        }
    }
}