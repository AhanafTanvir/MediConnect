import mongoose, { Schema, Document, Model } from "mongoose";
import { IQueueEvent } from "@/types";

export interface IQueueStateDocument extends Document {
  doctorId: string;
  doctorName: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  currentServingSerial: string | null;
  activePatientName?: string | null;
  activePatientElapsedMinutes?: number;
  activeInRoomToken?: string | null;
  nextEligibleSerial: string | null;
  nextPatientName?: string | null;
  flowPace: string;
  events: IQueueEvent[];
}

const QueueEventSchema = new Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    serial: { type: String },
    type: {
      type: String,
      enum: ["CALL", "ENTER", "COMPLETE", "OPEN", "CHECKIN", "SKIP"],
      default: "CALL",
    },
  },
  { _id: false }
);

const QueueStateSchema = new Schema<IQueueStateDocument>(
  {
    doctorId: { type: String, required: true, index: true },
    doctorName: { type: String, required: true },
    hospitalId: { type: String, required: true, index: true },
    hospitalName: { type: String, required: true },
    date: { type: String, required: true, index: true },
    currentServingSerial: { type: String, default: null },
    activePatientName: { type: String, default: null },
    activePatientElapsedMinutes: { type: Number, default: 0 },
    activeInRoomToken: { type: String, default: null },
    nextEligibleSerial: { type: String, default: null },
    nextPatientName: { type: String, default: null },
    flowPace: { type: String, default: "Normal (4m avg)" },
    events: [QueueEventSchema],
  },
  {
    timestamps: true,
  }
);

QueueStateSchema.index({ doctorId: 1, date: 1 }, { unique: true });

export const QueueStateModel: Model<IQueueStateDocument> =
  mongoose.models.QueueState ||
  mongoose.model<IQueueStateDocument>("QueueState", QueueStateSchema);

export default QueueStateModel;
