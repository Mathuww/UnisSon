import { Router } from "express";
import { AuthController } from "../../controllers/api/auth.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = Router();

// POST /auth/google : Auth. GOOGLE
router.post('/google', AuthController.googleLogin);

// POST /auth/checktoken : Vérifier un token
router.post('/checktoken', authMiddleware, AuthController.checkToken);

export default router;