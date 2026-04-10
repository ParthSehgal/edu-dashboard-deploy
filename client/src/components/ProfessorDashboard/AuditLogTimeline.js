"use client";
import React from "react";
import { Activity, Edit3, UploadCloud, CheckCircle2 } from "lucide-react";

const parseIcon = (type) => {
  switch (type) {
    case "GRADE_UPDATE":
      return <Edit3 className="w-4 h-4 text-white" />;
    case "BULK_UPLOAD":
      return <UploadCloud className="w-4 h-4 text-white" />;
    case "PUBLISH":
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    default:
      return <Activity className="w-4 h-4 text-white" />;
  }
};

const getColorClass = (type) => {
  switch (type) {
    case "GRADE_UPDATE":
      return "bg-blue-500 ring-blue-100";
    case "BULK_UPLOAD":
      return "bg-purple-500 ring-purple-100";
    case "PUBLISH":
      return "bg-green-500 ring-green-100";
    default:
      return "bg-gray-500 ring-gray-100";
  }
};

const AuditLogTimeline = ({ logs = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-gray-400" />
        Recent Audit & Activity Log
      </h2>

      <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">No recent activity found.</div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-3">
            {logs.map((log, index) => (
              <div key={log.id || index} className="mb-6 ml-6 relative">
                <span 
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-10 ring-4 ${getColorClass(log.actionType)}`}
                >
                  {parseIcon(log.actionType)}
                </span>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{log.title}</h3>
                    <time className="text-xs font-medium text-gray-400 whitespace-nowrap ml-2">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </time>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {log.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium bg-white text-gray-600 border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                      Course: {log.courseId}
                    </span>
                    {log.targetId && (
                      <span className="text-xs font-medium bg-white text-gray-600 border border-gray-200 px-2 py-0.5 rounded shadow-sm">
                        ID: {log.targetId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogTimeline;
