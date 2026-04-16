import { Router } from "express";
import { InviteController } from "../../controllers/api/invite.js";

const router = Router();

router.post('/:token', InviteController.join);

export default router;