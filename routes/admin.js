import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import multerCloudinaryStorage from "multer-storage-cloudinary";
import Twilio from "twilio";
import upload from "../middleware/upload.js";
import Tracking from "../models/tr_schema.js"; // single consolidated model
import 'dotenv/config'; // load env variables

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
    // generate 6-digit OTP
    adminOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // send OTP via Twilio using MessagingServiceSid
    const message = await twilioClient.messages.create({
      to: `${process.env.ADMIN_MOBILE}`, // add +91 by default
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
    adminOtp = ""; // reset after verification
    res.json({ token: "admin-access-granted" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});


// 3️⃣ Add / Update Tracking (Admin)
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { trackingNumber, status } = req.body;
    const image = req.file?.path || null;

    // Find existing tracking entry
    let track = await Tracking.findOne({ trackingNumber });

    if (track) {
      track.status = status;
      if (image) track.image = image;
      track.updatedAt = new Date(); // update timestamp
      await track.save();
    } else {
      track = await Tracking.create({ 
        trackingNumber, 
        status, 
        image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    res.json({ message: "Saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save tracking" });
  }
});

export default router;
