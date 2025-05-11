"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handover_controller_1 = require("../controllers/handover.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Admin/Manager routes
router.post("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin", "manager"), handover_controller_1.createHandover);
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin"), handover_controller_1.deleteHandover);
// Routes for all authenticated users
router.get("/", auth_middleware_1.protect, handover_controller_1.getAllHandovers);
router.get("/:id", auth_middleware_1.protect, handover_controller_1.getHandoverById);
router.put("/:id", auth_middleware_1.protect, handover_controller_1.updateHandover);
// Special handover-related routes
router.post("/:id/interview", auth_middleware_1.protect, handover_controller_1.conductInterview);
router.post("/:id/summary", auth_middleware_1.protect, handover_controller_1.generateSummary);
exports.default = router;
