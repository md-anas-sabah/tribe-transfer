"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const handoverSchema = new mongoose_1.Schema({
    employee: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    exitDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ["planned", "in-progress", "completed"],
        default: "planned",
    },
    interviewTranscript: { type: String },
    interviewSummary: { type: String },
    interviewDate: { type: Date },
    knowledgeItems: [
        {
            knowledge: { type: mongoose_1.Schema.Types.ObjectId, ref: "Knowledge" },
            importance: {
                type: String,
                enum: ["low", "medium", "high", "critical"],
                default: "medium",
            },
            notes: { type: String },
        },
    ],
    contacts: [
        {
            name: { type: String, required: true },
            role: { type: String, required: true },
            email: { type: String, required: true },
            notes: { type: String },
        },
    ],
    tasks: [
        {
            title: { type: String, required: true },
            description: { type: String },
            status: {
                type: String,
                enum: ["pending", "completed"],
                default: "pending",
            },
            assignee: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
        },
    ],
    documents: [
        {
            title: { type: String, required: true },
            description: { type: String },
            url: { type: String, required: true },
            type: { type: String },
        },
    ],
    successor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("Handover", handoverSchema);
