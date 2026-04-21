"use client";

import { useState } from "react";
import { UploadCloud, X, FileArchive, FileText, FileCode } from "lucide-react";
import { assignmentsAPI } from "@/lib/api";

export default function UploadModal({ isOpen, onClose, assignment, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !assignment) return null;

  const ALLOWED_EXTENSIONS = ['.zip', '.pdf', '.doc', '.docx', '.rar', '.7z'];

  const validateAndSetFile = (f) => {
    if (!f) return;
    const ext = '.' + f.name.split('.').pop().toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      setFile(f);
      setError(null);
    } else {
      setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      // Build a proper FormData to send the file  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentTitle', assignment.title);

      // Use the courseId stored on the assignment (set by AssignmentHub)
      await assignmentsAPI.submitAssignment(assignment.courseId, formData);

      onUpload(assignment.id, file);
      onClose();
      setFile(null);
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#fcfbf9] rounded-xl shadow-xl w-full max-w-md border border-[#e6e2d8] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-[#e6e2d8]">
          <h3 className="font-serif font-bold text-lg text-[#2d2a26]">Upload Submission</h3>
          <button onClick={onClose} className="text-[#736d65] hover:text-[#2d2a26] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-sm text-[#736d65] mb-1">Assignment</p>
            <p className="font-medium text-[#2d2a26]">{assignment.title}</p>
            <p className="text-xs text-[#736d65] mt-1">{assignment.courseName}</p>
          </div>

          <div 
            className="border-2 border-dashed border-[#e6e2d8] rounded-xl p-8 flex flex-col items-center justify-center bg-white/50 hover:bg-[#fcfaf7] transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload').click()}
          >
            {file ? (
              <div className="flex flex-col items-center text-center">
                <FileArchive className="w-10 h-10 text-emerald-600 mb-3" />
                <p className="text-sm font-medium text-[#2d2a26] truncate max-w-[220px]">{file.name}</p>
                <p className="text-xs text-[#736d65] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-[#a99c85] mb-3" />
                <p className="text-sm font-medium text-[#2d2a26]">Click to upload or drag and drop</p>
                <p className="text-xs text-[#736d65] mt-1">.zip, .pdf, .doc, .docx, .rar, .7z</p>
              </>
            )}
            <input 
              id="file-upload" 
              type="file" 
              accept=".zip,.pdf,.doc,.docx,.rar,.7z" 
              className="hidden" 
              onChange={(e) => validateAndSetFile(e.target.files[0])}
            />
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
          )}

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
              ) : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
