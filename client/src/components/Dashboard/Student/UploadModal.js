"use client";

import { useState } from "react";
import { UploadCloud, X } from "lucide-react";

export default function UploadModal({ isOpen, onClose, assignment, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen || !assignment) return null;

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
    } else {
      alert("Please upload a .zip file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setIsUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUploading(false);
      onUpload(assignment.id, file);
      onClose();
      setFile(null);
    }, 1500);
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
            <UploadCloud className="w-10 h-10 text-[#a99c85] mb-3" />
            {file ? (
              <p className="text-sm font-medium text-[#2d2a26]">{file.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-[#2d2a26]">Click to upload or drag and drop</p>
                <p className="text-xs text-[#736d65] mt-1">.zip files only</p>
              </>
            )}
            <input 
              id="file-upload" 
              type="file" 
              accept=".zip" 
              className="hidden" 
              onChange={(e) => setFile(e.target.files[0])}
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
              ) : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
