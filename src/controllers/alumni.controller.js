const TedTalk = require("../models/tedTalk.model");

// GET ALL POSTS (public feed, newest first)
exports.getAllTalks = async (req, res) => {
  try {
    const talks = await TedTalk.find()
      .populate("author", "name role department")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: talks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE TALK BY ID
exports.getTalkById = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id)
      .populate("author", "name role department bio socialLinks")
      .populate("comments.user", "name role");
    if (!talk) return res.status(404).json({ message: "Post not found." });
    res.status(200).json({ success: true, data: talk });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE A TED TALK (alumni only)
exports.createTedTalk = async (req, res) => {
  try {
    const { title, body, videoLink, tags } = req.body;
    const userRole = req.user.role;

    if (userRole !== "alumni") {
      return res.status(403).json({ message: "Only alumni can post TED talks." });
    }

    const talk = await TedTalk.create({
      author: req.user.id,
      type: "tedtalk",
      title,
      body,
      videoLink: videoLink || "",
      tags: tags || []
    });

    const populated = await TedTalk.findById(talk._id).populate("author", "name role department");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE A TECH UPDATE (seniors can also share)
exports.createTechUpdate = async (req, res) => {
  try {
    const { title, body, company, tags } = req.body;
    const userRole = req.user.role;

    // Alumni can always post; seniors only if they are TPC coordinators approved by HOD
    const isTpcCoord = req.isTpcCoord || false;
    const isAlumni = userRole === "alumni";

    if (!isAlumni && !isTpcCoord) {
      return res.status(403).json({ message: "Only alumni or TPC Coordinators (HOD-approved) can post company tech updates." });
    }

    const talk = await TedTalk.create({
      author: req.user.id,
      type: "techupdate",
      title,
      body,
      company: company || "",
      tags: tags || []
    });

    const populated = await TedTalk.findById(talk._id).populate("author", "name role department");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE LIKE
exports.toggleLike = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    const userId = req.user.id;
    const liked = talk.likes.some(id => id.toString() === userId);

    if (liked) {
      talk.likes = talk.likes.filter(id => id.toString() !== userId);
    } else {
      talk.likes.push(userId);
    }

    await talk.save();
    res.status(200).json({ success: true, liked: !liked, likesCount: talk.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD A COMMENT
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Comment text is required." });

    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    talk.comments.push({ user: req.user.id, text });
    await talk.save();

    const updated = await TedTalk.findById(req.params.id).populate("comments.user", "name role");
    res.status(201).json({ success: true, data: updated.comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE A TALK (author only)
exports.deleteTalk = async (req, res) => {
  try {
    const talk = await TedTalk.findById(req.params.id);
    if (!talk) return res.status(404).json({ message: "Post not found." });

    if (talk.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own posts." });
    }

    await TedTalk.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
