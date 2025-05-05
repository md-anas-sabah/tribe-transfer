import mongoose, { Document, Schema } from "mongoose";

export interface IHandover extends Document {
  employee: mongoose.Types.ObjectId;
  exitDate: Date;
  status: "planned" | "in-progress" | "completed";
  interviewTranscript?: string;
  interviewSummary?: string;
  interviewDate?: Date;
  knowledgeItems: {
    knowledge: mongoose.Types.ObjectId;
    importance: "low" | "medium" | "high" | "critical";
    notes: string;
  }[];
  contacts: {
    name: string;
    role: string;
    email: string;
    notes: string;
  }[];
  tasks: {
    title: string;
    description: string;
    status: "pending" | "completed";
    assignee?: mongoose.Types.ObjectId;
  }[];
  documents: {
    title: string;
    description: string;
    url: string;
    type: string;
  }[];
  successor?: mongoose.Types.ObjectId;
}

const handoverSchema = new Schema<IHandover>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
        knowledge: { type: Schema.Types.ObjectId, ref: "Knowledge" },
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
        assignee: { type: Schema.Types.ObjectId, ref: "User" },
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
    successor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IHandover>("Handover", handoverSchema);
