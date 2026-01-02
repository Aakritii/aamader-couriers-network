import express from "express";
import Tracking from "../models/tr_schema.js";// your single model

const router = express.Router();

// GET tracking info using query parameter
// Example: /track?trackingNumber=12345
router.get("/", async (req, res) => {
  try {
    const { trackingNumber } = req.query;

    if (!trackingNumber) {
      return res.status(400).json({ error: "Tracking number is required" });
    }

    // Trim to avoid mismatch due to spaces
    const track = await Tracking.findOne({
      trackingNumber: {
        $regex: `^${trackingNumber.trim()}$`,
        $options: "i"   // 👈 case-insensitive
      }
    });

    if (!track) {
      return res.status(404).json({ error: "Tracking not found" });
    }

    res.json(track);
  } catch (err) {
    console.error("Error fetching tracking:", err);
    res.status(500).json({ error: "Failed to fetch tracking" });
  }
});

export default router;

