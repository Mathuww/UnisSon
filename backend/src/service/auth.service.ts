import { OAuth2Client } from "google-auth-library";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { logger } from "../middleware/logger.js";

export class AuthService {
    static client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
}