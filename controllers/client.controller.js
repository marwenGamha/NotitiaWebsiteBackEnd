const multer = require("multer");
const sharp = require("sharp");
const mongoose = require("mongoose");
var ObjectId = require("mongoose").Types.ObjectId;
const Client = mongoose.model("Client");

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

  req.file.filename = `client-${req.body.fullName
    .toLowerCase()
    .split(" ")
    .join("-")}-${Date.now()}.png`;
  sharp(req.file.buffer)
    .resize(185, 185)

    .toFile(`public/img/clientt/${req.file.filename}`);
  //we can add .toFormat('jpag') .jpeg({quality :90})

  next();
};

module.exports.createClient = (req, res) => {
  const url = req.protocol + "://" + req.get("host");

  if (!req.body.fullName) {
    res
      .status(200)
      .json({ success: false, message: "client fullname is required" });
  } else if (!req.body.title) {
    res
      .status(200)
      .json({ success: false, message: "client title is required" });
  } else if (!req._id) {
    res
      .status(200)
      .json({ success: false, message: "client creator is required" });
  } else {
    let newclient = new Client({
      fullName: req.body.fullName,
      title: req.body.title,
      body: req.body.body,
      image: url + "/public/img/clientt/" + req.file.filename,
      createdBy: req._id,
    });
    newclient.save((err, post) => {
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

module.exports.getallClient = (req, res, next) => {
  Client.find((err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving team :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.deleteClient = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  Client.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log(
        "Error in client Delete :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.putClient = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  let imgPath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imgPath = url + "/public/img/clientt/" + req.file.filename;
  }

  var temp = {
    fullName: req.body.fullName,
    title: req.body.title,
    body: req.body.body,
    image: imgPath,
  };
  Client.findByIdAndUpdate(
    req.params.id,
    { $set: temp },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        console.log(
          "Error in client Update :" + JSON.stringify(err, undefined, 2)
        );
      }
    }
  );
};

exports.uploadClientPhoto = upload.single("image");
