import { Router } from "express";
import { UserController } from "../../controllers/api/users.js";

const router = Router();

// /users/...

// /users/me/
router.get('/me', UserController.getProfile);

// /users/me/groups
router.get('/me/groups', UserController.getGroups);


export default router;