"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpof = exports.updateSpof = exports.getSpofById = exports.getAllSpofs = exports.analyzeSpof = void 0;
const spof_model_1 = __importDefault(require("../models/spof.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const knowledge_model_1 = __importDefault(require("../models/knowledge.model"));
const ai_service_1 = require("../services/ai.service");
// @desc    Analyze and create SPOF entries
// @route   POST /api/spof/analyze
// @access  Private (Admin, Manager)
const analyzeSpof = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Get all users
        const users = await user_model_1.default.find({ isActive: true });
        // Get all knowledge items
        const knowledgeItems = await knowledge_model_1.default.find()
            .populate("owner", "name email department position")
            .populate("contributors", "name email department position");
        // Group knowledge by user
        const knowledgeByUser = users.map((user) => {
            // Filter knowledge items owned by this user
            const ownedKnowledge = knowledgeItems.filter((item) => item.owner._id.toString() === user._id.toString());
            // Filter knowledge items where user is a contributor
            const contributedKnowledge = knowledgeItems.filter((item) => item.contributors.some((contributor) => contributor._id.toString() === user._id.toString()));
            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    department: user.department,
                    position: user.position,
                },
                ownedKnowledge,
                contributedKnowledge,
            };
        });
        // Use AI to detect SPOFs
        const spofAnalysis = await (0, ai_service_1.detectSpofs)(knowledgeByUser);
        // Store SPOF analysis for each user
        const spofResults = [];
        for (const analysis of spofAnalysis) {
            // Check if SPOF already exists for this user
            let spof = await spof_model_1.default.findOne({ employee: analysis.userId });
            if (spof) {
                // Update existing SPOF
                spof.knowledgeAreas = analysis.knowledgeAreas;
                spof.riskScore = analysis.riskScore;
                spof.backupPeople = analysis.backupPeople;
                spof.lastUpdated = new Date();
                await spof.save();
            }
            else {
                // Create new SPOF
                spof = await spof_model_1.default.create({
                    employee: analysis.userId,
                    knowledgeAreas: analysis.knowledgeAreas,
                    riskScore: analysis.riskScore,
                    backupPeople: analysis.backupPeople,
                    autoDetected: true,
                    lastUpdated: new Date(),
                });
            }
            spofResults.push(spof);
        }
        res.status(200).json({
            success: true,
            count: spofResults.length,
            data: spofResults,
        });
    }
    catch (error) {
        console.error("Analyze SPOF error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.analyzeSpof = analyzeSpof;
// @desc    Get all SPOFs
// @route   GET /api/spof
// @access  Private
const getAllSpofs = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const spofs = await spof_model_1.default.find()
            .populate("employee", "name email department position")
            .populate("backupPeople.user", "name email department position")
            .populate("knowledgeAreas.relatedItems")
            .sort({ riskScore: -1 });
        res.status(200).json({
            success: true,
            count: spofs.length,
            data: spofs,
        });
    }
    catch (error) {
        console.error("Get all SPOFs error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getAllSpofs = getAllSpofs;
// @desc    Get a single SPOF
// @route   GET /api/spof/:id
// @access  Private
const getSpofById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const spof = await spof_model_1.default.findById(req.params.id)
            .populate("employee", "name email department position")
            .populate("backupPeople.user", "name email department position")
            .populate("knowledgeAreas.relatedItems");
        if (!spof) {
            res.status(404).json({
                success: false,
                message: "SPOF not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: spof,
        });
    }
    catch (error) {
        console.error("Get SPOF error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getSpofById = getSpofById;
// @desc    Update a SPOF
// @route   PUT /api/spof/:id
// @access  Private
const updateSpof = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Find SPOF
        let spof = await spof_model_1.default.findById(req.params.id);
        if (!spof) {
            res.status(404).json({
                success: false,
                message: "SPOF not found",
            });
            return;
        }
        // Update SPOF
        spof = await spof_model_1.default.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date(), autoDetected: false }, {
            new: true,
            runValidators: true,
        });
        if (!spof) {
            res.status(404).json({
                success: false,
                message: "SPOF not found after update",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: spof,
        });
    }
    catch (error) {
        console.error("Update SPOF error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updateSpof = updateSpof;
// @desc    Delete a SPOF
// @route   DELETE /api/spof/:id
// @access  Private (Admin)
const deleteSpof = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const spof = await spof_model_1.default.findById(req.params.id);
        if (!spof) {
            res.status(404).json({
                success: false,
                message: "SPOF not found",
            });
            return;
        }
        await spof.deleteOne();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        console.error("Delete SPOF error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.deleteSpof = deleteSpof;
