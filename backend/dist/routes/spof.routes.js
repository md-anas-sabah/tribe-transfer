"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const spof_controller_1 = require("../controllers/spof.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Admin/Manager routes
router.post("/analyze", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin", "manager"), spof_controller_1.analyzeSpof);
router.delete("/:id", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin"), spof_controller_1.deleteSpof);
// Routes for all authenticated users
router.get("/", auth_middleware_1.protect, spof_controller_1.getAllSpofs);
router.get("/:id", auth_middleware_1.protect, spof_controller_1.getSpofById);
router.put("/:id", auth_middleware_1.protect, spof_controller_1.updateSpof);
exports.default = router;
