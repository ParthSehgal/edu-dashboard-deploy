const Schedule = require('../models/schedule.model');
const xlsx = require('xlsx');
const { cloudinary } = require('../config/cloudinary');
const { Readable } = require('stream');

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
      // PDF is handled by the cloud upload below
    }

    // Upload buffer to Cloudinary
    let fileUrl = '';
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'edunexus_schedules',
            resource_type: 'raw',     // Must be raw for .xlsx files
            public_id: req.file.originalname
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        const readableStream = new Readable({
          read() {
            this.push(req.file.buffer);
            this.push(null);
          }
        });
        readableStream.pipe(stream);
      });
      fileUrl = uploadResult.secure_url;
    } catch (uploadErr) {
      console.error('Cloudinary upload error:', uploadErr);
      return res.status(500).json({ message: 'Error uploading to cloud' });
    }

    // Upsert the schedule for the department
    const schedule = await Schedule.findOneAndUpdate(
      { department },
      {
        department,
        fileUrl,
        fileType,
        uploadedBy: req.user.id,
        parsedData
      },
      { new: true, upsert: true, runValidators: true }
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
