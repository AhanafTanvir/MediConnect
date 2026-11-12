import mongoose, { Schema, Document, Model } from "mongoose";
import { IHospital } from "@/types";

export interface IHospitalDocument extends Document, Omit<IHospital, "_id"> {}

const HospitalSchema = new Schema<IHospitalDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    contactPhone: { type: String, required: true },
    emergencyHotline: { type: String, required: true },
    departments: [{ type: String }],
    bedCapacity: { type: Number, default: 200 },
    openingHours: { type: String, default: "24/7 Trauma & Urgent Care" },
    rating: { type: Number, default: 4.8 },
    reviewCount: { type: Number, default: 320 },
    image: { type: String, default: "/images/hospital-pavilion.jpg" },
    parkingInfo: { type: String, default: "Blue Lot P2 (Bays 12-40) - Complimentary validation" },
    intakeDeskInfo: { type: String, default: "Floor 4 • Kiosk Station B" },
  },
  {
    timestamps: true,
  }
);

export const HospitalModel: Model<IHospitalDocument> =
  mongoose.models.Hospital || mongoose.model<IHospitalDocument>("Hospital", HospitalSchema);

export default HospitalModel;
