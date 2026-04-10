import { Router } from "express";
import { AuthController } from "../controllers/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// /auth/login
router.post('/login', AuthController.basicLogin);
// /auth/signup
router.post('/signup', AuthController.basicSignup);

// /auth/google
router.post('/google', AuthController.googleLogin);

// /auth/checktoken
router.post('/checktoken', authMiddleware, AuthController.checkToken);

export default router;