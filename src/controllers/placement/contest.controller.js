const Contest = require("../../models/contest.model");

// GET ALL UPCOMING CONTESTS (Automatically filtered by date)
exports.getContests = async (req, res) => {
  try {
    // Bring contests that happen in the future, or are currently ongoing, or ended very recently (allow up to 2 hours past endTime)
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const contests = await Contest.find({ endTime: { $gte: twoHoursAgo } })
      .populate("addedBy", "name")
      .sort({ startTime: 1 }); // Ascending order (soonest first)
      
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD A NEW CONTEST (SENIOR ONLY)
exports.addContest = async (req, res) => {
  try {
    const { title, platform, link, startTime, endTime } = req.body;

    if (req.placementRole !== "senior") {
        return res.status(403).json({ message: "Only seniors can post upcoming contests." });
    }

    const contest = new Contest({
      title,
      platform,
      link,
      startTime,
      endTime,
      addedBy: req.user.id
    });

    await contest.save();
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET A SINGLE CONTEST BY ID
exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("addedBy", "name")
      .populate("discussions.user", "name");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    res.status(200).json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching contest details." });
  }
};

// ADD A DISCUSSION MESSAGE TO CONTEST
exports.addContestDiscussion = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    contest.discussions.push({
      user: req.user.id,
      message,
    });

    await contest.save();

    // Re-fetch to populate user
    const updatedContest = await Contest.findById(req.params.id).populate("discussions.user", "name");

    res.status(201).json({ success: true, data: updatedContest });
  } catch (error) {
    res.status(500).json({ message: "Server error posting discussion." });
  }
};

// DELETE A CONTEST (SENIOR ONLY)
exports.deleteContest = async (req, res) => {
  try {
    if (req.placementRole !== "senior") {
      return res.status(403).json({ message: "Only seniors can delete contests." });
    }

    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found." });
    }

    await Contest.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Contest deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
