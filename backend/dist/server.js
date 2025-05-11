"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const knowledge_routes_1 = __importDefault(require("./routes/knowledge.routes"));
const handover_routes_1 = __importDefault(require("./routes/handover.routes"));
const spof_routes_1 = __importDefault(require("./routes/spof.routes"));
// Load environment variables
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
// Initialize express
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "5000", 10);
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
// Middleware
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use((0, helmet_1.default)()); // Security headers
app.use((0, morgan_1.default)("dev")); // Logging
app.use(limiter); // Rate limiting
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/knowledge", knowledge_routes_1.default);
app.use("/api/handovers", handover_routes_1.default);
app.use("/api/spof", spof_routes_1.default);
// Health check
app.get("/health", (req, res) => {
    res
        .status(200)
        .json({ status: "OK", message: "TribeTransfer API is running" });
});
// Error handling for unmatched routes
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
});
// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
