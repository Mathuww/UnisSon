import { TimeManager } from "../shared/TimeManager.js";

export class SpotifyAuthService {
    static token: string | null = null;
    static expiresAt: number = 0;

    static async getToken() {
        const now = TimeManager.now();

        if (this.token && now.getTime() < this.expiresAt) {
            return this.token;
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
            'Authorization': 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        this.token = data.access_token;
        this.expiresAt = now.getTime() + (data.expires_in - 60) * 1000;
        return this.token;
    }
}