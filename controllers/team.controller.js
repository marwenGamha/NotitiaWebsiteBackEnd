const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
var router = express.Router();

const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;

const Team = mongoose.model("Team");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/team");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1]; //extension
//     cb(null, `team-${req._id}-${Date.now()}.${ext}`); //file specifie   //curennt connected user
//   },
// });
const multerStorage = multer.memoryStorage();

const multerfilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(console.log("there is no image please uplode one"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerfilter,
});

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next;

  req.file.filename = `team-${req.body.fullName
    .toLowerCase()
    .split(" ")
    .join("-")}-${Date.now()}.png`;
  sharp(req.file.buffer)
    .resize(185, 185)

    .toFile(`public/img/team/${req.file.filename}`);
  //we can add .toFormat('jpag') .jpeg({quality :90})

  next();
};

module.exports.createTeam = (req, res) => {
  const url = req.protocol + "://" + req.get("host");

  if (!req.body.fullName) {
    res
      .status(200)
      .json({ success: false, message: "team fullname is required" });
  } else if (!req.body.title) {
    res.status(200).json({ success: false, message: "team title is required" });
  } else if (!req._id) {
    res
      .status(200)
      .json({ success: false, message: "team creator is required" });
  } else {
    let newteam = new Team({
      fullName: req.body.fullName,
      title: req.body.title,
      imagePath: url + "/public/img/team/" + req.file.filename,
      createdBy: req._id,
      facebook: req.body.facebook,
      email: req.body.email,
      twitter: req.body.twitter,
      linkedin: req.body.linkedin,
    });
    newteam.save((err, post) => {
      if (err) {
        if (err.errors) {
          if (err.errors.title) {
            res
              .status(200)
              .json({ success: false, message: err.errors.title.message });
          } else if (err.errors.body) {
            res
              .status(200)
              .json({ success: false, message: err.errors.body.message });
          } else {
            res.status(200).json({ success: false, message: err });
          }
        } else {
          res.status(500).json({ success: false, message: err });
        }
      } else {
        res.status(201).json({ message: "Post saved!" });
      }
    });
  }
};

// module.exports.getallTeam = (req, res) => {
//   Team.find({}, (err, team) => {
//     if (err) {
//       res.json({ success: false, message: err });
//     } else {
//       if (!team) {
//         res.json({ success: false, message: "No Team found" });
//       } else {
//         res.json({ success: true, team: team });
//       }
//     }
//   });
// };

module.exports.getallTeam = (req, res, next) => {
  Team.find((err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving team :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.deleteTeam = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  Team.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Error in team Delete :" + JSON.stringify(err, undefined, 2));
    }
  });
};

module.exports.putteam = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  let imgPath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imgPath = url + "/public/img/team/" + req.file.filename;
  }

  var temp = {
    fullName: req.body.fullName,
    title: req.body.title,
    imagePath: imgPath,
    facebook: req.body.facebook,
    email: req.body.email,
    twitter: req.body.twitter,
    linkedin: req.body.linkedin,
  };
  Team.findByIdAndUpdate(
    req.params.id,
    { $set: temp },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        console.log(
          "Error in User Update :" + JSON.stringify(err, undefined, 2)
        );
      }
    }
  );
};

exports.uploadTeamPhoto = upload.single("imagePath");
