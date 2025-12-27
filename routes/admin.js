import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";
import Tracking from "../models/tr_schema.js";
import Twilio from "twilio";
import 'dotenv/config';

const router = express.Router();

// ----------------- TWILIO CONFIG -----------------
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Simple in-memory OTP store
let adminOtp = "";


// ----------------- ROUTES -----------------

// 1️⃣ Request OTP
router.post("/request-otp", async (req, res) => {
  try {
    adminOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await twilioClient.messages.create({
      to: `${process.env.ADMIN_MOBILE}`,
      body: `Your OTP is: ${adminOtp}`,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
    });

    console.log("Sent OTP:", adminOtp);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    res.status(500).json({ error: "Error sending OTP" });
  }
});

// 2️⃣ Verify OTP
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;
  if (otp === adminOtp) {
    adminOtp = "";
    res.json({ token: "admin-access-granted" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});


// 3️⃣ Add / Update Tracking (Admin)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { trackingNumber, status } = req.body;

    if (!trackingNumber || !status) {
      return res.status(400).json({ error: "Tracking number and status are required" });
    }

    let imageUrl = null;

    // Upload to Cloudinary if image is provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "tracking_images",
      });
      imageUrl = result.secure_url;
    }

    // Fetch existing tracking record
    const existingTrack = await Tracking.findOne({ trackingNumber: trackingNumber.trim() });

    if (existingTrack && existingTrack.status.toLowerCase() === "delivered") {
      return res.status(400).json({ error: "Cannot change status after it is Delivered" });
    }
    
    // Use upsert: true to automatically create if not exists
    const track = await Tracking.findOneAndUpdate(
      { trackingNumber: trackingNumber.trim() },
      {
        status,
        image: imageUrl,
        updatedAt: new Date(),
        $setOnInsert: { createdAt: new Date() } // only set when creating
      },
      { new: true, upsert: true }
    );

    console.log("Saved tracking:", track);
    res.json({ message: "Tracking saved!", tracking: track });
  } catch (err) {
    console.error("Error saving tracking:", err);
    res.status(500).json({ error: "Failed to save tracking" });
  }
});

export default router;


