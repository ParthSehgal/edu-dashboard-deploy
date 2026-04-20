"use client";

import { useState } from "react";
import { UploadCloud, X, FileText, FileSpreadsheet } from "lucide-react";

export default function UploadScheduleModal({ isOpen, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    // Check extension
    const allowed = ['.pdf', '.xlsx', '.xls'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (allowed.includes(extension)) {
      setFile(file);
    } else {
      alert("Please upload a .pdf or .xlsx/.xls file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      // We pass some department for demo purposes (ideally taken from user context).
      // If there's an active context, you'd pull this. Let's pass a dummy 'Computer Science' for now.
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      formData.append('department', storedUser.department || 'Computer Science');

      const token = localStorage.getItem('token');
      // In UploadScheduleModal.js
      const response = await fetch(`https://edu-dashboard-deploy.onrender.com/api/schedule/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const responseData = await response.json();

      onUpload(responseData.schedule);
      onClose();
      setFile(null);
    } catch (error) {
      console.error(error);
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const isExcelFile = file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fcfbf9] rounded-xl shadow-xl w-full max-w-md border border-[#e6e2d8] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[#e6e2d8]">
          <h3 className="font-serif font-bold text-lg text-[#2d2a26]">Upload Department Schedule</h3>
          <button onClick={onClose} className="text-[#736d65] hover:text-[#2d2a26] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4 text-[#736d65] text-sm">
            You are uploading the master schedule for your department. This will overwrite the previous schedule visible to all students.
          </div>

          <div
            className="border-2 border-dashed border-[#e6e2d8] rounded-xl p-8 flex flex-col items-center justify-center bg-white/50 hover:bg-[#fcfaf7] transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('schedule-upload').click()}
          >
            {!file ? (
              <>
                <UploadCloud className="w-10 h-10 text-[#a99c85] mb-3" />
                <p className="text-sm font-medium text-[#2d2a26]">Click to upload or drag and drop</p>
                <p className="text-xs text-[#736d65] mt-1">.pdf, .xlsx, .xls only</p>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                {isExcelFile ? (
                  <FileSpreadsheet className="w-10 h-10 text-green-600 mb-3" />
                ) : (
                  <FileText className="w-10 h-10 text-red-500 mb-3" />
                )}
                <p className="text-sm font-medium text-[#2d2a26] truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-[#736d65] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}

            <input
              id="schedule-upload"
              type="file"
              accept=".pdf,.xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#736d65] hover:text-[#2d2a26] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="bg-[#2d2a26] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#1a1816] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Set Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
