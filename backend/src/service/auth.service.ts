import { Credentials, OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { logger } from "../middleware/logger.js";
import { cli } from "winston/lib/winston/config/index.js";
import User from "../models/elem/User.model.js";

export class AuthService {
    static client = new OAuth2Client({
        client_id: process.env.GOOGLE_WEB_CLIENT_ID, 
        client_secret: process.env.GOOGLE_WEB_CLIENT_SECRET
    });

    static async getOAuthClient(user: User): Promise<OAuth2Client> {
        const client = new OAuth2Client(
            process.env.GOOGLE_WEB_CLIENT_ID,
            process.env.GOOGLE_WEB_CLIENT_SECRET
        );

        client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken,
            expiry_date: user.tokenExpireAt?.getTime()
        });

        // normalement c'est pas nécéssaire, mais je suis parano
        client.on('tokens', async (tokens: Credentials) => {
            logger.info(`updating credientals for google client on user ${user.id}`);
            await user.update({
                accessToken: tokens.access_token,
                tokenExpireAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
            });
        });

        if (!user.tokenExpireAt || user.tokenExpireAt <= new Date()) {
            const { credentials } = await client.refreshAccessToken();
            await user.update({
                accessToken: credentials.access_token,
                tokenExpireAt: credentials.expiry_date ? new Date(credentials.expiry_date) : null
            });
            client.setCredentials(credentials);
        }

        return client;
    }

    static signToken(payload: JwtPayload) {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET as Secret,
            { expiresIn: '7d' }
        );
    }

    static async verifyGoogleToken(idToken: string) {
        const ticket = await AuthService.client.verifyIdToken({
            idToken,
            audience: [
                process.env.GOOGLE_WEB_CLIENT_ID || "",
                process.env.GOOGLE_AND_CLIENT_ID || "",
                process.env.GOOGLE_IOS_CLIENT_ID || ""
            ],
        });

        const payload = ticket.getPayload();
        if (!payload) {
            logger.error("could not extract payload from google ticket");
            return null;
        }

        logger.info({
            aud: payload.aud,
            iss: payload.iss,
            exp: payload.exp,
        });
        const { email, name, picture, sub: googleId } = payload;

        if (!email || !googleId || !name) {
            logger.error("could not retrieve data from payload");
            return null;
        }

        return { email, name, picture, googleId };
    }

    static async exchangeServerAuthCode(serverAuthCode : string) {
        try {
            return await AuthService.client.getToken(serverAuthCode);
        } catch (error) {
            logger.error(error);
        }
    }

}