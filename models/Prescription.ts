import mongoose, { Schema, Document, Model } from "mongoose";
import { IPrescription } from "@/types";

export interface IPrescriptionDocument extends Document, Omit<IPrescription, "_id"> {}

const MedicationItemSchema = new Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    timing: { type: String, required: true },
    duration: { type: String, required: true },
    quantity: { type: String, required: true },
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescriptionDocument>(
  {
    appointmentId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientMrn: { type: String, required: true },
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },
    hospitalName: { type: String, required: true },
    date: { type: String, required: true },

    diagnosisCode: { type: String, default: "I10" },
    diagnosisName: { type: String, default: "Essential (Primary) Hypertension" },
    severity: {
      type: String,
      enum: ["Mild", "Moderate", "Severe"],
      default: "Moderate",
    },
    symptoms: [{ type: String }],
    clinicalAssessment: { type: String, default: "" },

    medications: [MedicationItemSchema],
    dietaryAdvice: [{ type: String }],
    customAdvice: { type: String, default: "" },
    investigations: [{ type: String }],

    digitalSignature: { type: String, required: true },
    isDraft: { type: Boolean, default: false },
    issuedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const PrescriptionModel: Model<IPrescriptionDocument> =
  mongoose.models.Prescription ||
  mongoose.model<IPrescriptionDocument>("Prescription", PrescriptionSchema);

export default PrescriptionModel;
