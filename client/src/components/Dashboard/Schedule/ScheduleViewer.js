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
  if (schedule.fileType === "excel" && schedule.parsedData) {
    const excelData = schedule.parsedData;
    const headers = excelData[0] || [];
    const rows = excelData.slice(1);

    return (
      <div className="w-full h-full bg-white">
        <style jsx>{`
          .schedule-container::-webkit-scrollbar {
            height: 8px;
          }
          .schedule-container::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          .schedule-container::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          .day-col {
            min-width: 150px;
            position: sticky;
            left: 0;
            z-index: 20;
            background-color: white;
            border-right: 1px solid #e2e8f0;
          }
          .time-slot-col {
            min-width: 160px;
          }
        `}</style>
        
        <div className="flex justify-between items-center mb-0 p-6 border-b border-[#e6e2d8]">
          <h3 className="font-serif font-bold text-lg text-[#2d2a26]">Master Schedule</h3>
          <span className="text-xs text-[#736d65]">Uploaded by: {schedule.uploadedBy}</span>
        </div>
        
        <div className="schedule-container overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white">
                {headers.map((h, i) => (
                  <th key={i} className={`${i===0?'day-col':'time-slot-col'} p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => {
                // If entire row is empty, skip
                if (!row || row.length === 0) return null;
                
                return (
                  <tr key={rIdx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    {/* The first cell is the Row Header (Day) */}
                    <td className="day-col p-4 font-medium text-slate-700">
                      <div className="font-bold">{row[0] || ""}</div>
                    </td>
                    
                    {/* The remaining cells are the time slots */}
                    {headers.slice(1).map((_, cIdx) => {
                      const colIndexInRow = cIdx + 1;
                      const cell = row[colIndexInRow];
                      
                      if (!cell) {
                        return <td key={cIdx} className="p-2 align-top"></td>;
                      }

                      const cellText = cell.toString().split('\\n').join('\\n').split('\n');

                      // Alternate colors based on index for variety
                      const colors = ['orange', 'blue', 'green', 'indigo'];
                      const color = colors[(rIdx + cIdx) % colors.length];

                      return (
                        <td key={cIdx} className="p-2 align-top">
                          <div className={`bg-${color}-50 border border-${color}-100 p-3 rounded-lg text-xs`} data-purpose="class-card">
                            <p className={`font-bold text-${color}-800`}>{cellText[0]}</p>
                            {cellText[1] && <p className={`text-${color}-700`}>{cellText[1]}</p>}
                            {cellText[2] && <p className={`mt-1 text-${color}-600 italic`}>{cellText[2]}</p>}
                            {cellText.length > 3 && cellText.slice(3).map((line, i) => <p key={i} className={`text-${color}-600`}>{line}</p>)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
