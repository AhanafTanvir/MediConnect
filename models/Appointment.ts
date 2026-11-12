import mongoose, { Schema, Document, Model } from "mongoose";
import { IAppointment } from "@/types";

export interface IAppointmentDocument extends Document, Omit<IAppointment, "_id"> {}

const VitalsSchema = new Schema(
  {
    bloodPressure: { type: String, default: "120/80" },
    pulseRate: { type: Number, default: 72 },
    oxygenSpO2: { type: Number, default: 98 },
    bodyTemp: { type: Number, default: 98.6 },
    weightKg: { type: Number, default: 70 },
    bmi: { type: Number, default: 24.5 },
  },
  { _id: false }
);

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientEmail: { type: String },
    patientMrn: { type: String, required: true },
    patientAge: { type: Number, default: 45 },
    patientGender: { type: String, enum: ["Male", "Female", "Other"], default: "Male" },
    patientBloodGroup: { type: String, default: "O+" },
    allergies: [{ type: String }],

    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    doctorSpecialty: { type: String, required: true },

    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String },

    appointmentDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    timeSlot: { type: String, required: true },
    serialNumber: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "SCHEDULED",
        "CHECKED_IN",
        "WAITING",
        "CALLED",
        "IN_CONSULTATION",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "SCHEDULED",
      required: true,
      index: true,
    },

    reasonForVisit: { type: String, default: "Routine Consultation" },
    symptoms: [{ type: String }],
    vitals: { type: VitalsSchema },

    billingStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PAID",
    },
    copayAmount: { type: Number, default: 140 },

    checkInTime: { type: String },
    calledTime: { type: String },
    inConsultationTime: { type: String },
    completedTime: { type: String },
    cancelledReason: { type: String },
    skipReason: { type: String },

    estimatedWaitMinutes: { type: Number, default: 0 },
    travelTimeMinutes: { type: Number, default: 25 },
    recommendedDepartureTime: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for queue lookup
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, status: 1 });
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, serialNumber: 1 });

export const AppointmentModel: Model<IAppointmentDocument> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointmentDocument>("Appointment", AppointmentSchema);

export default AppointmentModel;
