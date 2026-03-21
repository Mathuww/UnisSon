import { Response, Router } from "express";
import pool from "../dbpool.js";
import { GroupStatus, User } from "../types.d.js";
import { authMiddleware } from "../middleware/auth.js";
import { findOrCreateTrack } from "../helpers/tracks.js";
import { checkGroupStatus } from "../helpers/groups.js";

const router = Router();

// /groups/... 

// /groups/
router.post('/', async (req, res) => {
    const groupName = req.body.groupName;
    if (!groupName)
        return res.status(400).json({error: "Missing group name from group create request"});

    const user : User = (req as any).user;

    let conn;
    try {
        conn = await pool.getConnection();

        await conn.beginTransaction();

        let result = await conn.query(
            "INSERT INTO Groups (name) VALUES (?)",
            [groupName]
        );

        const groupId = result.insertId;

        result = await conn.query(
            "INSERT INTO GroupsUsers (groupId, userId) VALUES (?, ?)",
            [groupId, user.id]
        );

        await conn.commit();

        res.json({groupId : Number(groupId)});
    } catch (error) {
        if (conn)
            conn.rollback();
        console.error("SQL error : ", error);
        res.status(500).json({error: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

// GET /groups/:id/members (liste des membres)
router.get('/:id/members', async (req, res) => {
    const user : User = (req as any).user;
    const groupId = req.params.id;

    if (!groupId)
        return res.status(400).json({error: "Missing group ID"});

    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT u.id, u.nickname
            FROM GroupsUsers gu 
            JOIN Users u ON gu.userID = u.id
            WHERE gu.groupID = ?`,
            [groupId]
        );

        // pas grave si rows.length = 0 ici,
        // ca veut juste dire que le groupe est vide
        res.json(rows);
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({error: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

// POST /groups/:id/members (ajt un membre)
router.post('/:id/members', async (req, res) => {
    const user : User = (req as any).user;
    const groupId = req.params.id;

    if (!groupId)
        return res.status(400).json({message: "Missing group ID to join"});

    let conn;
    try {
        conn = await pool.getConnection();

        const result = await conn.query(
            "INSERT INTO GroupsUsers (groupId, userId) VALUES (?, ?)",
            [groupId, user.id]
        );

        res.json({message: "User added to group"});
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({message: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

// GET /groups/:id/songs (musiques ajoutées cette semaine)
router.get('/:id/songs', async (req, res) => {
    const user : User = (req as any).user;
    const groupId = req.params.id;

    if (!groupId)
        return res.status(400).json({message: "Missing group ID to add song to"});

    let conn;
    try {
        conn = await pool.getConnection();

        const rows = await conn.query(
            `SELECT t.id, t.title, t.youtubeLink, gt.userID
            FROM Tracks t 
            JOIN GroupsPlaylists gt ON gt.trackID = t.id
            JOIN Groups g ON gt.groupID = g.id
            WHERE gt.groupID = ?
            AND gt.addedAt >= g.lastCycleChange`,
            [groupId]
        );
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({message: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

// POST /groups/:id/songs (ajtr une musique)
router.post('/:id/songs', async (req, res) => {
    const user : User = (req as any).user;
    const groupId = req.params.id;

    if (!groupId)
        return res.status(400).json({message: "Missing group ID to add song to"});

    /*
    const isrc = req.body.isrc;
    if (!isrc)
        return res.status(400).json({message: "Missing ISRC for song to add to group you can be do what you want to do"});
    */
    const title = req.body.title;
   // const artist = req.body.artist;
    const youtubeUrl = req.body.youtubeUrl;
    if (!title)// || !artist) 
        return res.status(400).json({message: "Missing song metadata from add request"});

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 0 : on est bien dans le bon état du groupe ?
        const groupStatus = await checkGroupStatus(conn, Number(groupId));
        if (groupStatus != GroupStatus.SUBMISSION) {
            return res.status(403).json({error: "This group is not in the right status for submission"});
        }

        // numer0bis : c'est pas l'élu qui est en train d'ajouter un morceau ?
        const chosenOneRows = await conn.query(
            "SELECT choosenOneUserID FROM Groups WHERE id = ?",
            [groupId]
        );
        if (chosenOneRows.length <= 0) {
            console.error(`Cant check for group chosen one : group ${groupId} doesnt exist in table`);
            return res.status(500).json({error: "Internal DB error, check server log"});
        }
        if (chosenOneRows[0].choosenOneUserID == user.id) {
            return res.status(403).json({error: "Chosen one cant add song for themself..."});
        }

        // 1 : le son existe-t-il dans Tracks ? si non, on le crée
        const trackId = await findOrCreateTrack(conn, "isrc", title, youtubeUrl);

        // 2 : on l'ajoute à GroupsPlaylists
        const result = await conn.query(
            "INSERT INTO GroupsPlaylists (groupID, userID, trackID, addedAt) VALUES (?, ?, ?, NOW())",
            [groupId, user.id, trackId]
        );

        res.json({message: "Track added to group", trackId: trackId});
    } catch (error) {
        console.error("SQL error : ", error);
        res.status(500).json({message: "Error while fetching data from DB"});
    } finally {
        if (conn)
            conn.release();
    }
});

export default router;