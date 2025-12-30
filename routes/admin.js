import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";
import Tracking from "../models/tr_schema.js";
import 'dotenv/config';
import streamifier from "streamifier";

const router = express.Router();


// ----------------- ROUTES -----------------

// 1️⃣ Admin Login (Username + Password)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Verify credentials
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({
      message: "Login successful",
      token: "admin-access-granted"
    });
  } else {
    res.status(401).json({
      error: "Invalid username or password"
    });
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

    // Upload image to Cloudinary if file is provided
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "tracking_images" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    // Fetch existing tracking record
    const existingTrack = await Tracking.findOne({
      trackingNumber: trackingNumber.trim(),
    });

    if (existingTrack && existingTrack.status.toLowerCase() === "delivered") {
      return res
        .status(400)
        .json({ error: "Cannot change status after it is Delivered" });
    }
    
    // Upsert tracking record
    const track = await Tracking.findOneAndUpdate(
      { trackingNumber: trackingNumber.trim() },
      {
        status,
        image: imageUrl,
        updatedAt: new Date(),
        $setOnInsert: { createdAt: new Date() },
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


