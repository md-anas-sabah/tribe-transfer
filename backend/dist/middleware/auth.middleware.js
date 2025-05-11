"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const protect = async (req, res, next) => {
    let token;
    if (req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await user_model_1.default.findById(decoded.id).select("-password");
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        req.user = {
            id: user._id.toString(),
            role: user.role,
        };
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
};
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        var _a;
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Role ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.role} is not authorized to access this route`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
