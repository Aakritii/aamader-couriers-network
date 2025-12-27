import cloudinary from 'cloudinary';
import 'dotenv/config';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // old env
  api_key: process.env.CLOUDINARY_API_KEY,        // old env
  api_secret: process.env.CLOUDINARY_API_SECRET   // old env
});

export default cloudinary.v2;
