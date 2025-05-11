"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = exports.conductInterview = exports.deleteHandover = exports.updateHandover = exports.getHandoverById = exports.getAllHandovers = exports.createHandover = void 0;
const handover_model_1 = __importDefault(require("../models/handover.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const ai_service_1 = require("../services/ai.service");
// @desc    Create a new handover
// @route   POST /api/handovers
// @access  Private (Admin, Manager)
const createHandover = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const { employee, exitDate, status, successor } = req.body;
        // Check if employee exists
        const employeeExists = await user_model_1.default.findById(employee);
        if (!employeeExists) {
            res.status(404).json({
                success: false,
                message: "Employee not found",
            });
            return;
        }
        // Check if successor exists if provided
        if (successor) {
            const successorExists = await user_model_1.default.findById(successor);
            if (!successorExists) {
                res.status(404).json({
                    success: false,
                    message: "Successor not found",
                });
                return;
            }
        }
        // Create handover
        const handover = await handover_model_1.default.create({
            employee,
            exitDate,
            status: status || "planned",
            successor,
        });
        res.status(201).json({
            success: true,
            data: handover,
        });
    }
    catch (error) {
        console.error("Create handover error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.createHandover = createHandover;
// @desc    Get all handovers
// @route   GET /api/handovers
// @access  Private
const getAllHandovers = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Add filtering capability
        const filter = {};
        // If status is provided in query
        if (req.query.status) {
            filter.status = req.query.status;
        }
        // If employee is provided in query
        if (req.query.employee) {
            filter.employee = req.query.employee;
        }
        const handovers = await handover_model_1.default.find(filter)
            .populate("employee", "name email position department")
            .populate("successor", "name email position department")
            .sort({ exitDate: 1 });
        res.status(200).json({
            success: true,
            count: handovers.length,
            data: handovers,
        });
    }
    catch (error) {
        console.error("Get all handovers error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getAllHandovers = getAllHandovers;
// @desc    Get a single handover
// @route   GET /api/handovers/:id
// @access  Private
const getHandoverById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const handover = await handover_model_1.default.findById(req.params.id)
            .populate("employee", "name email position department")
            .populate("successor", "name email position department")
            .populate("knowledgeItems.knowledge");
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: handover,
        });
    }
    catch (error) {
        console.error("Get handover error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getHandoverById = getHandoverById;
// @desc    Update a handover
// @route   PUT /api/handovers/:id
// @access  Private
const updateHandover = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Check if handover exists
        let handover = await handover_model_1.default.findById(req.params.id);
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found",
            });
            return;
        }
        // Update handover
        handover = await handover_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found after update",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: handover,
        });
    }
    catch (error) {
        console.error("Update handover error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updateHandover = updateHandover;
// @desc    Delete a handover
// @route   DELETE /api/handovers/:id
// @access  Private (Admin)
const deleteHandover = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const handover = await handover_model_1.default.findById(req.params.id);
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found",
            });
            return;
        }
        await handover.deleteOne();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        console.error("Delete handover error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.deleteHandover = deleteHandover;
// @desc    Conduct exit interview
// @route   POST /api/handovers/:id/interview
// @access  Private
const conductInterview = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const { transcript } = req.body;
        if (!transcript) {
            res.status(400).json({
                success: false,
                message: "Interview transcript is required",
            });
            return;
        }
        const handover = await handover_model_1.default.findById(req.params.id);
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found",
            });
            return;
        }
        // Update handover with transcript and interview date
        handover.interviewTranscript = transcript;
        handover.interviewDate = new Date();
        await handover.save();
        res.status(200).json({
            success: true,
            data: handover,
        });
    }
    catch (error) {
        console.error("Conduct interview error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.conductInterview = conductInterview;
// @desc    Generate summary from interview
// @route   POST /api/handovers/:id/summary
// @access  Private
const generateSummary = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const handover = await handover_model_1.default.findById(req.params.id);
        if (!handover) {
            res.status(404).json({
                success: false,
                message: "Handover not found",
            });
            return;
        }
        if (!handover.interviewTranscript) {
            res.status(400).json({
                success: false,
                message: "No interview transcript found. Conduct an interview first.",
            });
            return;
        }
        // Generate summary using AI service
        const summary = await (0, ai_service_1.generateKnowledgeSummary)(handover.interviewTranscript);
        // Update handover with summary
        handover.interviewSummary = summary;
        await handover.save();
        res.status(200).json({
            success: true,
            data: {
                summary,
                handover,
            },
        });
    }
    catch (error) {
        console.error("Generate summary error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.generateSummary = generateSummary;
