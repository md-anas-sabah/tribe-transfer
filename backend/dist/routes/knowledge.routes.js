"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const knowledge_controller_1 = require("../controllers/knowledge.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Search route should come before /:id to avoid conflicts
router.get("/search", auth_middleware_1.protect, knowledge_controller_1.searchKnowledge);
// Regular CRUD routes
router.post("/", auth_middleware_1.protect, knowledge_controller_1.createKnowledge);
router.get("/", auth_middleware_1.protect, knowledge_controller_1.getAllKnowledge);
router.get("/:id", auth_middleware_1.protect, knowledge_controller_1.getKnowledgeById);
router.put("/:id", auth_middleware_1.protect, knowledge_controller_1.updateKnowledge);
router.delete("/:id", auth_middleware_1.protect, knowledge_controller_1.deleteKnowledge);
exports.default = router;
