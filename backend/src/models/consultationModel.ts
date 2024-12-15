import { Schema, model, Document, Types } from "mongoose";

export interface ConsultationDocument extends Document {
  userId: Types.ObjectId;
  psychologistId: Types.ObjectId;
  status: "pending" | "accepted" | "rejected";
  createdAt: Date;
}

const ConsultationSchema = new Schema<ConsultationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    psychologistId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const ConsultationModel = model<ConsultationDocument>(
  "Consultation",
  ConsultationSchema
);
