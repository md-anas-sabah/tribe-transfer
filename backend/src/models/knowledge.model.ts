import mongoose, { Document, Schema } from "mongoose";

export interface IKnowledge extends Document {
  title: string;
  description: string;
  category: string;
  tags: string[];
  owner: mongoose.Types.ObjectId;
  contributors: mongoose.Types.ObjectId[];
  content: string;
  attachments: {
    name: string;
    url: string;
    type: string;
  }[];
  source: "manual" | "slack" | "notion" | "github" | "jira";
  sourceLink?: string;
  importance: "low" | "medium" | "high" | "critical";
  isPrivate: boolean;
}

const knowledgeSchema = new Schema<IKnowledge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contributors: [{ type: Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, required: true },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
        type: { type: String },
      },
    ],
    source: {
      type: String,
      enum: ["manual", "slack", "notion", "github", "jira"],
      default: "manual",
    },
    sourceLink: { type: String },
    importance: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    isPrivate: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IKnowledge>("Knowledge", knowledgeSchema);
