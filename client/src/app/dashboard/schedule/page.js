"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import ScheduleViewer from "@/components/Dashboard/Schedule/ScheduleViewer";
import UploadScheduleModal from "@/components/Dashboard/Schedule/UploadScheduleModal";
import { Upload } from "lucide-react";

export default function SchedulePage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [user, setUser] = useState({
    name: "Loading...",
    department: "Unknown",
    isCR: false,
    role: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(prev => ({ ...prev, ...JSON.parse(storedUser) }));
    }
  }, []);

  // Mocking the loaded schedule data
  const [scheduleData, setScheduleData] = useState({
    fileUrl: null, // "https://example.com/schedule.pdf" for PDF test
    fileType: null, // 'pdf' or 'excel'
    uploadedBy: null,
    // When we parse excel, we keep raw buffer/blob or just parse it directly on upload
  });

  const handleScheduleUpload = (backendScheduleData) => {
    setScheduleData({
      fileUrl: backendScheduleData.fileUrl,
      fileType: backendScheduleData.fileType,
      parsedData: backendScheduleData.parsedData,
      uploadedBy: backendScheduleData.uploadedBy?.name || user.name,
      uploadedAt: backendScheduleData.uploadedAt
    });
  };

  useEffect(() => {
    if (user.department) {
      const fetchSchedule = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:5000/api/schedule?department=${user.department}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            handleScheduleUpload(data);
          }
        } catch(e) { console.error("Error fetching schedule", e); }
      };
      fetchSchedule();
    }
  }, [user.department]);

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto bg-[#fcfaf7] min-h-[calc(100vh-4rem)] p-4 md:p-8">
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#e6e2d8] pb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#2d2a26] uppercase tracking-widest">
              Class Schedule
            </h1>
            <p className="text-[#736d65] mt-2 font-medium tracking-wide">
              {user.department} Department
            </p>
          </div>
          
          {(user.role === "professor" || (user.role === "student" && user.isCR)) && (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 md:mt-0 bg-[#2d2a26] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a1816] transition-colors shadow-md flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload New Schedule
            </button>
          )}
        </div>

        <div className="bg-white/70 rounded-xl border border-[#e6e2d8] shadow-sm overflow-hidden min-h-[60vh]">
          {!scheduleData.fileType ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-8">
              <div className="w-20 h-20 mb-4 bg-[#fcfbf9] rounded-2xl flex items-center justify-center border border-[#e6e2d8]">
                <Calendar className="w-10 h-10 text-[#a99c85]" />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#2d2a26] mb-2">No Schedule Available</h2>
              <p className="text-[#736d65] max-w-md">
                No schedule has been uploaded for the {user.department} department yet.
              </p>
            </div>
          ) : (
            <ScheduleViewer schedule={scheduleData} />
          )}
        </div>

      </div>

      <UploadScheduleModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleScheduleUpload}
      />
    </DashboardLayout>
  );
}

// Temporary icon component just for the empty state
function Calendar(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
      <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
      <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
    </svg>
  );
}
