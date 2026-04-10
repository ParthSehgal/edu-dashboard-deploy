"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import GradingQueueWidget from "@/components/ProfessorDashboard/GradingQueueWidget";
import CourseGrid from "@/components/ProfessorDashboard/CourseGrid";
import GradingModal from "@/components/ProfessorDashboard/GradingModal";
import AnalyticsView from "@/components/ProfessorDashboard/AnalyticsView";
import AuditLogTimeline from "@/components/ProfessorDashboard/AuditLogTimeline";
import CSVBulkUpload from "@/components/ProfessorDashboard/CSVBulkUpload";

// MOCK DATA for Demonstration 
const MOCK_COURSES = [
  { id: "AI-101", courseName: "Intro to Artificial Intelligence", enrolled: 45, activeAssignments: 2, allGraded: false, gradesPublished: false },
  { id: "CS-202", courseName: "Data Structures & Algorithms", enrolled: 120, activeAssignments: 1, allGraded: true, gradesPublished: false },
  { id: "EN-301", courseName: "Software Engineering", enrolled: 85, activeAssignments: 0, allGraded: true, gradesPublished: true },
];

const MOCK_PENDING_QUEUE = [
  { courseId: "AI-101", assignmentName: "Midterm Exam", ungradedCount: 24 },
  { courseId: "AI-101", assignmentName: "Quiz 2", ungradedCount: 5 },
  { courseId: "CS-202", assignmentName: "Graph Traversal Assignment", ungradedCount: 1 },
];

const MOCK_DISTRIBUTION = [
  { range: "0-10", students: 0 },
  { range: "10-20", students: 1 },
  { range: "20-30", students: 2 },
  { range: "30-40", students: 4 },
  { range: "40-50", students: 5 },
  { range: "50-60", students: 12 },
  { range: "60-70", students: 25 },
  { range: "70-80", students: 35 },
  { range: "80-90", students: 20 },
  { range: "90-100", students: 8 },
];

const MOCK_AT_RISK = [
  { studentId: "S-1045", name: "Alice Johnson", courseId: "AI-101", finalScore: 45.5 },
  { studentId: "S-2091", name: "Bob Smith", courseId: "CS-202", finalScore: 32.0 },
  { studentId: "S-3302", name: "Charlie Davis", courseId: "AI-101", finalScore: 48.0 },
];

const MOCK_AUDIT_LOGS = [
  { id: 1, actionType: "GRADE_UPDATE", title: "Manual Grade Update", description: "Updated Midsem score for S-1045", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), courseId: "AI-101", targetId: "S-1045" },
  { id: 2, actionType: "BULK_UPLOAD", title: "CSV Bulk Upload", description: "Imported grades for 120 students", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), courseId: "CS-202" },
  { id: 3, actionType: "PUBLISH", title: "Grades Published", description: "Published final grades to student dashboards", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), courseId: "EN-301" },
];

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState(MOCK_COURSES);
  const [queue, setQueue] = useState(MOCK_PENDING_QUEUE);
  const [auditLogs, setAuditLogs] = useState(MOCK_AUDIT_LOGS);
  
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [activeStudentForGrading, setActiveStudentForGrading] = useState(null);

  // Example handler to open modal
  const handleOpenGradingModal = (studentInfo) => {
    setActiveStudentForGrading(studentInfo);
    setIsGradingModalOpen(true);
  };

  const handleTogglePublish = (courseId, newState) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, gradesPublished: newState } : c));
    
    // Add to audit log
    const newLog = {
      id: Date.now(),
      actionType: "PUBLISH",
      title: newState ? "Grades Published" : "Grades Unpublished",
      description: newState ? "Published grades to dashboards" : "Revoked published grades",
      timestamp: new Date().toISOString(),
      courseId
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleBulkUpload = (courseId, data) => {
    const newLog = {
      id: Date.now(),
      actionType: "BULK_UPLOAD",
      title: "CSV Bulk Upload",
      description: `Imported grades for ${data.length} students via CSV`,
      timestamp: new Date().toISOString(),
      courseId
    };
    setAuditLogs(prev => [newLog, ...prev]);
    
    // Normally would trigger re-fetch of queue/at-risk/distribution
    alert(`Bulk upload simulation complete for ${courseId}. ${data.length} records processed.`);
  };

  const handleGradeSubmit = (studentId, scores, finalScore) => {
    const newLog = {
      id: Date.now(),
      actionType: "GRADE_UPDATE",
      title: "Manual Grade Update",
      description: `Instructor updated grades. Final calculated: ${finalScore}`,
      timestamp: new Date().toISOString(),
      courseId: activeStudentForGrading?.courseId || "Unknown",
      targetId: studentId
    };
    setAuditLogs(prev => [newLog, ...prev]);
    
    // Mute/remove from pending queue if applicable in real app
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Professor Console</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your courses, grade submissions, and oversee class performance.</p>
        </header>

        {/* Top Row: Quick Glance Grid & Grading Queue */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2">
            <CourseGrid courses={courses} onTogglePublish={handleTogglePublish} />
          </div>
          <div className="xl:col-span-1 border-t xl:border-t-0 p-4 xl:p-0 xl:h-auto">
            {/* We add clicking capability in the real app, here it's static UI visualization */}
            <GradingQueueWidget pendingItems={queue} />
            <div className="mt-4 text-center">
              <button 
                onClick={() => handleOpenGradingModal({ studentId: "S-1045", name: "Alice Johnson", courseId: "AI-101", scores: { quiz1: "15", midsem: "45", endsem: "" } })}
                className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition"
              >
                Simulate: Grade Next Student
              </button>
            </div>
          </div>
        </div>

        {/* Middle Row: Analytics & Bulk Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 px-1">Performance & Analytics</h2>
          <AnalyticsView 
            distributionData={MOCK_DISTRIBUTION} 
            atRiskStudents={MOCK_AT_RISK} 
            classAverage={72.4} 
          />
        </div>

        {/* Bottom Row: Audit Logs & System Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <CSVBulkUpload courses={courses} onBulkUpload={handleBulkUpload} />
          <AuditLogTimeline logs={auditLogs} />
        </div>

      </div>

      <GradingModal 
        isOpen={isGradingModalOpen} 
        student={activeStudentForGrading}
        onClose={() => setIsGradingModalOpen(false)}
        onSubmit={handleGradeSubmit}
      />
    </DashboardLayout>
  );
}
