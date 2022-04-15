const express = require("express");
var router = express.Router();

const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;

const Service = mongoose.model("Service");

module.exports.createSer = (req, res) => {
  if (!req.body.title) {
    res.status(200).json({ success: false, message: "Post title is required" });
  } else if (!req.body.body) {
    res.status(200).json({ success: false, message: "Post body is required" });
  } else if (!req._id) {
    res
      .status(200)
      .json({ success: false, message: "Post creator is required" });
  } else {
    let newPost = new Service({
      title: req.body.title,
      body: req.body.body,
      icon: req.body.icon,
      createdBy: req._id,
    });
    newPost.save((err, post) => {
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

// module.exports.getall = (req, res) => {
//   Post.find({}, (err, post) => {
//     if (err) {
//       res.json({ success: false, message: err });
//     } else {
//       if (!post) {
//         res.json({ success: false, message: "No blog found" });
//       } else {
//         res.json({ success: true, post: post });
//       }
//     }
//   });
// };

module.exports.getallSer = (req, res, next) => {
  Service.find((err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving value :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.deleteSer = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  Service.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Error in post Delete :" + JSON.stringify(err, undefined, 2));
    }
  });
};

module.exports.updateSer = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  var temp = {
    title: req.body.title,
    body: req.body.body,
    icon: req.body.icon,
  };
  Service.findByIdAndUpdate(
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
