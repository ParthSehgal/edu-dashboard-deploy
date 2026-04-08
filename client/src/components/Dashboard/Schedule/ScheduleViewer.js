"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function ScheduleViewer({ schedule }) {
  const [excelData, setExcelData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (schedule.fileType === "excel" && schedule.fileBuffer) {
      parseExcel(schedule.fileBuffer);
    }
  }, [schedule]);

  const parseExcel = async (buffer) => {
    setLoading(true);
    try {
      // In a real application, if they passed a URL instead of buffer,
      // we would do: const res = await fetch(fileUrl); const buf = await res.arrayBuffer();
      
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON array, parsing as formatting array of arrays
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setExcelData(jsonData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to process Excel document. Please ensure it's a valid format.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-t-[#2d2a26] border-[#e6e2d8] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-red-500 font-medium">
        {error}
      </div>
    );
  }

  // --- PDF VIEWER ---
  if (schedule.fileType === "pdf") {
    return (
      <div className="w-full h-[75vh] bg-[#2d2a26] flex flex-col relative">
        <div className="bg-[#1a1816] text-white/70 py-2 px-4 text-xs font-serif flex justify-between">
           <span>Master Schedule (PDF)</span>
           <span>Uploaded by: {schedule.uploadedBy}</span>
        </div>
        <iframe 
          src={`${schedule.fileUrl}#view=FitH`} 
          className="w-full flex-1 border-0" 
          title="Schedule PDF"
        />
      </div>
    );
  }

  // --- EXCEL VIEWER ---
  if (schedule.fileType === "excel" && excelData) {
    return (
      <div className="w-full h-full p-6">
        <div className="flex justify-between items-center mb-6 border-b border-[#e6e2d8] pb-2">
          <h3 className="font-serif font-bold text-lg text-[#2d2a26]">Master Schedule</h3>
          <span className="text-xs text-[#736d65]">Uploaded by: {schedule.uploadedBy}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#4a4744] border-collapse bg-white">
            <tbody className="divide-y divide-[#e6e2d8]">
              {excelData.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`border-b border-[#e6e2d8] ${rowIndex === 0 ? 'bg-[#fcfbf9] font-bold text-[#2d2a26] uppercase' : 'hover:bg-[#fcfaf7]'}`}
                >
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className={`px-4 py-3 border-r border-[#e6e2d8] ${rowIndex === 0 ? 'font-serif' : 'whitespace-pre-wrap'} ${!cell ? 'bg-[#faf9f7]' : ''}`}
                    >
                      {cell || ""}
                    </td>
                  ))}
                  {/* Handle empty trailing cells if rows have varying lengths */}
                  {row.length === 0 && <td className="px-4 py-3"></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
