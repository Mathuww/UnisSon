import { Router } from "express";
import { UserController } from "../controllers/users.js";

const router = Router();

// /users/...

// /users/me/groups
router.get('/me/groups', UserController.getGroups);


export default router;