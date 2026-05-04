import { version } from "node:os";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Classe de service à laquelle on délègue
 * les calls API à YouTube 
 * (création d'une playlist, etc.)
 * 
 * On appelle les méthodes de cette classe
 * en ayant déjà en notre possession un OAuth2client,
 * donné par AuthService.
 *
 * @class
 */
export class YoutubeService {
    /**
     * (N'utilise pas l'OAuth2Client, mais l'API publie)
     * Renvoie les métadonnées de la vidéo dont l'ID est spécifié
     * @param videoId l'ID de la vidéo
     * @returns Titre et auteur ("artiste")
     */
    static async getPublicVideoInfo(videoId: string): Promise<{title: string, artist?: string}> {
        const url = `https://www.youtube.com/watch?v=${videoId}`;
        try {
            const response = await fetch(`
            https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json
            `);

            if (!response.ok) {
                return {title: "Titre inconnu"};
            }
            const data = await response.json();
            //console.log(data);
            return {
                title: data.title,
                artist: data.author_name
            };
        } catch {
            return {title: "Titre inconnu"};
        }
    }

    /**
     * Renvoie un client d'API YouTube
     * @param oclient Un client OAuth2
     * @returns Un client YouTube
     */
    static getYoutubeClient(oclient : OAuth2Client) {
        return google.youtube({
            auth: oclient,
            version: 'v3'
        });
    }

    /**
     * Ajoute une vidéo à une playlist de l'user.
     * @param playlistId L'ID de la playlist.
     * @param videoId L'ID de la vidéo.
     * @param oclient Le client ouath2
     * @returns La réponse de l'API
     */
    static async addVideo(playlistId : string, videoId : string, oclient : OAuth2Client) {
        const ytb = this.getYoutubeClient(oclient)

        try {
            const response = await ytb.playlistItems.insert({
                part: ["snippet"],
                requestBody: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: videoId
                        }
                    }
                }
            });
            return response;
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Crée une playlist.
     * @param title Le nom de la playlist
     * @param client Le client oauth2
     * @returns La réponse de l'API
     */
    static async addPlaylist(title: string, client: OAuth2Client) {
        const tokenInfo = await client.getTokenInfo(client.credentials.access_token ?? "");
        console.log(tokenInfo.scopes);
        console.log('credentials:', client.credentials);
        const yt = this.getYoutubeClient(client);
        const response = await yt.playlists.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: title,
                    description: 'Changer ça',
                },
                status: {
                    privacyStatus: 'private' 
                }
            }
        });
        return response;
    }

}