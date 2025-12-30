import multer from "multer";
import CloudinaryStorage from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // ✅ default import


/* ===============================
   MULTER (IMAGE UPLOAD)
================================ */
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
