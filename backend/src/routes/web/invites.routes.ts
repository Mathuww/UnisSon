import { Router } from "express";
import { JoinController } from "../../controllers/web/join.js";

const router = Router();

// GET /join/ : il manque le token
router.get('/', JoinController.incomplete);
// GET /join/:token : ouvrir ou proposer d'installer l'appli. pour rejoindre
router.get('/:token', JoinController.join);

export default router;