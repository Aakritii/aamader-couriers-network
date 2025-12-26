import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
// import twilio from "twilio";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.resolve();
const app = express();
app.use(express.json());
app.use(express.static("public"));

// Files to store admin OTP and tracking info
const OTP_FILE = "data/admin.json";
const TRACK_FILE = "data/tracking.json";

// Admin & Twilio setup
const ADMIN_MOBILE = process.env.ADMIN_MOBILE;
//const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const MESSAGING_SERVICE_SID = process.env.MESSAGING_SERVICE_SID;

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ----------------- Helper -----------------
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ----------------- Admin OTP Routes -----------------
const ADMIN_OTP = "123456";
// Request OTP (no SMS)
app.post("/admin/request-otp", (req, res) => {
  // Just "send" OTP without SMS
  console.log("Admin OTP for testing:", ADMIN_OTP);
  res.json({ success: true, message: `OTP sent (for testing use ${ADMIN_OTP})` });
});

// Verify OTP
app.post("/admin/verify-otp", (req, res) => {
  const { otp } = req.body;
  if (otp === ADMIN_OTP) {
    const token = crypto.randomBytes(16).toString("hex");
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid OTP" });
  }
});
// app.post("/admin/request-otp", (req, res) => {
//   const otp = generateOTP();
//   fs.writeFileSync(OTP_FILE, JSON.stringify({ mobile: ADMIN_MOBILE, otp, timestamp: Date.now() }));
//   console.log("Sending OTP to:", ADMIN_MOBILE, "OTP:", otp);

//   client.messages
//     .create({
//       body: `Your admin OTP is ${otp}`,
//       messagingServiceSid: `${MESSAGING_SERVICE_SID}`,
//       to: `+91${ADMIN_MOBILE}`
//     })
//     .then(message => {
//       console.log("Twilio message SID:", message.sid);
//       res.json({ success: true, message: "OTP sent via SMS" });
//     })
//     .catch(err => {
//       console.error("Twilio error:", err);
//       res.status(500).json({ error: "Failed to send OTP", details: err.message });
//     });
// });

// app.post("/admin/verify-otp", (req, res) => {
//   const { otp } = req.body;
//   if (!fs.existsSync(OTP_FILE)) return res.status(400).json({ error: "Request OTP first" });

//   const data = JSON.parse(fs.readFileSync(OTP_FILE));
//   const now = Date.now();

//   if (now - data.timestamp > 5 * 60 * 1000) return res.status(401).json({ error: "OTP expired" });

//   if (data.otp === otp) {
//     const token = crypto.randomBytes(16).toString("hex");
//     res.json({ token });
//   } else {
//     res.status(401).json({ error: "Invalid OTP" });
//   }
// });

// ----------------- Admin Add/Update Tracking -----------------
app.post("/admin/add", upload.single("image"), (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Unauthorized" });

  const token = auth.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Invalid token" });

  const { trackingNumber, status } = req.body;
  if (!trackingNumber || !status) return res.status(400).json({ error: "Missing fields" });

  let data = {};
  if (fs.existsSync(TRACK_FILE)) data = JSON.parse(fs.readFileSync(TRACK_FILE));

  data[trackingNumber] = {
    status,
    image: req.file ? "/uploads/" + req.file.filename : (data[trackingNumber]?.image || "")
  };

  fs.writeFileSync(TRACK_FILE, JSON.stringify(data));
  res.json({ success: true });
});

// ----------------- User Track Parcel -----------------
app.get("/track/:trackingNumber", (req, res) => {
  if (!fs.existsSync(TRACK_FILE)) return res.json(null);
  const data = JSON.parse(fs.readFileSync(TRACK_FILE));
  res.json(data[req.params.trackingNumber] || null);
});

// ----------------- Start Server -----------------
app.listen(3000, () => console.log("Server running on http://localhost:3000"));
