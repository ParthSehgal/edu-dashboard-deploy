const xlsx = require('xlsx');

// Create a new workbook
const wb = xlsx.utils.book_new();

// Construct schedule data
const data = [
  ["Day / Time", "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"],
  ["Monday", "Example Class\nRoom 101\nProf. Smith", "", "", "", "LUNCH", "", "", "", "", ""],
  ["Tuesday", "", "", "", "", "LUNCH", "", "", "", "", ""],
  ["Wednesday", "", "", "", "", "LUNCH", "", "", "", "", ""],
  ["Thursday", "", "", "", "", "LUNCH", "", "", "", "", ""],
  ["Friday", "", "", "", "", "LUNCH", "", "", "", "", ""]
];

// Create worksheet
const ws = xlsx.utils.aoa_to_sheet(data);

// Set column widths for better visibility
ws['!cols'] = [
    { wch: 15 }, // Day/Time
    { wch: 20 }, // 08-09
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 }
];

// Append worksheet to workbook
xlsx.utils.book_append_sheet(wb, ws, "Schedule Template");

// Write to file
const filePath = process.argv[2] || "Schedule_Template.xlsx";
xlsx.writeFile(wb, filePath);

console.log("Excel template generated successfully at", filePath);
