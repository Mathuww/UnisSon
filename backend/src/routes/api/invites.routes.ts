import { Router } from "express";
import { InviteController } from "../../controllers/api/invite.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

// GET /:token : Infos sur le token (groupe, user qui invite)
router.get('/:token', authMiddleware, InviteController.tokenInfo);

// POST /:token : Accepter l'invitation concernée
router.post('/:token', authMiddleware, InviteController.join);

export default router;