// controllers/collegeController.js
import StudentLink from '../models/studentLink.js';
import Student from '../models/studentModel.js';
import XLSX from 'xlsx'
import archiver from 'archiver';
import {v4 as uuidv4} from 'uuid'
import https from 'http'
import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage, registerFont } from 'canvas';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode'

export const generateStudentLink = async (req, res) => {
  try {
    const linkId = uuidv4();
    
    const studentLink = new StudentLink({
      linkId,
      collegeId: req.user.id,
      collegeName: req.user.collegeName
    });

    await studentLink.save();

    const fullLink = `${process.env.FRONTEND_URL}/student-form/${linkId}`;
    
    res.json({
      message: 'Student data collection link generated',
      link: fullLink,
      linkId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find({ collegeId: req.user.id });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadExcel = async (req, res) => {
  try {
    const students = await Student.find({ collegeId: req.user.id });
    
    const worksheet = XLSX.utils.json_to_sheet(students.map(student => ({
      'Name': student.name,
      'Class': student.class,
      'Section': student.section,
      'Aadhar': student.aadhar,
      'Phone': student.phone,
      'Father Name': student.fatherName,
      'Mother Name': student.motherName,
      'Date of Birth': student.dob.toDateString(),
      'Address': student.address,
      'Admission No': student.admissionNo,
      'Email': student.email,
      'Created At': student.createdAt.toDateString()
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Disposition', `attachment; filename="${req.user.collegeName}_students.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadImages = async (req, res) => {
  try {
    const students = await Student.find({ collegeId: req.user.id });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.user.collegeName}_student_images.zip"`);
    
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    archive.pipe(res);
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      if (student.studentImage) {
        try {
          const imageUrl = student.studentImage;
          const imageName = `${student.name}_${student.admissionNo}.jpg`;
          
          // Add image from URL to zip
          const response = await fetch(imageUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            archive.append(Buffer.from(buffer), { name: imageName });
          }
        } catch (err) {
          console.error(`Error downloading image for ${student.name}:`, err);
        }
      }
    }
    
    archive.finalize();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateIDCards = async (req, res) => {
  try {
    const students = await Student.find({ collegeId: req.user.id });
    
    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${req.user.collegeName}_ID_Cards.zip"`);

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.pipe(res);

    // Generate ID card for each student
    for (const student of students) {
      try {
        const idCardBuffer = await generateIDCard(student, req.user.collegeName);
        archive.append(idCardBuffer, { 
          name: `${student.admissionNo}_${student.name.replace(/\s+/g, '_')}_ID_Card.png` 
        });
      } catch (error) {
        console.error(`Error generating ID for ${student.name}:`, error);
      }
    }

    archive.finalize();
  } catch (error) {
    console.error('ID Card generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

async function generateIDCard(student, collegeName) {
  // ID Card dimensions (standard credit card size ratio)
  const width = 1012;
  const height = 638;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Outer border gradient (dark frame)
  const outerGradient = ctx.createLinearGradient(0, 0, 0, height);
  outerGradient.addColorStop(0, '#1e293b');
  outerGradient.addColorStop(0.5, '#312e81');
  outerGradient.addColorStop(1, '#581c87');
  ctx.fillStyle = outerGradient;
  ctx.fillRect(0, 0, width, height);

  // Main card background with gradient (purple to blue)
  const cardGradient = ctx.createLinearGradient(0, 30, 0, height - 30);
  cardGradient.addColorStop(0, '#4f46e5');   // Indigo
  cardGradient.addColorStop(0.5, '#7c3aed'); // Purple
  cardGradient.addColorStop(1, '#2563eb');   // Blue
  ctx.fillStyle = cardGradient;
  ctx.roundRect(8, 8, width - 16, height - 16, 25);
  ctx.fill();

  // Decorative circles (subtle background elements)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(width - 150, -50, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-50, height - 100, 180, 0, Math.PI * 2);
  ctx.fill();

  // Header section with semi-transparent background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.roundRect(40, 40, width - 80, 100, 15);
  ctx.fill();

  // College name
  ctx.fillStyle = 'white';
  ctx.font = 'bold 38px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(collegeName.toUpperCase(), width / 2, 90);

  // "STUDENT ID CARD" text
  ctx.font = 'bold 22px Arial';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText('STUDENT ID CARD', width / 2, 125);

  // Load and draw student image with frame
  try {
    const img = await loadImage(student.studentImage);
    const imgSize = 200;
    const imgX = 70;
    const imgY = 180;
    
    // White background circle for image
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2 + 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw circular image
    ctx.save();
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    // Border around image (white glow)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.stroke();
  } catch (error) {
    console.error('Error loading student image:', error);
    // Draw placeholder if image fails
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(170, 280, 100, 0, Math.PI * 2);
    ctx.fill();
  }

  // Student details section
  const detailsX = 320;
  let detailsY = 200;
  const lineHeight = 48;

  ctx.textAlign = 'left';
  
  // Helper function to draw detail row with card background
  const drawDetail = (label, value, y) => {
    // Semi-transparent card for each detail
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(detailsX - 15, y - 28, 580, 42, 10);
    ctx.fill();

    // Label (lighter white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = 'bold 18px Arial';
    ctx.fillText(label, detailsX, y);
    
    // Value (bright white)
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(value, detailsX + 160, y);
  };

  drawDetail('NAME:', student.name.toUpperCase(), detailsY);
  drawDetail('ADMISSION NO:', student.admissionNo, detailsY += lineHeight);
  drawDetail('CLASS:', `${student.class} - ${student.section}`, detailsY += lineHeight);
  drawDetail('PHONE:', student.phone, detailsY += lineHeight);
  drawDetail('FATHER:', student.fatherName, detailsY += lineHeight);
  drawDetail('DOB:', new Date(student.dob).toLocaleDateString(), detailsY += lineHeight);

  // Generate QR code with student details
  const qrData = JSON.stringify({
    name: student.name,
    admissionNo: student.admissionNo,
    college: collegeName,
    email: student.email
  });

  const qrCodeDataURL = await QRCode.toDataURL(qrData, { 
    width: 130,
    color: {
      dark: '#4f46e5',
      light: '#ffffff'
    }
  });
  const qrImg = await loadImage(qrCodeDataURL);
  
  // QR code background
  const qrSize = 130;
  const qrX = width - qrSize - 80;
  const qrY = height - qrSize - 85;
  
  ctx.fillStyle = 'white';
  ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 15);
  ctx.fill();
  
  // Draw QR code
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // QR code label
  ctx.fillStyle = 'white';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('SCAN FOR DETAILS', qrX + qrSize / 2, qrY + qrSize + 30);

  // Footer with semi-transparent background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.roundRect(80, height - 60, width - 160, 40, 10);
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.font = 'bold 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VALID FOR ACADEMIC YEAR 2024-2025', width / 2, height - 32);

  // Decorative corner accents (white)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  
  // Top left corner
  ctx.beginPath();
  ctx.moveTo(30, 70);
  ctx.lineTo(30, 30);
  ctx.lineTo(70, 30);
  ctx.stroke();

  // Top right corner
  ctx.beginPath();
  ctx.moveTo(width - 70, 30);
  ctx.lineTo(width - 30, 30);
  ctx.lineTo(width - 30, 70);
  ctx.stroke();

  // Bottom left corner
  ctx.beginPath();
  ctx.moveTo(30, height - 70);
  ctx.lineTo(30, height - 30);
  ctx.lineTo(70, height - 30);
  ctx.stroke();

  // Bottom right corner
  ctx.beginPath();
  ctx.moveTo(width - 70, height - 30);
  ctx.lineTo(width - 30, height - 30);
  ctx.lineTo(width - 30, height - 70);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}