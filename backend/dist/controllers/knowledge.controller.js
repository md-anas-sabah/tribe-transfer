"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchKnowledge = exports.deleteKnowledge = exports.updateKnowledge = exports.getKnowledgeById = exports.getAllKnowledge = exports.createKnowledge = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const knowledge_model_1 = __importDefault(require("../models/knowledge.model"));
// @desc    Create a new knowledge item
// @route   POST /api/knowledge
// @access  Private
const createKnowledge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Add current user as owner
        req.body.owner = req.user.id;
        // Create knowledge item
        const knowledge = await knowledge_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            data: knowledge,
        });
    }
    catch (error) {
        console.error("Create knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.createKnowledge = createKnowledge;
// @desc    Get all knowledge items
// @route   GET /api/knowledge
// @access  Private
const getAllKnowledge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        // Build filter object
        const filter = {};
        // Filter by category if provided
        if (req.query.category) {
            filter.category = req.query.category;
        }
        // Filter by tag if provided
        if (req.query.tag) {
            filter.tags = { $in: [req.query.tag] };
        }
        // Filter by importance if provided
        if (req.query.importance) {
            filter.importance = req.query.importance;
        }
        // Filter by owner if provided
        if (req.query.owner) {
            filter.owner = req.query.owner;
        }
        // Show private knowledge only to owner or admin
        if (req.user.role !== "admin") {
            filter.$or = [{ isPrivate: false }, { owner: req.user.id }];
        }
        const knowledge = await knowledge_model_1.default.find(filter)
            .populate("owner", "name email")
            .populate("contributors", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: knowledge.length,
            data: knowledge,
        });
    }
    catch (error) {
        console.error("Get all knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getAllKnowledge = getAllKnowledge;
// @desc    Get a single knowledge item
// @route   GET /api/knowledge/:id
// @access  Private
const getKnowledgeById = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const knowledge = await knowledge_model_1.default.findById(req.params.id)
            .populate("owner", "name email position")
            .populate("contributors", "name email position");
        if (!knowledge) {
            res.status(404).json({
                success: false,
                message: "Knowledge item not found",
            });
            return;
        }
        // Check if user has access to private knowledge
        if (knowledge.isPrivate &&
            knowledge.owner.toString() !== req.user.id &&
            req.user.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Not authorized to access this knowledge item",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: knowledge,
        });
    }
    catch (error) {
        console.error("Get knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getKnowledgeById = getKnowledgeById;
// @desc    Update a knowledge item
// @route   PUT /api/knowledge/:id
// @access  Private
const updateKnowledge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        let knowledge = await knowledge_model_1.default.findById(req.params.id);
        if (!knowledge) {
            res.status(404).json({
                success: false,
                message: "Knowledge item not found",
            });
            return;
        }
        // Check ownership or admin role
        if (knowledge.owner.toString() !== req.user.id &&
            req.user.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Not authorized to update this knowledge item",
            });
            return;
        }
        // Add user to contributors if not the owner and not already a contributor
        if (knowledge.owner.toString() !== req.user.id) {
            const contributorExists = knowledge.contributors.some((contributor) => { var _a; return contributor.toString() === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id); });
            if (!contributorExists && req.user.id) {
                knowledge.contributors.push(new mongoose_1.default.Types.ObjectId(req.user.id));
            }
        }
        // Update knowledge item
        knowledge = await knowledge_model_1.default.findByIdAndUpdate(req.params.id, { ...req.body, contributors: knowledge.contributors }, {
            new: true,
            runValidators: true,
        });
        if (!knowledge) {
            res.status(404).json({
                success: false,
                message: "Knowledge item not found after update",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: knowledge,
        });
    }
    catch (error) {
        console.error("Update knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updateKnowledge = updateKnowledge;
// @desc    Delete a knowledge item
// @route   DELETE /api/knowledge/:id
// @access  Private
const deleteKnowledge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const knowledge = await knowledge_model_1.default.findById(req.params.id);
        if (!knowledge) {
            res.status(404).json({
                success: false,
                message: "Knowledge item not found",
            });
            return;
        }
        // Check ownership or admin role
        if (knowledge.owner.toString() !== req.user.id &&
            req.user.role !== "admin") {
            res.status(403).json({
                success: false,
                message: "Not authorized to delete this knowledge item",
            });
            return;
        }
        await knowledge.deleteOne();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        console.error("Delete knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.deleteKnowledge = deleteKnowledge;
// @desc    Search knowledge items
// @route   GET /api/knowledge/search
// @access  Private
const searchKnowledge = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const { query } = req.query;
        if (!query) {
            res.status(400).json({
                success: false,
                message: "Search query is required",
            });
            return;
        }
        // Create search filter
        const searchFilter = {
            $or: [
                { title: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
                { tags: { $in: [new RegExp(String(query), "i")] } },
            ],
        };
        // Add privacy filter
        const filter = {
            $and: [
                searchFilter,
                {
                    $or: [{ isPrivate: false }, { owner: req.user.id }],
                },
            ],
        };
        // Allow admins to see all results
        if (req.user.role === "admin") {
            filter.$and = [searchFilter];
        }
        const knowledge = await knowledge_model_1.default.find(filter)
            .populate("owner", "name email")
            .populate("contributors", "name email")
            .sort({ importance: -1, createdAt: -1 });
        res.status(200).json({
            success: true,
            count: knowledge.length,
            data: knowledge,
        });
    }
    catch (error) {
        console.error("Search knowledge error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.searchKnowledge = searchKnowledge;
