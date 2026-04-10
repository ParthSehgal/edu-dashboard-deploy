"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";

const GradingQueueWidget = ({ pendingItems = [] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Action Required: Grading Queue
        </h2>
        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
          {pendingItems.length} Pending
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
        {pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full py-6">
            <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
            <p className="text-sm font-medium">All caught up! No pending grading tasks.</p>
          </div>
        ) : (
          pendingItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col p-4 border border-gray-100 rounded-lg hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
                  {item.courseId}: {item.assignmentName}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                  <Clock className="w-3 h-3" />
                  Due soon
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">
                {item.ungradedCount} Ungraded Submissions
              </p>
              <div className="mt-3 flex justify-end">
                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                  Grade Now <span>&rarr;</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GradingQueueWidget;
