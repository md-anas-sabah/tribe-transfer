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

router.post("/", protect, createKnowledge);
router.get("/", protect, getAllKnowledge);
router.get("/search", protect, searchKnowledge);
router.get("/:id", protect, getKnowledgeById);
router.put("/:id", protect, updateKnowledge);
router.delete("/:id", protect, deleteKnowledge);

export default router;
