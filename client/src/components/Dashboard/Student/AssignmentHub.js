"use client";

import { useState } from "react";
import { Upload, Clock, CheckCircle2, Bookmark, Calendar } from "lucide-react";
import UploadModal from "./UploadModal";

export default function AssignmentHub() {
  const [activeTab, setActiveTab] = useState("pending");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Mock Data
  const [assignments, setAssignments] = useState([
    {
      id: "1",
      courseName: "Machine Learning",
      title: "Neural Networks Implementation",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(), // 12 hours from now
      status: "pending",
    },
    {
      id: "2",
      courseName: "Big Data Analytics",
      title: "Hadoop Cluster setup guide",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
      status: "pending",
    },
    {
      id: "3",
      courseName: "Software Project Management",
      title: "Agile Case Study",
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
      status: "pending",
    },
    {
      id: "4",
      courseName: "Artificial Intelligence",
      title: "A* Search Algorithm",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      status: "submitted",
    },
    {
      id: "5",
      courseName: "Internet of Things",
      title: "Sensor Integration Report",
      score: 88,
      status: "evaluated",
    }
  ]);

  const handleUploadClick = (assignment) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleUploadComplete = (id, file) => {
    setAssignments(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: "submitted", submittedAt: new Date().toISOString() } 
        : a
    ));
    alert(`Successfully uploaded ${file.name} for ${selectedAssignment.title}`);
  };

  const filteredAssignments = assignments.filter(a => a.status === activeTab);

  const getUrgencyColor = (dueDateStr) => {
    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const hoursLeft = (due - now) / (1000 * 60 * 60);

    if (hoursLeft < 24) return "bg-red-500";
    if (hoursLeft < 72) return "bg-yellow-500";
    return "bg-[#8b9d83]"; // Muted green for safe
  };

  const getUrgencyText = (dueDateStr) => {
    const due = new Date(dueDateStr).getTime();
    const now = Date.now();
    const hoursLeft = (due - now) / (1000 * 60 * 60);
    const daysLeft = Math.floor(hoursLeft / 24);

    if (hoursLeft < 0) return "Overdue";
    if (hoursLeft < 24) return `Due in ${Math.floor(hoursLeft)} hours`;
    return `Due in ${daysLeft} days`;
  };

  return (
    <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
      <div className="flex justify-between items-end mb-6 border-b border-[#e6e2d8] pb-4">
        <h2 className="text-xl font-serif font-bold text-[#2d2a26] uppercase tracking-widest">
          Assignments Hub
        </h2>
        
        <div className="flex gap-2">
          {["pending", "submitted", "evaluated"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all capitalize ${
                activeTab === tab 
                  ? "bg-[#2d2a26] text-white shadow-md" 
                  : "bg-white text-[#736d65] hover:bg-[#fcfaf7] border border-[#e6e2d8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#736d65] font-serif italic">
            No assignments found in this category.
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-xl border border-[#e6e2d8] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
              {/* Optional: Add a subtle placeholder pattern at top like the images */}
              <div className="h-12 bg-[#fcfbf9] border-b border-[#e6e2d8] w-full flex items-center px-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-[#a99c85]/10 rounded-full blur-2xl -mt-10 -mr-10"></div>
                 <div className="flex items-center gap-2 text-xs font-semibold text-[#736d65] tracking-wide uppercase">
                   <Bookmark className="w-3.5 h-3.5" />
                   {assignment.courseName}
                 </div>
              </div>
              
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="font-serif font-bold text-lg text-[#2d2a26] leading-tight mb-2 group-hover:text-[#8b9d83] transition-colors">
                  {assignment.title}
                </h3>

                {activeTab === "pending" && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getUrgencyColor(assignment.dueDate)} shadow-sm`}></div>
                    <span className="text-sm text-[#4a4744] font-medium flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-[#736d65]" />
                      {getUrgencyText(assignment.dueDate)}
                    </span>
                  </div>
                )}

                {activeTab === "submitted" && (
                  <div className="mt-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#736d65]" />
                    <span className="text-sm text-[#4a4744]">
                      Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {activeTab === "evaluated" && (
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#8b9d83]" />
                    <span className="text-sm font-bold text-[#8b9d83]">
                      Score: {assignment.score}/100
                    </span>
                  </div>
                )}

                <div className="mt-auto pt-6 w-full">
                  {/* Decorative progress line like in the image */}
                  <div className="w-full h-1 bg-[#f5f3ef] rounded-full mb-4 overflow-hidden">
                    <div className={`h-full ${activeTab === "pending" ? "bg-[#e6e2d8] w-1/4" : "bg-[#8b9d83] w-full"}`}></div>
                  </div>

                  {activeTab === "pending" && (
                    <button 
                      onClick={() => handleUploadClick(assignment)}
                      className="w-full bg-[#fcfbf9] hover:bg-[#fcfaf7] text-[#2d2a26] border border-[#e6e2d8] text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Submission
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <UploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assignment={selectedAssignment}
        onUpload={handleUploadComplete}
      />
    </div>
  );
}
