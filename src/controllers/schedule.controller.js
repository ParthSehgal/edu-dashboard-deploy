const Schedule = require('../models/schedule.model');
const xlsx = require('xlsx');

exports.uploadSchedule = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { department } = req.body;
    if (!department) {
      return res.status(400).json({ message: 'Department is required' });
    }

    let parsedData = null;
    let fileType = 'unknown';

    // Parse Excel file if applicable
    if (req.file.originalname.match(/\.(xlsx|xls|csv)$/i)) {
      fileType = 'excel';
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      parsedData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    } else if (req.file.originalname.match(/\.(pdf)$/i)) {
      fileType = 'pdf';
      // Handle PDF uploads separately if needed (e.g. upload to S3)
      // For this demo, we'll just acknowledge the upload.
    }

    // Upsert the schedule for the department
    const schedule = await Schedule.findOneAndUpdate(
      { department },
      {
        department,
        fileUrl: `/uploads/${req.file.originalname}`, // Mock URL for now
        fileType,
        uploadedBy: req.user.id,
        parsedData
      },
      { new: true, upsert: true }
    ).populate('uploadedBy', 'name');

    res.status(200).json({ message: 'Schedule uploaded successfully', schedule });
  } catch (err) {
    console.error('Schedule upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ message: 'Department query parameter is required' });
    }

    const schedule = await Schedule.findOne({ department }).populate('uploadedBy', 'name');
    if (!schedule) {
      return res.status(404).json({ message: 'No schedule found for this department' });
    }

    res.status(200).json(schedule);
  } catch (err) {
    console.error('Schedule fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
