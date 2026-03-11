import { Response, Router } from "express";
import pool from "../dbpool.js";
import { AuthenticatedRequest } from "../types.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// /users/...



export default router;