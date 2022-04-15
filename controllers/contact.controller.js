const express = require("express");
const mongoose = require("mongoose");

var ObjectId = require("mongoose").Types.ObjectId;
const catchAsync = require("./../utils/catchAsync");

const Contact = mongoose.model("Contact");
const Email = require("./../utils/email");
const SendEmailToUs = require("./../utils/emailUs");

module.exports.createContact = (req, res) => {
  if (!req.body.email) {
    res
      .status(200)
      .json({ success: false, message: "contact email is required" });
  } else if (!req.body.fullName) {
    res
      .status(200)
      .json({ success: false, message: "contact fullname is required" });
  } else if (!req.body.subject) {
    res
      .status(200)
      .json({ success: false, message: "contact subject is required" });
  } else if (!req.body.message) {
    res
      .status(200)
      .json({ success: false, message: "contact message is required" });
  } else if (!req.body.number) {
    res
      .status(200)
      .json({ success: false, message: "contact number is required" });
  } else {
    let newContact = new Contact({
      fullName: req.body.fullName,
      email: req.body.email,
      number: req.body.number,
      subject: req.body.subject,
      message: req.body.message,
    });
    newContact.save((err, team) => {
      new Email(newContact).sendWelcome();
      new SendEmailToUs(newContact).sendSociety();

      if (err) {
        if (err.errors) {
          if (err.errors.fullName) {
            res
              .status(200)
              .json({ success: false, message: err.errors.fullName.message });
          } else if (err.errors.body) {
            res
              .status(200)
              .json({ success: false, message: err.errors.email.message });
          } else if (err.errors.number) {
            res
              .status(200)
              .json({ success: false, message: err.errors.number.message });
          } else if (err.errors.subject) {
            res
              .status(200)
              .json({ success: false, message: err.errors.subject.message });
          } else if (err.errors.message) {
            res
              .status(200)
              .json({ success: false, message: err.errors.message.message });
          } else {
            res.status(200).json({ success: false, message: err });
          }
        } else {
          res.status(500).json({ success: false, message: err });
        }
      } else {
        res.status(201).json({ message: "contact saved!" });
      }
    });
  }
};

module.exports.getallContact = (req, res, next) => {
  Contact.find((err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving value :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.deletecontact = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  Contact.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log("Error in team Delete :" + JSON.stringify(err, undefined, 2));
    }
  });
};
