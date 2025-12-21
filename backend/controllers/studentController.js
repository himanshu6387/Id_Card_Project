import Student from '../models/studentModel.js';
import StudentLink from '../models/studentLink.js';
import dotenv from 'dotenv'
import { v2 as cloudinary } from 'cloudinary';
import { removeBackground } from '@imgly/background-removal-node';

dotenv.config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(process.env.CLOUDINARY_API_SECRET)
console.log(process.env.CLOUDINARY_API_KEY)



export const submitStudentData = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // Get individual fields from req.body
    const {
      name,
      class: studentClass,
      section,
      aadhar,
      phone,
      fatherName,
      motherName,
      dob,
      address,
      admissionNo,
      email
    } = req.body;

    console.log('Received data:', req.body);
    console.log('Received file:', req.file);
    
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload student image' });
    }
    
    // Verify link exists and is active
    const studentLink = await StudentLink.findOne({ linkId, isActive: true });
    if (!studentLink) {
      return res.status(404).json({ message: 'Invalid or expired link' });
    }
    
    // Upload image to Cloudinary from buffer
    let imageUrl = '';
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: `college_erp/${studentLink.collegeName}`,
        transformation: [
          { width: 300, height: 300, crop: 'fill' },
          { quality: 'auto:low' }
        ]
      });
      imageUrl = result.secure_url;
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(400).json({ message: 'Image upload failed: ' + uploadError.message });
    }
    
    // Create student with individual fields
    const student = new Student({
      studentImage: imageUrl,
      name: name,
      class: studentClass,
      section: section,
      aadhar: aadhar,
      phone: phone,
      fatherName: fatherName,
      motherName: motherName,
      dob: new Date(dob),
      address: address,
      admissionNo: admissionNo,
      email: email,
      collegeId: studentLink.collegeId,
      collegeName: studentLink.collegeName,
      linkId: linkId
    });
    
    await student.save();
    
    res.status(201).json({
      message: 'Student data submitted successfully',
      student: student
    });
  } catch (error) {
    console.error('Student submission error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getLinkDetails = async (req, res) => {
  try {
    const { linkId } = req.params;
    
    const studentLink = await StudentLink.findOne({ linkId, isActive: true });
    if (!studentLink) {
      return res.status(404).json({ message: 'Invalid or expired link' });
    }
    
    res.json({
      collegeName: studentLink.collegeName,
      linkId: studentLink.linkId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




export const removeImageBackground = async (req, res) => {
  try {
    const { image } = req.body;
    
    // Remove background
    const blob = await removeBackground(image);
    
    // Convert to base64
    const buffer = await blob.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    res.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ message: 'Background removal failed' });
  }
};