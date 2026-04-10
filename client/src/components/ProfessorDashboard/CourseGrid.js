"use client";
import React from "react";
import { BookOpen, Users, ToggleLeft, ToggleRight, FileText } from "lucide-react";

const CourseCard = ({ course, onTogglePublish }) => {
  const { id, courseName, enrolled, activeAssignments, allGraded, gradesPublished } = course;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600">
            {id}: {courseName}
          </h3>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <BookOpen className="w-5 h-5" />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-6 flex-1">
        <div className="flex items-center text-sm text-gray-600 font-medium">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          {enrolled} Enrolled Students
        </div>
        <div className="flex items-center text-sm text-gray-600 font-medium">
          <FileText className="w-4 h-4 mr-2 text-gray-400" />
          {activeAssignments} Active Assignments
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Publish Grades</span>
        
        <div className="relative group flex items-center">
          <button
            onClick={() => onTogglePublish(id, !gradesPublished)}
            disabled={!allGraded}
            className={`flex items-center transition-colors focus:outline-none ${
              !allGraded ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            {gradesPublished ? (
              <ToggleRight className="w-10 h-10 text-indigo-600" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-gray-300" />
            )}
          </button>
          
          {/* Tooltip for disabled state */}
          {!allGraded && (
            <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 text-center">
              All students must be graded before publishing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseGrid = ({ courses = [], onTogglePublish }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onTogglePublish={onTogglePublish} 
        />
      ))}
      
      {courses.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded-xl border border-gray-100 border-dashed">
          No active courses assigned to you at the moment.
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
