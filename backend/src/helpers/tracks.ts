import { PoolConnection } from "mariadb/*";

export async function findOrCreateTrack(conn: PoolConnection, isrc: string, title: string, youtubeUrl: string, artist?: string) {
    const rows = await conn.query(
        "SELECT id FROM Tracks WHERE isrc = ? LIMIT 1",
        [isrc]
    );

    if (rows.length > 0) {
        return rows[0].id;
    } else {
        const result = await conn.query(
            "INSERT INTO Tracks (isrc, title, artist, youtubeLink) VALUES (?, ?, ?, ?)",
            [isrc, title, artist, youtubeUrl]
        );
        // PLUS TARD backgroundYoutubeMatch(isrc);
        return Number(result.insertId); 
    }
}
