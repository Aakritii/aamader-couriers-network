import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db.js";

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===============================
   BASIC MIDDLEWARE
================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve static files like CSS, JS, images
app.use(express.static(path.join(__dirname, "public"))); // assuming your HTML/CSS is in 'public'

// Route to serve your main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html")); // adjust path to your HTML file
});

// Add your API routes (admin, track, etc.)
import adminRoutes from "./routes/admin.js";
app.use("/admin", adminRoutes);

import trackRoutes from "./routes/tracks.js";
app.use("/track", trackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT || 3000, () => {
  console.log(`✅ Server running on port http://localhost:${PORT}/`);
});
