import { version } from "node:os";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

export class YoutubeService {
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

    static getYoutubeClient(oclient : OAuth2Client) {
        return google.youtube({
            auth: oclient,
            version: 'v3'
        });
    }

    static async addVideoTemp(playlistId : string, videoId : string, oclient : OAuth2Client) {
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

    static async addVideo(playlistId : string, videoId : string, access_token : string) {
        const body = {
            snippet: {
                playlistId: playlistId,
                resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId
                }
            }
        };
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/playlistItems', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(body)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`Erreur addVideo : ${data.error.message}`);
            }
            return data;
        } catch (error) {
            console.error(error) 
        }
    }

    static async addPlaylistTemp(title: string, client: OAuth2Client) {
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

    static async addPlaylist(title : string, access_token : string) {
        const body = {
            snippet : {
                title : title,
                description : "UnisSon playlist",
                status : {
                    privacyStatus : "private"
                }
            }
        };
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/playlists', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                body : JSON.stringify(body)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(`Erreur addPlaylists : ${data.error.message}`);
            }
            return data;
        } catch (error) {
            console.error(error)
        }
    }
}