const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
       type: String,
       required: true,
       trim: true
    },
    author: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true
    },
    post: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "PlacementPost",
       required: true
    },
    parentComment: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Comment",
       default: null
    },
    upvotes: [
       {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
       }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
