import mongoose from "mongoose";

export interface LogDocument extends mongoose.Document {
  action: string;
  userId: mongoose.Schema.Types.ObjectId;
  timestamp: Date;
}

const logSchema = new mongoose.Schema<LogDocument>({
  action: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now },
});

const LogModel = mongoose.model<LogDocument>("Log", logSchema);
export default LogModel;
