const mongoose = require("mongoose");

var teamSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  facebook: {
    type: String,
  },
  email: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  twitter: {
    type: String,
  },

  // socialMedia: [
  //   {
  //     facebook: {
  //       type: String,
  //     },
  //     email: {
  //       type: String,
  //     },
  //     linkedin: {
  //       type: String,
  //     },
  //     twitter: {
  //       type: String,
  //     },
  //   },
  // ],
});

module.exports = mongoose.model("Team", teamSchema);
