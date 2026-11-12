import mongoose, { Schema, Document, Model } from "mongoose";
import { IAuditLog } from "@/types";

export interface IAuditLogDocument extends Document, Omit<IAuditLog, "_id"> {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"],
      required: true,
    },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: String, required: true },
    details: { type: String, required: true },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const AuditLogModel: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLogModel;
