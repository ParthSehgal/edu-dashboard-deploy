const mongoose = require("mongoose");

const placementPostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    metadata: {
      companyName: { type: String, required: true, trim: true },
      jobRole: { type: String, required: true, trim: true },
      packageCTC: { type: Number, required: true },
      placementYear: { type: Number, required: true }
    },
    content: {
      rounds: [
        {
          roundName: { type: String, required: true, trim: true }, // e.g., "Round 1: Online Assessment"
          details: { type: String, required: true } // HTML/Rich text expected
        }
      ],
      tips: {
        type: String, // HTML/Rich text expected
        default: ""
      }
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    engagement: {
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft"
    },
    privacy: {
      isAnonymous: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlacementPost", placementPostSchema);
