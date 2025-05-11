"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHandoverPlan = exports.detectSpofs = exports.generateKnowledgeSummary = void 0;
const groq_sdk_1 = require("groq-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.Groq({
    apiKey: process.env.GROQ_API_KEY,
});
/**
 * Generate knowledge summary from interview transcript
 * @param transcript Interview transcript text
 * @returns AI-generated summary
 */
const generateKnowledgeSummary = async (transcript) => {
    var _a, _b;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that helps with knowledge management. Extract key information from this exit interview transcript and create a structured summary of the employee's knowledge, responsibilities, and recommendations.",
                },
                {
                    role: "user",
                    content: transcript,
                },
            ],
            model: "llama3-70b-8192",
            temperature: 0.5,
            max_tokens: 2048,
        });
        return (((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "Failed to generate summary");
    }
    catch (error) {
        console.error("GROQ API error:", error);
        throw new Error("Failed to generate knowledge summary");
    }
};
exports.generateKnowledgeSummary = generateKnowledgeSummary;
/**
 * Detect Single Points of Failure (SPOFs) in organization knowledge
 * @param knowledgeData Knowledge data to analyze
 * @returns SPOF analysis
 */
const detectSpofs = async (knowledgeData) => {
    var _a, _b;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that helps with identifying Single Points of Failure (SPOFs) in organizational knowledge. Analyze the provided knowledge data and identify potential SPOFs. Return the results as a JSON array with each SPOF containing userId, knowledgeAreas (array of objects with area, score, and relatedItems), riskScore, and backupPeople (array of objects with userId and coverageScore).",
                },
                {
                    role: "user",
                    content: JSON.stringify(knowledgeData),
                },
            ],
            model: "llama3-70b-8192",
            temperature: 0.3,
            max_tokens: 2048,
        });
        const content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "[]";
        try {
            return JSON.parse(content);
        }
        catch (e) {
            console.error("Error parsing SPOF analysis:", e);
            return [];
        }
    }
    catch (error) {
        console.error("GROQ API error:", error);
        throw new Error("Failed to detect SPOFs");
    }
};
exports.detectSpofs = detectSpofs;
/**
 * Generate a handover plan
 * @param employeeData Employee data
 * @param knowledgeData Knowledge data
 * @returns Handover plan
 */
const generateHandoverPlan = async (employeeData, knowledgeData) => {
    var _a, _b;
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an AI assistant that helps with employee handovers. Generate a comprehensive handover plan based on the employee data and their knowledge areas. Return the results as a JSON object with knowledgeItems (prioritized list of knowledge areas), contacts (key people to know), tasks (handover tasks), and documents (relevant documentation).",
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        employee: employeeData,
                        knowledge: knowledgeData,
                    }),
                },
            ],
            model: "llama3-70b-8192",
            temperature: 0.4,
            max_tokens: 2048,
        });
        const content = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || "{}";
        try {
            return JSON.parse(content);
        }
        catch (e) {
            console.error("Error parsing handover plan:", e);
            return {};
        }
    }
    catch (error) {
        console.error("GROQ API error:", error);
        throw new Error("Failed to generate handover plan");
    }
};
exports.generateHandoverPlan = generateHandoverPlan;
