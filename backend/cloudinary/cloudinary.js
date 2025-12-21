import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.v2.config({
  // cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloud_name: dingg2tq9,
  // api_key: process.env.CLOUDINARY_API_KEY,
  api_key: 976634486382574,
  // api_secret: process.env.CLOUDINARY_API_SECRET,
  api_secret:BEQ3q2x3R8fqUPaRDhpsnDUW11k,
});

export default cloudinary;
