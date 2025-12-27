import express from "express";
import Tracking from "../models/tr_schema.js";// your single model

const router = express.Router();

router.get("/", async (req, res) => {
  const { trackingNumber } = req.query;

  if (!trackingNumber) {
    return res.status(400).json({ error: "Tracking number is required" });
  }

  try {
    const track = await Tracking.findOne({ trackingNumber });

    if (!track) {
      return res.status(404).json({ error: "No data found" });
    }

    res.json({
      trackingNumber: track.trackingNumber,
      status: track.status,
      image: track.image,
      createdAt: track.createdAt,
      updatedAt: track.updatedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;

