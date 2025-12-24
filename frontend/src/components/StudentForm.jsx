import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../utils/cropImage';

const StudentForm = () => {
  const { linkId } = useParams();
  const [linkDetails, setLinkDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // Image Editor States
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropShape, setCropShape] = useState('round');
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    class: '',
    section: '',
    aadhar: '',
    phone: '',
    fatherName: '',
    motherName: '',
    dob: '',
    address: '',
    admissionNo: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLinkDetails();
  }, [linkId]);

  const fetchLinkDetails = async () => {
    try {
      const response = await axios.get(`https://id-card-project-2.onrender.com/api/student/link/${linkId}`);
      setLinkDetails(response.data);
    } catch (error) {
      toast.error('Invalid or expired link');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result);
        setShowImageEditor(true);
        setBgRemoved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleRemoveBackground = async () => {
    setRemovingBg(true);
    try {
      const response = await axios.post('https://id-card-project-2.onrender.com/api/student/remove-background', {
        image: originalImage
      });
      
      setOriginalImage(response.data.imageUrl);
      setBgRemoved(true);
      toast.success('Background removed successfully!');
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('Failed to remove background');
    }
    setRemovingBg(false);
  };

  const handleCropComplete = async () => {
    try {
      const croppedImage = await getCroppedImg(
        originalImage,
        croppedAreaPixels,
        cropShape === 'round' ? 0 : 90
      );
      
      setImagePreview(croppedImage);
      
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const file = new File([blob], 'student-photo.jpg', { type: 'image/jpeg' });
      setImageFile(file);
      
      setShowImageEditor(false);
      toast.success('Image cropped successfully!');
    } catch (error) {
      console.error('Crop error:', error);
      toast.error('Failed to crop image');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!imageFile) newErrors.studentImage = 'Student image is required';
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
      if (!formData.motherName) newErrors.motherName = "Mother's name is required";
      if (!formData.aadhar) newErrors.aadhar = 'Aadhar number is required';
      else if (formData.aadhar.length !== 12) newErrors.aadhar = 'Aadhar must be 12 digits';
    }
    
    if (step === 2) {
      if (!formData.class) newErrors.class = 'Class is required';
      if (!formData.section) newErrors.section = 'Section is required';
      if (!formData.admissionNo) newErrors.admissionNo = 'Admission number is required';
    }
    
    if (step === 3) {
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      else if (formData.phone.length !== 10) newErrors.phone = 'Phone must be 10 digits';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.address) newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      toast.error('Please fill all required fields correctly');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      submitData.append('studentImage', imageFile);
      submitData.append('name', formData.name);
      submitData.append('class', formData.class);
      submitData.append('section', formData.section);
      submitData.append('aadhar', formData.aadhar);
      submitData.append('phone', formData.phone);
      submitData.append('fatherName', formData.fatherName);
      submitData.append('motherName', formData.motherName);
      submitData.append('dob', formData.dob);
      submitData.append('address', formData.address);
      submitData.append('admissionNo', formData.admissionNo);
      submitData.append('email', formData.email);
      
      await axios.post(
        `https://id-card-project-2.onrender.com/api/student/submit/${linkId}`,
        submitData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      toast.success('Student data submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit student data');
    }
    
    setLoading(false);
  };

  if (!linkDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Success!</h2>
          <p className="text-gray-600 text-lg mb-2">
            Your registration has been submitted successfully.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for registering with <span className="font-semibold text-indigo-600">{linkDetails.collegeName}</span>
          </p>
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-gray-600">
              You will receive a confirmation email shortly with your registration details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 transform hover:rotate-12 transition-transform duration-300">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{linkDetails.collegeName}</h1>
          <p className="text-lg text-gray-600">Student Registration Form</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white transform scale-110' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                    currentStep > step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>Personal Info</span>
            <span>Academic Details</span>
            <span>Contact Info</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Academic Details'}
              {currentStep === 3 && 'Contact Information'}
            </h2>
            <p className="text-indigo-100 mt-1">Step {currentStep} of {totalSteps}</p>
          </div>

          <form onSubmit={onSubmit} className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Image Upload */}
                <div className="flex flex-col items-center mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Student Photograph *
                  </label>
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-indigo-500 transition-all duration-300">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-500">Upload Photo</p>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => setShowImageEditor(true)}
                      className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center space-x-1"
                    >
                      <span>✏️</span>
                      <span>Edit Image</span>
                    </button>
                  )}
                  {errors.studentImage && <p className="text-red-500 text-sm mt-2">{errors.studentImage}</p>}
                  <p className="text-xs text-gray-500 mt-3">PNG, JPG up to 5MB</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* DOB */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>

                {/* Parent Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name *</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter father's name"
                    />
                    {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name *</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter mother's name"
                    />
                    {errors.motherName && <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>}
                  </div>
                </div>

                {/* Aadhar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhar Number *</label>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter 12-digit Aadhar number"
                    maxLength="12"
                  />
                  {errors.aadhar && <p className="text-red-500 text-sm mt-1">{errors.aadhar}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Academic Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 10th, B.Tech"
                    />
                    {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section *</label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., A, B, CS"
                    />
                    {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admission Number *</label>
                  <input
                    type="text"
                    name="admissionNo"
                    value={formData.admissionNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter admission number"
                  />
                  {errors.admissionNo && <p className="text-red-500 text-sm mt-1">{errors.admissionNo}</p>}
                </div>
              </div>
            )}

            {/* Step 3: Contact Info */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in-up">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="student@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Residential Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Enter complete residential address"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                {/* Review Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Name:</p>
                      <p className="font-semibold text-gray-900">{formData.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Admission No:</p>
                      <p className="font-semibold text-gray-900">{formData.admissionNo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Class:</p>
                      <p className="font-semibold text-gray-900">{formData.class || '-'} - {formData.section || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Email:</p>
                      <p className="font-semibold text-gray-900 truncate">{formData.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg ml-auto"
                >
                  <span>Next Step</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg ml-auto"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Submit Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Image Editor Modal */}
      {showImageEditor && originalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Edit Your Photo</h2>
              <p className="text-indigo-100">Crop and enhance your image</p>
            </div>

            <div className="p-8">
              {/* Crop Shape Selector */}
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  type="button"
                  onClick={() => setCropShape('round')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    cropShape === 'round'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🔵 Circle Crop
                </button>
                <button
                  type="button"
                  onClick={() => setCropShape('rect')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    cropShape === 'rect'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ⬜ Square Crop
                </button>
              </div>

              {/* Background Removal */}
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  disabled={removingBg || bgRemoved}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {removingBg ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Removing Background...</span>
                    </>
                  ) : bgRemoved ? (
                    <>✅ Background Removed</>
                  ) : (
                    <>🎨 Remove Background</>
                  )}
                </button>
              </div>

              {/* Cropper */}
              <div className="relative w-full h-96 bg-gray-900 rounded-2xl overflow-hidden mb-6">
                <Cropper
                  image={originalImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape={cropShape}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Zoom Slider */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowImageEditor(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropComplete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700"
                >
                  ✂️ Crop & Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForm;

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-hot-toast';

// const StudentForm = () => {
//   const { linkId } = useParams();
//   const [linkDetails, setLinkDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [imageFile, setImageFile] = useState(null);
//   const [currentStep, setCurrentStep] = useState(1);
//   const totalSteps = 3;
  
//   const [formData, setFormData] = useState({
//     name: '',
//     class: '',
//     section: '',
//     aadhar: '',
//     phone: '',
//     fatherName: '',
//     motherName: '',
//     dob: '',
//     address: '',
//     admissionNo: '',
//     email: ''
//   });

//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     fetchLinkDetails();
//   }, [linkId]);

//   const fetchLinkDetails = async () => {
//     try {
//       const response = await axios.get(`https://data-gathering-project-backendd.onrender.com/api/student/link/${linkId}`);
//       setLinkDetails(response.data);
//     } catch (error) {
//       toast.error('Invalid or expired link');
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5000000) {
//         toast.error('Image size should be less than 5MB');
//         return;
//       }
//       setImageFile(file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleInputChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
    
//     if (step === 1) {
//       if (!imageFile) newErrors.studentImage = 'Student image is required';
//       if (!formData.name) newErrors.name = 'Name is required';
//       if (!formData.dob) newErrors.dob = 'Date of birth is required';
//       if (!formData.fatherName) newErrors.fatherName = "Father's name is required";
//       if (!formData.motherName) newErrors.motherName = "Mother's name is required";
//       if (!formData.aadhar) newErrors.aadhar = 'Aadhar number is required';
//     }
    
//     if (step === 2) {
//       if (!formData.class) newErrors.class = 'Class is required';
//       if (!formData.section) newErrors.section = 'Section is required';
//       if (!formData.admissionNo) newErrors.admissionNo = 'Admission number is required';
//     }
    
//     if (step === 3) {
//       if (!formData.phone) newErrors.phone = 'Phone number is required';
//       if (!formData.email) newErrors.email = 'Email is required';
//       if (!formData.address) newErrors.address = 'Address is required';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const nextStep = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       toast.error('Please fill all required fields');
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) setCurrentStep(currentStep - 1);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateStep(currentStep)) {
//       toast.error('Please fill all required fields');
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       // Create FormData object
//       const submitData = new FormData();
      
//       // Append image file
//       submitData.append('studentImage', imageFile);
      
//       // Append all other fields
//       submitData.append('name', formData.name);
//       submitData.append('class', formData.class);
//       submitData.append('section', formData.section);
//       submitData.append('aadhar', formData.aadhar);
//       submitData.append('phone', formData.phone);
//       submitData.append('fatherName', formData.fatherName);
//       submitData.append('motherName', formData.motherName);
//       submitData.append('dob', formData.dob);
//       submitData.append('address', formData.address);
//       submitData.append('admissionNo', formData.admissionNo);
//       submitData.append('email', formData.email);
      
//       await axios.post(`https://data-gathering-project-backendd.onrender.com/api/student/submit/${linkId}`, submitData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
      
//       toast.success('Student data submitted successfully!');
//       setSubmitted(true);
//     } catch (error) {
//       console.error('Submission error:', error);
//       toast.error(error.response?.data?.message || 'Failed to submit student data');
//     }
    
//     setLoading(false);
//   };

//   if (!linkDetails) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
//           <p className="mt-4 text-gray-600 font-medium">Loading form...</p>
//         </div>
//       </div>
//     );
//   }

//   if (submitted) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
//         <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up">
//           <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
//             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
//             </svg>
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900 mb-4">Success!</h2>
//           <p className="text-gray-600 text-lg mb-2">
//             Your registration has been submitted successfully.
//           </p>
//           <p className="text-gray-500 text-sm mb-6">
//             Thank you for registering with <span className="font-semibold text-indigo-600">{linkDetails.collegeName}</span>
//           </p>
//           <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
//             <p className="text-sm text-gray-600">
//               You will receive a confirmation email shortly with your registration details.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8 animate-fade-in-up">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-4 transform hover:rotate-12 transition-transform duration-300">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//             </svg>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">{linkDetails.collegeName}</h1>
//           <p className="text-lg text-gray-600">Student Registration Form</p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-8 animate-fade-in-up">
//           <div className="flex items-center justify-between mb-2">
//             {[1, 2, 3].map((step) => (
//               <div key={step} className="flex items-center flex-1">
//                 <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
//                   currentStep >= step 
//                     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white transform scale-110' 
//                     : 'bg-gray-200 text-gray-600'
//                 }`}>
//                   {currentStep > step ? (
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                   ) : (
//                     step
//                   )}
//                 </div>
//                 {step < 3 && (
//                   <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
//                     currentStep > step ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
//                   }`}></div>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="flex justify-between text-xs text-gray-600 font-medium">
//             <span>Personal Info</span>
//             <span>Academic Details</span>
//             <span>Contact Info</span>
//           </div>
//         </div>

//         {/* Form Card */}
//         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
//           <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
//             <h2 className="text-2xl font-bold text-white">
//               {currentStep === 1 && 'Personal Information'}
//               {currentStep === 2 && 'Academic Details'}
//               {currentStep === 3 && 'Contact Information'}
//             </h2>
//             <p className="text-indigo-100 mt-1">Step {currentStep} of {totalSteps}</p>
//           </div>

//           <form onSubmit={onSubmit} className="p-8">
//             {/* Step 1: Personal Information */}
//             {currentStep === 1 && (
//               <div className="space-y-6 animate-fade-in-up">
//                 {/* Image Upload */}
//                 <div className="flex flex-col items-center mb-8">
//                   <label className="block text-sm font-semibold text-gray-700 mb-4">
//                     Student Photograph *
//                   </label>
//                   <div className="relative">
//                     <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-indigo-500 transition-all duration-300">
//                       {imagePreview ? (
//                         <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
//                       ) : (
//                         <div className="text-center">
//                           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                           </svg>
//                           <p className="mt-2 text-sm text-gray-500">Upload Photo</p>
//                         </div>
//                       )}
//                     </div>
//                     <label className="absolute bottom-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 shadow-lg">
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
//                       </svg>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         className="hidden"
//                       />
//                     </label>
//                   </div>
//                   {errors.studentImage && <p className="text-red-500 text-sm mt-2">{errors.studentImage}</p>}
//                   <p className="text-xs text-gray-500 mt-3">PNG, JPG up to 5MB</p>
//                 </div>

//                 {/* Name */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="Enter full name"
//                   />
//                   {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                 </div>

//                 {/* DOB */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
//                   <input
//                     type="date"
//                     name="dob"
//                     value={formData.dob}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                   />
//                   {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
//                 </div>

//                 {/* Parent Names */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name *</label>
//                     <input
//                       type="text"
//                       name="fatherName"
//                       value={formData.fatherName}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                       placeholder="Enter father's name"
//                     />
//                     {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Mother's Name *</label>
//                     <input
//                       type="text"
//                       name="motherName"
//                       value={formData.motherName}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                       placeholder="Enter mother's name"
//                     />
//                     {errors.motherName && <p className="text-red-500 text-sm mt-1">{errors.motherName}</p>}
//                   </div>
//                 </div>

//                 {/* Aadhar */}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Aadhar Number *</label>
//                   <input
//                     type="text"
//                     name="aadhar"
//                     value={formData.aadhar}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="Enter 12-digit Aadhar number"
//                     maxLength="12"
//                   />
//                   {errors.aadhar && <p className="text-red-500 text-sm mt-1">{errors.aadhar}</p>}
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Academic Details */}
//             {currentStep === 2 && (
//               <div className="space-y-6 animate-fade-in-up">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
//                     <input
//                       type="text"
//                       name="class"
//                       value={formData.class}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                       placeholder="e.g., 10th, B.Tech"
//                     />
//                     {errors.class && <p className="text-red-500 text-sm mt-1">{errors.class}</p>}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">Section *</label>
//                     <input
//                       type="text"
//                       name="section"
//                       value={formData.section}
//                       onChange={handleInputChange}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                       placeholder="e.g., A, B, CS"
//                     />
//                     {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Admission Number *</label>
//                   <input
//                     type="text"
//                     name="admissionNo"
//                     value={formData.admissionNo}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="Enter admission number"
//                   />
//                   {errors.admissionNo && <p className="text-red-500 text-sm mt-1">{errors.admissionNo}</p>}
//                 </div>
//               </div>
//             )}

//             {/* Step 3: Contact Info */}
//             {currentStep === 3 && (
//               <div className="space-y-6 animate-fade-in-up">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="10-digit mobile number"
//                     maxLength="10"
//                   />
//                   {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
//                     placeholder="student@example.com"
//                   />
//                   {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Residential Address *</label>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     rows={4}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
//                     placeholder="Enter complete residential address"
//                   />
//                   {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
//                 </div>

//                 {/* Review Summary */}
//                 <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Information</h3>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-600 mb-1">Name:</p>
//                       <p className="font-semibold text-gray-900">{formData.name || '-'}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 mb-1">Admission No:</p>
//                       <p className="font-semibold text-gray-900">{formData.admissionNo || '-'}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 mb-1">Class:</p>
//                       <p className="font-semibold text-gray-900">{formData.class || '-'} - {formData.section || '-'}</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-600 mb-1">Email:</p>
//                       <p className="font-semibold text-gray-900 truncate">{formData.email || '-'}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Navigation Buttons */}
//             <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
//               {currentStep > 1 ? (
//                 <button
//                   type="button"
//                   onClick={prevStep}
//                   className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
//                   </svg>
//                   <span>Previous</span>
//                 </button>
//               ) : (
//                 <div></div>
//               )}

//               {currentStep < totalSteps ? (
//                 <button
//                   type="button"
//                   onClick={nextStep}
//                   className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg ml-auto"
//                 >
//                   <span>Next Step</span>
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               ) : (
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg ml-auto"
//                 >
//                   {loading ? (
//                     <>
//                       <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                       </svg>
//                       <span>Submitting...</span>
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <span>Submit Registration</span>
//                     </>
//                   )}
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentForm;