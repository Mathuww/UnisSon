import { Router } from "express";
import { InviteController } from "../../controllers/api/invite.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

router.get('/:token', authMiddleware, InviteController.tokenInfo);
router.post('/:token', authMiddleware, InviteController.join);

export default router;