import { Router } from "express";
import { UserController } from "../../controllers/api/users.js";

const router = Router();

// /users/...

// GET /users/me/ : Profil
router.get('/me', UserController.getProfile);

// GET /users/me/groups : Groupes auxquels l'user appartient
router.get('/me/groups', UserController.getGroups);


export default router;