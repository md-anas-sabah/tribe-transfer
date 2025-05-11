"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    });
};
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id.toString());
    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(statusCode).cookie("token", token, cookieOptions).json({
        success: true,
        token,
        data: userResponse,
    });
};
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role, department, position } = req.body;
        // Check if user exists
        const userExists = await user_model_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({
                success: false,
                message: "User already exists",
            });
            return;
        }
        // Create user
        const user = await user_model_1.default.create({
            name,
            email,
            password,
            role,
            department,
            position,
        });
        sendTokenResponse(user, 201, res);
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.register = register;
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate email & password
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide email and password",
            });
            return;
        }
        // Check for user
        const user = await user_model_1.default.findOne({ email }).select("+password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        sendTokenResponse(user, 200, res);
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.login = login;
// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
const logout = (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000), // 10 seconds
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        data: {},
    });
};
exports.logout = logout;
// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const user = await user_model_1.default.findById(req.user.id).select("-password");
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
        console.error("Get me error:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.getMe = getMe;
