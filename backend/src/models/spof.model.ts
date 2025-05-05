import mongoose, { Document, Schema } from "mongoose";

export interface ISPOF extends Document {
  employee: mongoose.Types.ObjectId;
  knowledgeAreas: {
    area: string;
    score: number; // 0-100
    relatedItems: mongoose.Types.ObjectId[];
  }[];
  riskScore: number; // 0-100
  backupPeople: {
    user: mongoose.Types.ObjectId;
    coverageScore: number; // 0-100
  }[];
  autoDetected: boolean;
  mitigationPlan?: string;
  lastUpdated: Date;
}

const spofSchema = new Schema<ISPOF>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true },
    knowledgeAreas: [
      {
        area: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 100 },
        relatedItems: [{ type: Schema.Types.ObjectId, ref: "Knowledge" }],
      },
    ],
    riskScore: { type: Number, required: true, min: 0, max: 100 },
    backupPeople: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        coverageScore: { type: Number, required: true, min: 0, max: 100 },
      },
    ],
    autoDetected: { type: Boolean, default: true },
    mitigationPlan: { type: String },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISPOF>("SPOF", spofSchema);
