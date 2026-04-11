import React from 'react';

const ProfessorSchedule = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      {/* Header */}
      <header className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Weekly Academic Schedule</h2>
          <p className="text-slate-500 text-sm">Your weekly teaching schedule and class overview</p>
        </div>
        <div className="bg-[#4fb28d] text-white px-6 py-2 rounded-lg font-medium shadow-sm">
          Weekly Schedule Overview
        </div>
      </header>

      {/* GridContainer */}
      <div className="schedule-container overflow-x-auto">
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
          .lunch-break-col {
            background-color: #f8fafc;
            min-width: 120px;
          }
        `}</style>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white">
              <th className="day-col p-4 text-left font-semibold text-slate-400 text-sm border-b border-slate-100">Days and Date</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">09:00 - 09:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">10:00 - 10:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">11:00 - 11:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">12:00 - 12:55</th>
              <th className="lunch-break-col p-4 text-center font-bold text-slate-400 text-xs tracking-widest uppercase border-b border-slate-100">Lunch Break (1-2 PM)</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">02:00 - 02:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">03:00 - 03:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">04:00 - 04:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">05:00 - 05:55</th>
              <th className="time-slot-col p-4 text-center font-semibold text-slate-500 text-sm border-b border-slate-100">06:00 - 06:55</th>
            </tr>
          </thead>
          <tbody>
            {/* Row_Monday */}
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="day-col p-4 font-medium text-slate-700">
                <div className="font-bold">Monday</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Sep 04</div>
              </td>
              <td className="p-2 align-top">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-orange-800">AI-101</p>
                  <p className="text-orange-700">Intro to AI</p>
                  <p className="mt-1 text-orange-600 italic">Room 304</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-blue-800">CS-202</p>
                  <p className="text-blue-700">Data Structures</p>
                  <p className="mt-1 text-blue-600 italic">Lab 1</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="lunch-break-col border-x border-slate-100 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="rotate-90 text-[10px] text-slate-300 font-bold tracking-tighter opacity-20">BREAK</span>
                </div>
              </td>
              <td className="p-2 align-top">
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-green-800">EN-301</p>
                  <p className="text-green-700">Software Eng.</p>
                  <p className="mt-1 text-green-600 italic">Room 102</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
            </tr>

            {/* Row_Tuesday */}
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="day-col p-4 font-medium text-slate-700">
                <div className="font-bold">Tuesday</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Sep 05</div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-blue-800">CS-202</p>
                  <p className="text-blue-700">Data Structures</p>
                  <p className="mt-1 text-blue-600 italic">Lab 1</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-green-800">EN-301</p>
                  <p className="text-green-700">Software Eng.</p>
                  <p className="mt-1 text-green-600 italic">Room 102</p>
                </div>
              </td>
              <td className="lunch-break-col border-x border-slate-100"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-orange-800">AI-101</p>
                  <p className="text-orange-700">Intro to AI</p>
                  <p className="mt-1 text-orange-600 italic">Room 304</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
            </tr>

            {/* Row_Wednesday */}
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="day-col p-4 font-medium text-slate-700">
                <div className="font-bold">Wednesday</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Sep 06</div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-green-800">EN-301</p>
                  <p className="text-green-700">Software Eng.</p>
                  <p className="mt-1 text-green-600 italic">Room 102</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="lunch-break-col border-x border-slate-100"></td>
              <td className="p-2 align-top">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-orange-800">AI-101</p>
                  <p className="text-orange-700">Intro to AI</p>
                  <p className="mt-1 text-orange-600 italic">Room 304</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
            </tr>

            {/* Row_Thursday */}
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="day-col p-4 font-medium text-slate-700">
                <div className="font-bold">Thursday</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Sep 07</div>
              </td>
              <td className="p-2 align-top">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-blue-800">CS-202</p>
                  <p className="text-blue-700">Data Structures</p>
                  <p className="mt-1 text-blue-600 italic">Lab 1</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-orange-800">AI-101</p>
                  <p className="text-orange-700">Intro to AI</p>
                  <p className="mt-1 text-orange-600 italic">Room 304</p>
                </div>
              </td>
              <td className="lunch-break-col border-x border-slate-100"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-green-800">EN-301</p>
                  <p className="text-green-700">Software Eng.</p>
                  <p className="mt-1 text-green-600 italic">Room 102</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
            </tr>

            {/* Row_Friday */}
            <tr className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="day-col p-4 font-medium text-slate-700">
                <div className="font-bold">Friday</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Sep 08</div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-green-800">EN-301</p>
                  <p className="text-green-700">Software Eng.</p>
                  <p className="mt-1 text-green-600 italic">Room 102</p>
                </div>
              </td>
              <td className="p-2 align-top">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-blue-800">CS-202</p>
                  <p className="text-blue-700">Data Structures</p>
                  <p className="mt-1 text-blue-600 italic">Lab 1</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
              <td className="lunch-break-col border-x border-slate-100"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top"></td>
              <td className="p-2 align-top">
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg text-xs" data-purpose="class-card">
                  <p className="font-bold text-orange-800">AI-101</p>
                  <p className="text-orange-700">Intro to AI</p>
                  <p className="mt-1 text-orange-600 italic">Room 304</p>
                </div>
              </td>
              <td className="p-2 align-top"></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* FooterInfo */}
      <footer className="p-6 bg-slate-50 text-slate-400 text-xs flex justify-between items-center border-t border-slate-100">
        <div>© 2019 Educational Management System</div>
        <div className="flex gap-4">
          <span>Mon - Fri Working Days</span>
          <span>Standard 55min Periods</span>
        </div>
      </footer>
    </div>
  );
};

export default ProfessorSchedule;
