const MockOA = require("../../models/mockOA.model");

// GET ALL MOCK OAs
exports.getOAs = async (req, res) => {
  try {
    const oas = await MockOA.find()
      .populate("addedBy", "name")
      .sort({ date: -1 }); // Newest first
      
    res.status(200).json({ success: true, data: oas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD A NEW MOCK OA (SENIOR ONLY)
exports.addOA = async (req, res) => {
  try {
    const { title, syllabus, date } = req.body;

    if (req.placementRole !== "senior") {
        return res.status(403).json({ message: "Only seniors can create a Mock OA." });
    }

    const mockOA = new MockOA({
      title,
      syllabus,
      date,
      addedBy: req.user.id
    });

    await mockOA.save();
    res.status(201).json({ success: true, data: mockOA });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPLOAD RESULTS (SENIOR ONLY)
exports.uploadResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { students } = req.body; // students should be an array of { name, rollNo }

    if (req.placementRole !== "senior") {
        return res.status(403).json({ message: "Only seniors can upload OA results." });
    }

    const mockOA = await MockOA.findById(id);
    if (!mockOA) {
       return res.status(404).json({ message: "Mock OA not found" });
    }

    mockOA.selectedStudents = students;
    mockOA.resultsUploaded = true;
    await mockOA.save();

    res.status(200).json({ success: true, data: mockOA });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE MOCK OA (SENIOR ONLY)
exports.deleteOA = async (req, res) => {
  try {
    if (req.placementRole !== "senior") {
      return res.status(403).json({ message: "Only seniors can delete Mock OAs." });
    }

    const mockOA = await MockOA.findById(req.params.id);

    if (!mockOA) {
      return res.status(404).json({ message: "Mock OA not found." });
    }

    await MockOA.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Mock OA deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
