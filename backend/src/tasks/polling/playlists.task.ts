import { logger } from "../../middleware/logger.js";
import Group from "../../models/elem/Group.model.js";
import User from "../../models/elem/User.model.js";
import GroupUser from "../../models/link/GroupUser.model.js";
import { AuthService } from "../../service/auth.service.js";
import { YoutubeService } from "../../service/youtube.service.js";

/**
 * Met à jour les playlists des users de tout un groupe
 * @param group le groupe
 */
export async function updateServicePlaylists(group: Group) {
    const entriesSinceLastCycle = await group.getEntriesSinceLastCycle();

    const users = await group.getUsers({
        joinTableAttributes: ['servicePlaylistID']
    }) as (User & { GroupUser: GroupUser })[];;

    for (const user of users) {
        if (user?.GroupUser.servicePlaylistID) {
            const client = await AuthService.getOAuthClient(user);
            if (client) {
                for (const entry of entriesSinceLastCycle) {
                    const ytResponse = await YoutubeService.addVideo(user.GroupUser.servicePlaylistID, entry.track.youtubeLink || "", client);
                    if (ytResponse && ytResponse.data) {
                        logger.info(`POLL] Added video ${entry.track.youtubeLink}`);
                    }
                }
            }
        }
    }
}
