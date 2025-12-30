import express from "express";
import cloudinary from "../config/cloudinary.js";
import upload from "../middleware/upload.js";
import Tracking from "../models/tr_schema.js";
import 'dotenv/config';

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


