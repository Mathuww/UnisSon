export class YoutubeService {

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