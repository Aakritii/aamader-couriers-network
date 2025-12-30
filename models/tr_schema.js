import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema({
  trackingNumber: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  image: { type: String, default: null},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Tracking = mongoose.model("trackings", trackingSchema);

export default Tracking;
