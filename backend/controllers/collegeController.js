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

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // White card overlay
  ctx.fillStyle = 'white';
  ctx.roundRect(40, 40, width - 80, height - 80, 20);
  ctx.fill();

  // Top bar with college name
  const topBarGradient = ctx.createLinearGradient(40, 40, width - 40, 100);
  topBarGradient.addColorStop(0, '#667eea');
  topBarGradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = topBarGradient;
  ctx.roundRect(40, 40, width - 80, 80, [20, 20, 0, 0]);
  ctx.fill();

  // College name
  ctx.fillStyle = 'white';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(collegeName.toUpperCase(), width / 2, 90);

  // "STUDENT ID CARD" text
  ctx.font = 'bold 20px Arial';
  ctx.fillText('STUDENT ID CARD', width / 2, 150);

  // Load and draw student image
  try {
    const img = await loadImage(student.studentImage);
    const imgSize = 180;
    const imgX = 80;
    const imgY = 180;
    
    // Draw circular image
    ctx.save();
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
    ctx.restore();

    // Border around image
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
    ctx.stroke();
  } catch (error) {
    console.error('Error loading student image:', error);
    // Draw placeholder if image fails
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.arc(170, 270, 90, 0, Math.PI * 2);
    ctx.fill();
  }

  // Student details section
  const detailsX = 300;
  let detailsY = 200;
  const lineHeight = 45;

  ctx.textAlign = 'left';
  
  // Helper function to draw detail row
  const drawDetail = (label, value, y) => {
    ctx.fillStyle = '#667eea';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(label, detailsX, y);
    
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.fillText(value, detailsX + 180, y);
  };

  drawDetail('Name:', student.name, detailsY);
  drawDetail('Admission No:', student.admissionNo, detailsY += lineHeight);
  drawDetail('Class:', `${student.class} - ${student.section}`, detailsY += lineHeight);
  drawDetail('Phone:', student.phone, detailsY += lineHeight);
  drawDetail('Father:', student.fatherName, detailsY += lineHeight);
  drawDetail('DOB:', new Date(student.dob).toLocaleDateString(), detailsY += lineHeight);

  // Generate QR code with student details
  const qrData = JSON.stringify({
    name: student.name,
    admissionNo: student.admissionNo,
    college: collegeName,
    email: student.email
  });

  const qrCodeDataURL = await QRCode.toDataURL(qrData, { width: 120 });
  const qrImg = await loadImage(qrCodeDataURL);
  
  // Draw QR code
  const qrSize = 120;
  const qrX = width - qrSize - 80;
  const qrY = height - qrSize - 60;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // QR code label
  ctx.fillStyle = '#666';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Scan for Details', qrX + qrSize / 2, qrY + qrSize + 20);

  // Footer
  ctx.fillStyle = '#667eea';
  ctx.font = 'italic 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Valid for Academic Year 2024-2025', width / 2, height - 30);

  // Decorative corner elements
  ctx.strokeStyle = '#667eea';
  ctx.lineWidth = 3;
  
  // Top left corner
  ctx.beginPath();
  ctx.moveTo(60, 80);
  ctx.lineTo(60, 60);
  ctx.lineTo(80, 60);
  ctx.stroke();

  // Top right corner
  ctx.beginPath();
  ctx.moveTo(width - 80, 60);
  ctx.lineTo(width - 60, 60);
  ctx.lineTo(width - 60, 80);
  ctx.stroke();

  // Bottom left corner
  ctx.beginPath();
  ctx.moveTo(60, height - 80);
  ctx.lineTo(60, height - 60);
  ctx.lineTo(80, height - 60);
  ctx.stroke();

  // Bottom right corner
  ctx.beginPath();
  ctx.moveTo(width - 80, height - 60);
  ctx.lineTo(width - 60, height - 60);
  ctx.lineTo(width - 60, height - 80);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}
