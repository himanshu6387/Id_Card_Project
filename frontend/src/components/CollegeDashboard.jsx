import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';

const CollegeDashboard = () => {
  const [students, setStudents] = useState([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingIDCards, setGeneratingIDCards] = useState(false);
  const [showIDCardPreview, setShowIDCardPreview] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // const response = await axios.get('http://localhost:5000/api/college/students');
      const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const generateLink = async () => {
    setLoading(true);
    try {
      // const response = await axios.post('http://localhost:5000/api/college/generate-link');
      const response = await axios.post('https://data-gathering-project-backendd.onrender.com/api/college/generate-link');
      setGeneratedLink(response.data.link);
      toast.success('Student data collection link generated!');
    } catch (error) {
      toast.error('Failed to generate link');
    }
    setLoading(false);
  };

  const downloadExcel = async () => {
    try {
      // const response = await axios.get('http://localhost:5000/api/college/download-excel', {
      const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/download-excel', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user.collegeName}_students.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel file');
    }
  };

  const downloadImages = async () => {
    try {
      // const response = await axios.get('http://localhost:5000/api/college/download-images', {
      const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/download-images', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user.collegeName}_student_images.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Images zip file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download images');
    }
  };

  // NEW: Generate ID Cards
  const generateIDCards = async () => {
    if (students.length === 0) {
      toast.error('No students found to generate ID cards');
      return;
    }

    setGeneratingIDCards(true);
    try {
      const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/generate-id-cards', {
      // const response = await axios.get('http://localhost:5000/api/college/generate-id-cards', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${user.collegeName}_ID_Cards.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success(`${students.length} ID cards generated successfully!`);
    } catch (error) {
      toast.error('Failed to generate ID cards');
    }
    setGeneratingIDCards(false);
  };

  const previewIDCard = (student) => {
    setPreviewStudent(student);
    setShowIDCardPreview(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.collegeName}</h1>
          <p className="text-gray-600">College Dashboard - Manage your student data</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">ID Cards Ready</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{students.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Links</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{generatedLink ? 1 : 0}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Downloads</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">4</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={generateLink}
              disabled={loading}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="font-semibold text-lg">Generate Link</span>
              <span className="text-sm opacity-90">Student Registration</span>
            </button>

            <button
              onClick={downloadExcel}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-lg">Download Excel</span>
              <span className="text-sm opacity-90">Student Data</span>
            </button>

            <button
              onClick={downloadImages}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-lg">Download Images</span>
              <span className="text-sm opacity-90">ZIP File</span>
            </button>

            {/* NEW: Generate ID Cards Button */}
            <button
              onClick={generateIDCards}
              disabled={generatingIDCards || students.length === 0}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {generatingIDCards && (
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <span className="font-semibold text-lg">Generate ID Cards</span>
              <span className="text-sm opacity-90">
                {generatingIDCards ? 'Generating...' : `${students.length} Cards Ready`}
              </span>
            </button>
          </div>

          {generatedLink && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Generated Student Form Link:
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 px-4 py-3 bg-white border border-indigo-300 rounded-l-xl focus:outline-none text-gray-700"
                />
                <button
                  onClick={() => copyToClipboard(generatedLink)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-r-xl font-semibold transition-colors duration-300 flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Students List */}
        <div className="bg-white shadow-lg rounded-2xl">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Students List ({students.length})</h2>
              <p className="text-gray-600 text-sm mt-1">Manage and view all registered students</p>
            </div>
          </div>
          
          {students.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No students yet</h3>
              <p className="mt-2 text-gray-500">Generate a link to start collecting student data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Class/Section</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admission No.</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={student.studentImage}
                          alt={student.name}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.fatherName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.class} - {student.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {student.admissionNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => previewIDCard(student)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center space-x-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Preview ID</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ID Card Preview Modal */}
      {showIDCardPreview && previewStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Student ID Card Preview</h2>
                <p className="text-indigo-100">{previewStudent.name}</p>
              </div>
              <button
                onClick={() => setShowIDCardPreview(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8">
              {/* ID Card Preview */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-3xl shadow-2xl">
                <div className="bg-white rounded-2xl p-8 shadow-xl">
                  {/* Header */}
                  <div className="text-center mb-6 pb-4 border-b-2 border-indigo-600">
                    <h3 className="text-3xl font-bold text-indigo-600">{user.collegeName}</h3>
                    <p className="text-lg font-semibold text-gray-700 mt-2">STUDENT ID CARD</p>
                  </div>

                  <div className="flex gap-8">
                    {/* Left: Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={previewStudent.studentImage}
                        alt={previewStudent.name}
                        className="w-48 h-48 rounded-full object-cover ring-4 ring-indigo-500"
                      />
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">Name:</span>
                        <span className="text-gray-900 font-semibold">{previewStudent.name}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">Admission No:</span>
                        <span className="text-gray-900 font-mono">{previewStudent.admissionNo}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">Class:</span>
                        <span className="text-gray-900">{previewStudent.class} - {previewStudent.section}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">Phone:</span>
                        <span className="text-gray-900">{previewStudent.phone}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">Father:</span>
                        <span className="text-gray-900">{previewStudent.fatherName}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-bold text-indigo-600 w-32">DOB:</span>
                        <span className="text-gray-900">{new Date(previewStudent.dob).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t-2 border-indigo-600 text-center">
                    <p className="text-gray-600 italic">Valid for Academic Year 2024-2025</p>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This is a preview. Download all ID cards as ZIP to get high-quality printable versions with QR codes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowIDCardPreview(false)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CollegeDashboard;















// import React, { useState, useEffect } from 'react';
// import toast from 'react-hot-toast';
// import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';
// import Header from './Header';
// import Footer from './Footer';

// const CollegeDashboard = () => {
//   const [students, setStudents] = useState([]);
//   const [generatedLink, setGeneratedLink] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   const fetchStudents = async () => {
//     try {
//       const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/students');
//       setStudents(response.data);
//     } catch (error) {
//       toast.error('Failed to fetch students');
//     }
//   };

//   const generateLink = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post('https://data-gathering-project-backendd.onrender.com/api/college/generate-link');
//       setGeneratedLink(response.data.link);
//       toast.success('Student data collection link generated!');
//     } catch (error) {
//       toast.error('Failed to generate link');
//     }
//     setLoading(false);
//   };

//   const downloadExcel = async () => {
//     try {
//       const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/download-excel', {
//         responseType: 'blob',
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${user.collegeName}_students.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
      
//       toast.success('Excel file downloaded successfully!');
//     } catch (error) {
//       toast.error('Failed to download Excel file');
//     }
//   };

//   const downloadImages = async () => {
//     try {
//       const response = await axios.get('https://data-gathering-project-backendd.onrender.com/api/college/download-images', {
//         responseType: 'blob',
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${user.collegeName}_student_images.zip`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
      
//       toast.success('Images zip file downloaded successfully!');
//     } catch (error) {
//       toast.error('Failed to download images');
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     toast.success('Link copied to clipboard!');
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50">
//       <Header />

//       <div className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8">
//         {/* Header Section */}
//         <div className="mb-8 animate-fade-in-up">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.collegeName}</h1>
//           <p className="text-gray-600">Manage student data and generate reports</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in-up">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-indigo-100 text-sm font-medium">Total Students</p>
//                 <p className="text-4xl font-bold mt-2">{students.length}</p>
//               </div>
//               <div className="bg-white/20 p-4 rounded-xl">
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-green-100 text-sm font-medium">This Week</p>
//                 <p className="text-4xl font-bold mt-2">+{Math.floor(students.length * 0.3)}</p>
//               </div>
//               <div className="bg-white/20 p-4 rounded-xl">
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
//                 <p className="text-4xl font-bold mt-2">98%</p>
//               </div>
//               <div className="bg-white/20 p-4 rounded-xl">
//                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Actions Card */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
//           <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <button
//               onClick={generateLink}
//               disabled={loading}
//               className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//               </svg>
//               <span>{loading ? 'Generating...' : 'Generate Link'}</span>
//             </button>
            
//             <button
//               onClick={downloadExcel}
//               className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//               </svg>
//               <span>Download Excel</span>
//             </button>
            
//             <button
//               onClick={downloadImages}
//               className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center justify-center space-x-2"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               <span>Download Images</span>
//             </button>
//           </div>

//           {generatedLink && (
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 animate-fade-in-up">
//               <label className="block text-sm font-semibold text-gray-700 mb-3">
//                 📋 Generated Student Form Link:
//               </label>
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <input
//                   type="text"
//                   value={generatedLink}
//                   readOnly
//                   className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none text-sm"
//                 />
//                 <button
//                   onClick={() => copyToClipboard(generatedLink)}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
//                   </svg>
//                   <span>Copy Link</span>
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Students Table */}
//         <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up" style={{animationDelay: '0.4s'}}>
//           <div className="px-6 py-5 border-b border-gray-200">
//             <h2 className="text-2xl font-bold text-gray-900">Students List</h2>
//             <p className="text-gray-600 text-sm mt-1">View all registered students</p>
//           </div>
          
//           {students.length === 0 ? (
//             <div className="text-center py-16">
//               <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//               </svg>
//               <h3 className="mt-4 text-lg font-medium text-gray-900">No students yet</h3>
//               <p className="mt-2 text-gray-500">Generate a link to start collecting student data</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Student
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Class/Section
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Admission No.
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Contact
//                     </th>
//                     <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Submitted
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {students.map((student) => (
//                     <tr key={student._id} className="hover:bg-gray-50 transition-colors duration-200">
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center">
//                           <img
//                             src={student.studentImage}
//                             alt={student.name}
//                             className="h-12 w-12 rounded-full object-cover border-2 border-indigo-200"
//                           />
//                           <div className="ml-4">
//                             <div className="text-sm font-semibold text-gray-900">{student.name}</div>
//                             <div className="text-sm text-gray-500">{student.email}</div>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{student.class}</div>
//                         <div className="text-sm text-gray-500">Section {student.section}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
//                           {student.admissionNo}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">{student.phone}</div>
//                         <div className="text-sm text-gray-500">{student.fatherName}</div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {new Date(student.createdAt).toLocaleDateString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// };

// export default CollegeDashboard;