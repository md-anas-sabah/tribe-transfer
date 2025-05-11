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

router.post("/analyze", protect, authorize("admin", "manager"), analyzeSpof);
router.get("/", protect, getAllSpofs);
router.get("/:id", protect, getSpofById);
router.put("/:id", protect, updateSpof);
router.delete("/:id", protect, authorize("admin"), deleteSpof);

export default router;
