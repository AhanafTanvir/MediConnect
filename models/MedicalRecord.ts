import mongoose, { Schema, Document, Model } from "mongoose";
import { IMedicalRecord } from "@/types";

export interface IMedicalRecordDocument extends Document, Omit<IMedicalRecord, "_id"> {}

const MedicalRecordSchema = new Schema<IMedicalRecordDocument>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    category: {
      type: String,
      enum: ["Consultation", "Prescription", "Lab Report", "Document"],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    date: { type: String, required: true },
    doctorName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    summary: { type: String, required: true },
    fileUrl: { type: String },
    downloadUrl: { type: String },
    badge: { type: String },
  },
  {
    timestamps: true,
  }
);

export const MedicalRecordModel: Model<IMedicalRecordDocument> =
  mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecordDocument>("MedicalRecord", MedicalRecordSchema);

export default MedicalRecordModel;
