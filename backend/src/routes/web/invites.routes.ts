import { Router } from "express";
import { JoinController } from "../../controllers/web/join.js";

const router = Router();

router.get('/', JoinController.incomplete);
router.get('/:token', JoinController.join);

export default router;