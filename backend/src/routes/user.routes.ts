import express from "express";
import {
  deleteUser,
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/user.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// Admin/Manager routes
router.get("/", protect, authorize("admin", "manager"), getAllUsers);
router.delete("/:id", protect, authorize("admin"), deleteUser);

// Protected routes for all authenticated users
router.get("/:id", protect, getUserById);
router.put("/:id", protect, updateUser);

export default router;
