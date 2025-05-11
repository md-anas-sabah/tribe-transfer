import express from "express";
import {
  createKnowledge,
  getAllKnowledge,
  getKnowledgeById,
  updateKnowledge,
  deleteKnowledge,
  searchKnowledge,
} from "../controllers/knowledge.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

// Search route should come before /:id to avoid conflicts
router.get("/search", protect, searchKnowledge);

// Regular CRUD routes
router.post("/", protect, createKnowledge);
router.get("/", protect, getAllKnowledge);
router.get("/:id", protect, getKnowledgeById);
router.put("/:id", protect, updateKnowledge);
router.delete("/:id", protect, deleteKnowledge);

export default router;
