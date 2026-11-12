import mongoose, { Schema, Document, Model } from "mongoose";
import { IDoctor } from "@/types";

export interface IDoctorDocument extends Document, Omit<IDoctor, "_id"> {}

const DoctorSchema = new Schema<IDoctorDocument>(
  {
    userId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true },
    specialty: { type: String, required: true, index: true },
    subSpecialty: { type: String },
    qualifications: { type: String, required: true },
    experienceYears: { type: Number, required: true },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 120 },
    consultationFee: { type: Number, required: true },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    roomNumber: { type: String, default: "408" },
    stationNumber: { type: String, default: "Station 02" },
    avatar: { type: String, required: true },
    bio: { type: String, default: "" },
    availableDays: [{ type: String }],
    avgConsultTimeMinutes: { type: Number, default: 9 },
    nextSlotTime: { type: String },
    remainingTokens: { type: Number, default: 18 },
    isAvailableToday: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const DoctorModel: Model<IDoctorDocument> =
  mongoose.models.Doctor || mongoose.model<IDoctorDocument>("Doctor", DoctorSchema);

export default DoctorModel;
