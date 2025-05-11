import express from "express";
import {
  analyzeSpof,
  getAllSpofs,
  getSpofById,
  updateSpof,
  deleteSpof,
} from "../controllers/spof.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// Admin/Manager routes
router.post("/analyze", protect, authorize("admin", "manager"), analyzeSpof);
router.delete("/:id", protect, authorize("admin"), deleteSpof);

// Routes for all authenticated users
router.get("/", protect, getAllSpofs);
router.get("/:id", protect, getSpofById);
router.put("/:id", protect, updateSpof);

export default router;
