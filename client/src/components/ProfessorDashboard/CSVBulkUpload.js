"use client";
import React, { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

const CSVBulkUpload = ({ courses = [], onBulkUpload }) => {
  const fileInputRef = useRef(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMSG, setErrorMSG] = useState("");
  const [successMSG, setSuccessMSG] = useState("");

  const handleExportTemplate = () => {
    if (!selectedCourse) {
      setErrorMSG("Please select a course to export the grading template.");
      return;
    }
    setErrorMSG("");
    setSuccessMSG("");

    // Generate a simple template using XLSX
    const ws = XLSX.utils.json_to_sheet([
      { studentId: "S101", name: "John Doe", quiz1: "", midsem: "", endsem: "" },
      { studentId: "S102", name: "Jane Smith", quiz1: "", midsem: "", endsem: "" }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grades");
    XLSX.writeFile(wb, `${selectedCourse}_Grading_Template.csv`);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedCourse) {
      setErrorMSG("Please select a course before uploading.");
      fileInputRef.current.value = "";
      return;
    }

    setIsProcessing(true);
    setErrorMSG("");
    setSuccessMSG("");

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          throw new Error("Uploaded file is empty.");
        }

        // Simulate API Processing Time
        setTimeout(() => {
          onBulkUpload(selectedCourse, data);
          setSuccessMSG(`Successfully processed ${data.length} records!`);
          setIsProcessing(false);
          fileInputRef.current.value = "";
        }, 1000);

      } catch (err) {
        setErrorMSG("Failed to parse file. Ensure it is a valid CSV/Excel file.");
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="w-5 h-5 text-green-600" />
        <h2 className="text-xl font-bold text-gray-800">CSV Bulk Upload</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Download the template, fill in the component scores, and upload it to update grades for the entire class at once.
      </p>

      {errorMSG && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">{errorMSG}</div>}
      {successMSG && <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100 font-medium">{successMSG}</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-colors"
          >
            <option value="" disabled>Choose a course to manage</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.id}: {c.courseName}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportTemplate}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            <Download className="w-4 h-4" />
            Export Template
          </button>

          <div className="flex-1 relative">
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isProcessing}
            />
            <button
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 ${
                isProcessing
                  ? "bg-indigo-400 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Grades
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVBulkUpload;
