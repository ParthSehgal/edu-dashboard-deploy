"use client";

import { useEffect, useState } from "react";

export default function Timetable({ department }) {
  // Mock Timetable Data - in a real app, this comes from an API
  const [schedule, setSchedule] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });

  const timeSlots = [
    "08.00-09.00",
    "09.00-10.00",
    "10.15-11.15",
    "12.00-12.15",
    "01.15-02.15",
    "02.15-03.15",
    "03.15-04.15",
    "04.30-05.30",
  ];

  useEffect(() => {
    // Mock Fetch based on department
    // Just seeding some placeholder data matching the screenshot
    setSchedule({
      Monday: [
        { time: "08.00-09.00", course: "IoT (P) SKP", room: "2013" },
        { time: "09.00-10.00", course: "IoT (P) SKP", room: "2013" },
      ],
      Tuesday: [
        { time: "09.00-10.00", course: "BDA (L) MPD", room: "2413" },
        { time: "10.15-11.15", course: "SPORTS", room: "" },
        { time: "12.00-12.15", course: "LIBRARY", room: "" },
        { time: "02.15-03.15", course: "Minor ML (P) MP", room: "2013" },
        { time: "03.15-04.15", course: "Minor ML (P) MP", room: "2013" },
      ],
      Wednesday: [
        { time: "08.00-09.00", course: "RM (L) AKK", room: "2413" },
        { time: "09.00-10.00", course: "RM (L) AKK", room: "2413" },
        { time: "10.15-11.15", course: "SPM (P) N/A", room: "2013" },
        { time: "12.00-12.15", course: "SPM (P) N/A", room: "2013" },
        { time: "01.15-02.15", course: "LIBRARY", room: "" },
        { time: "02.15-03.15", course: "SPORTS", room: "" },
        { time: "03.15-04.15", course: "BDA (P) MPD", room: "2013" },
        { time: "04.30-05.30", course: "BDA (P) MPD", room: "2013" },
      ],
      Thursday: [
        { time: "08.00-09.00", course: "RM (L) AKK", room: "2413" },
        { time: "09.00-10.00", course: "BDA (L) MPD", room: "2413" },
        { time: "01.15-02.15", course: "SPM (L) N/A", room: "2414" },
      ],
      Friday: [
        { time: "08.00-09.00", course: "IoT (L) SKP", room: "2413" },
        { time: "09.00-10.00", course: "IoT (L) SKP", room: "2413" },
        { time: "10.15-11.15", course: "LIBRARY", room: "" },
        { time: "12.00-12.15", course: "LIBRARY", room: "" },
        { time: "01.15-02.15", course: "SPM (L) N/A", room: "2414" },
        { time: "02.15-03.15", course: "BDA (L) MPD", room: "2414" },
        { time: "03.15-04.15", course: "Minor ML (L) MP", room: "2311" },
        { time: "04.30-05.30", course: "Minor ML (L) MP", room: "2311" },
      ],
    });
  }, [department]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="bg-white/50 rounded-xl p-6 shadow-sm border border-[#e6e2d8]">
      <h2 className="text-xl font-serif font-bold text-[#2d2a26] mb-6 uppercase tracking-widest border-b border-[#e6e2d8] pb-2">
        Class Schedule
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-[#4a4744]">
          <thead className="bg-[#fcfbf9] border-b border-[#e6e2d8]">
            <tr>
              <th className="px-4 py-3 font-serif font-semibold w-24">Time</th>
              {days.map(day => (
                <th key={day} className="px-4 py-3 font-serif font-semibold">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e2d8]">
            {timeSlots.map((slot) => (
              <tr key={slot} className="hover:bg-[#fcfaf7] transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-[#2d2a26] border-r border-[#e6e2d8]">{slot}</td>
                {days.map((day) => {
                  const classAtSlot = schedule[day].find(c => c.time === slot);
                  return (
                    <td key={day + slot} className="px-4 py-3 border-r border-[#e6e2d8] last:border-r-0 min-w-[120px]">
                      {classAtSlot ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#2d2a26]">{classAtSlot.course}</span>
                          {classAtSlot.room && (
                            <span className="text-xs text-[#736d65] mt-0.5">{classAtSlot.room}</span>
                          )}
                        </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
