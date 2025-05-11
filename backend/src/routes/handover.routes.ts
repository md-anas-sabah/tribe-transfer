import express from "express";

import { protect, authorize } from "../middleware/auth.middleware";
import {
  conductInterview,
  createHandover,
  deleteHandover,
  generateSummary,
  getAllHandovers,
  getHandoverById,
  updateHandover,
} from "../controllers/handover.controller";

const router = express.Router();

router.post("/", protect, authorize("admin", "manager"), createHandover);
router.get("/", protect, getAllHandovers);
router.get("/:id", protect, getHandoverById);
router.put("/:id", protect, updateHandover);
router.delete("/:id", protect, authorize("admin"), deleteHandover);
router.post("/:id/interview", protect, conductInterview);
router.post("/:id/summary", protect, generateSummary);

export default router;
