import mongoose, { Schema, Document, Model } from "mongoose";
import { INotification } from "@/types";

export interface INotificationDocument extends Document, Omit<INotification, "_id"> {}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    recipientId: { type: String, required: true, index: true },
    recipientRole: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "RECEPTIONIST", "ADMIN"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["SMS", "IN_APP", "SYSTEM"],
      default: "IN_APP",
    },
    serialNumber: { type: String },
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "FAILED"],
      default: "DELIVERED",
    },
    timestamp: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel: Model<INotificationDocument> =
  mongoose.models.Notification ||
  mongoose.model<INotificationDocument>("Notification", NotificationSchema);

export default NotificationModel;
