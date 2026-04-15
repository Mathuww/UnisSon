import { SpotifyAuthService } from "./spotify.service.js";

export class SearchService {
    static async search(query: string) {
        const spotifyToken = await SpotifyAuthService.getToken();

        
    }
}