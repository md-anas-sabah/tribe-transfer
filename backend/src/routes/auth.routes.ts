import express from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Register and login routes (public)
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/logout", logout);
router.get("/me", protect, getMe);

export default router;
