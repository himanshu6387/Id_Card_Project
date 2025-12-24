import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME||dgp9pbjqs,
  api_key: process.env.CLOUDINARY_API_KEY||445678712767251,
  api_secret: process.env.CLOUDINARY_API_SECRET||ES7o0_Mv0QYdlcveAtOTyxCHOis,
});

export default cloudinary;
