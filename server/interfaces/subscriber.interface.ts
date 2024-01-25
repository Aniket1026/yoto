import mongoose, { Document } from "mongoose";

export interface SubscriberDocument extends Document {
  subscriber: mongoose.Schema.Types.ObjectId;
  channel: mongoose.Schema.Types.ObjectId;
}