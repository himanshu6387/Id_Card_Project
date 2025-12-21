import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentImage: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  aadhar: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  fatherName: {
    type: String,
    required: true
  },
  motherName: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  admissionNo: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collegeName: {
    type: String,
    required: true
  },
  linkId: {
    type: String,
    required: true
  }
}, {timestamps: true});

const Student = mongoose.model('Student',studentSchema)

export default Student