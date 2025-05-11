import express from "express";
import {
  createHandover,
  getAllHandovers,
  getHandoverById,
  updateHandover,
  deleteHandover,
  conductInterview,
  generateSummary,
} from "../controllers/handover.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// Admin/Manager routes
router.post("/", protect, authorize("admin", "manager"), createHandover);
router.delete("/:id", protect, authorize("admin"), deleteHandover);

// Routes for all authenticated users
router.get("/", protect, getAllHandovers);
router.get("/:id", protect, getHandoverById);
router.put("/:id", protect, updateHandover);

// Special handover-related routes
router.post("/:id/interview", protect, conductInterview);
router.post("/:id/summary", protect, generateSummary);

export default router;
