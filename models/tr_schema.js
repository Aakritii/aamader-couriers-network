import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    image: { type: String, default: null }
  },
  {
    timestamps: true // ✅ Mongoose manages createdAt & updatedAt
  }
);

const Tracking = mongoose.model("trackings", trackingSchema);
export default Tracking;
