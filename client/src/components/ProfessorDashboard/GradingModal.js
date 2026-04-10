"use client";
import React, { useState, useEffect } from "react";
import { X, Calculator } from "lucide-react";

// Mock component weights for auto-calc demo
const COURSE_COMPONENTS = [
  { id: "quiz1", name: "Quiz 1", weight: 0.2, maxScore: 100 },
  { id: "midsem", name: "Midsem", weight: 0.3, maxScore: 100 },
  { id: "endsem", name: "Endsem", weight: 0.5, maxScore: 100 }
];

const GradingModal = ({ student, isOpen, onClose, onSubmit }) => {
  const [scores, setScores] = useState({ quiz1: "", midsem: "", endsem: "" });
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (student && student.scores) {
      setScores({ ...student.scores });
    } else {
      setScores({ quiz1: "", midsem: "", endsem: "" });
    }
  }, [student, isOpen]);

  // Auto-calculate final score
  useEffect(() => {
    let calculated = 0;
    COURSE_COMPONENTS.forEach(comp => {
      const val = parseFloat(scores[comp.id]) || 0;
      calculated += val * comp.weight;
    });
    setFinalScore(calculated.toFixed(2));
  }, [scores]);

  if (!isOpen || !student) return null;

  const handleInputChange = (id, val) => {
    setScores(prev => ({ ...prev, [id]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(student.id, scores, finalScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Grade Student</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Student Details</h3>
            <p className="text-lg font-bold text-gray-900">{student.name}</p>
            <p className="text-sm text-gray-600 font-medium">ID: {student.studentId} | Course: {student.courseId}</p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Component Scores</h3>
            {COURSE_COMPONENTS.map((comp) => (
              <div key={comp.id} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-1/3">
                  {comp.name} <span className="text-gray-400 text-xs">({comp.weight * 100}%)</span>
                </label>
                <div className="w-2/3 relative">
                  <input
                    type="number"
                    min="0"
                    max={comp.maxScore}
                    step="0.01"
                    required
                    value={scores[comp.id] || ""}
                    onChange={(e) => handleInputChange(comp.id, e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-shadow"
                    placeholder={`Max ${comp.maxScore}`}
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400 text-sm font-medium">/{comp.maxScore}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between mb-8 border border-indigo-100">
            <div className="flex items-center gap-2 text-indigo-800 font-semibold">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Auto-Calculate Preview</span>
            </div>
            <div className="text-2xl font-bold text-indigo-700">
              {finalScore} <span className="text-sm text-indigo-500 font-medium tracking-wide">/ 100</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Submit Grades
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradingModal;
