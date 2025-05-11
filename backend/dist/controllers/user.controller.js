"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin, Manager)
const getAllUsers = async (req, res) => {
    try {
        // Add filtering capability
        const filter = {};
        // If department is provided in query
        if (req.query.department) {
            filter.department = req.query.department;
        }
        // If role is provided in query
        if (req.query.role) {
            filter.role = req.query.role;
        }
        // If active status is provided in query
        if (req.query.isActive) {
            filter.isActive = req.query.isActive === "true";
        }
        const users = await user_model_1.default.find(filter).select("-password");
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getAllUsers = getAllUsers;
// @desc    Get a single user
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getUserById = getUserById;
// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
    try {
        // Check if updating own user or is admin
        if (!req.user ||
            (req.params.id !== req.user.id && req.user.role !== "admin")) {
            res.status(403).json({
                success: false,
                message: "Not authorized to update this user",
            });
            return;
        }
        // Remove password from update data if included
        const { password, ...updateData } = req.body;
        // Update user
        const user = await user_model_1.default.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.updateUser = updateUser;
// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await user_model_1.default.findById(req.params.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // Don't delete, just set as inactive
        user.isActive = false;
        await user.save();
        res.status(200).json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.deleteUser = deleteUser;
