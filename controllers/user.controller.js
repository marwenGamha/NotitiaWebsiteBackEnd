const express = require("express");
var router = express.Router();
const crypto = require("crypto");
const mongoose = require("mongoose");
const passport = require("passport");
const multer = require("multer");
const sharp = require("sharp");
const _ = require("lodash");
var ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcryptjs");

const User = mongoose.model("User");
const catchAsync = require("./../utils/catchAsync");
const Email = require("./../utils/email");

// const nodemailer = require('nodemailer');
// const sendgridTransport =require('nodemailer-sendgrid-transport');

// const transporter = nodemailer.createTransport({
//   service:'gmail',
//   auth:{
//     user:'notitia.noreply@gmail.com',
//     pass:'Root!root'

//   }
// });
// var mailOptions ={
//   from: 'notitia.noreply@gmail.com',
//   to:'marwenkamha@gmail.com',
//   subject:'Sending Email using Node.js',
//   text:'hi marwen ,test sending email with nodejs',
//   html :`
//   <p>You requested for password reset</p>
//   <h5>click in this <a href="google.com">link</a> to reset password</h5> `
// };
// transporter.sendMail(mailOptions,function(error,info){
//   if(err){
//     console.log(err);

//   }else{
//     console.log('Email sent :'+info.response);
//   }
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

exports.resizePhoto = (req, res, next) => {
  if (!req.file) return next;

  req.file.filename = `user-${Date.now()}.png`;
  sharp(req.file.buffer)
    .resize(185, 185)

    .toFile(`public/img/user/${req.file.filename}`);
  //we can add .toFormat('jpag') .jpeg({quality :90})

  next();
};

// transporter.sendMail
module.exports.register = (req, res, next) => {
  var user = new User();
  user.fullName = req.body.fullName;
  user.email = req.body.email;
  user.password = req.body.password;
  user.role = req.body.role;
  user.creation_dt = Date.now();

  user.save((err, doc) => {
    if (!err) res.send(doc);
    else {
      if (err.code == 11000)
        res.status(422).send(["Duplicate email adrress found."]);
      else return next(err);
    }
  });
};

module.exports.authenticate = (req, res, next) => {
  // call for passport authentication
  passport.authenticate("local", (err, user, info) => {
    // error from passport middleware
    if (err) return res.status(400).json(err);
    // registered user
    else if (user) return res.status(200).json({ token: user.generateJwt() });
    // unknown user or wrong password
    else return res.status(404).json(info);
  })(req, res);
};

module.exports.userProfile = (req, res, next) => {
  User.findOne({ _id: req._id }, (err, user) => {
    if (!user)
      return res
        .status(404)
        .json({ status: false, message: "User record not found." });
    else
      return res.status(200).json({
        status: true,
        user: _.pick(user, [
          "fullName",
          "email",
          "role",
          "passwordChangedAt",
          "_id",
          "photo",
        ]),
      });
  });
};

module.exports.getall = (req, res, next) => {
  User.find((err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving Employees :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.deleteUser = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  User.findByIdAndRemove(req.params.id, (err, doc) => {
    if (!err) {
      res.send(doc);
    } else {
      console.log(
        "Error in Employee Delete :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};

module.exports.putUser = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  var temp = {
    fullName: req.body.fullName,
    email: req.body.email,
    role: req.body.role,
  };
  User.findByIdAndUpdate(
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

exports.forgetPass = catchAsync(async (req, res, next) => {
  //1)get user based on post
  const user = await User.findOne({ email: req.params.email });
  if (!user) {
    return res.status(404).json({ error: "User dont exists with that email" });
  }
  //generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to user email

  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/resetPassword/${resetToken} `;

  // const message = ` Forget your password ?
  // we've received a request to reset the password
  // you can reset your password by clicking this link: ${resetURL}.\n
  // This link is valid for the next 2 hours only `;
  // <h2>Forgot your password?</h2>
  // <p>we've received a request to reset the password</p>
  // <h5>you can reset yassword by clicking this <a href=${resetURL}>link</a> </h5> `;
  try {
    const resetURL = `${req.protocol}://localhost:4200/reset-password/${resetToken} `;

    await new Email(user, resetURL).sendPasswordReset();

    //comentite here

    // await Email({
    //   email: user.email,
    //   subject: "reset your password...",
    //   message,
    // });

    res
      .status(200)
      .json({ status: "success", message: "check your email,token is send" });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(err);
  }
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on post
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ error: "User dont exists with that email" });
  }
  //generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) send it to user email

  // const resetURL = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/resetPassword/${resetToken} `;

  // const message = ` Forget your password ?
  // we've received a request to reset the password
  // you can reset your password by clicking this link: ${resetURL}.\n
  // This link is valid for the next 2 hours only `;

  // <h2>Forgot your password?</h2>
  // <p>we've received a request to reset the password</p>
  // <h5>you can reset yassword by clicking this <a href=${resetURL}>link</a> </h5> `;
  try {
    const resetURL = `${req.protocol}://localhost:4200/reset-password/${resetToken} `;

    // await Email({
    //   email: user.email,
    //   subject: "reset your password...",
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();

    res
      .status(200)
      .json({ status: "success", message: "check your email,token is send" });
  } catch (err) {
    user.passwordRestToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(err);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) if token has not expire on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  //get user based to token
  const user = await User.findOne({
    passwordRestToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2/if token has not expired and there is user,set new password
  if (!user) {
    return res.status(400).json({ error: "Tpken is invalide or expired" });
  }
  user.password = req.body.password;
  user.passwordRestToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //3 update changedPassword
  //login we can gerate token here
  res
    .status(200)
    .json({ status: "success", message: "password updated successfully" });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.body.id);

  // 2) Check if POSTed current password is correct
  if (!(await bcrypt.compare(req.body.passwordCurrent, user.password))) {
    return res.status(401).json({ error: "Your current password is wrong" });
  }

  // 3) If so, update password
  user.password = req.body.password;
  // user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  res.status(200).json({
    status: "success",
  });
  // createSendToken(user, 200, res);
});

module.exports.putavatar = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send(`No record with given id : ${req.params.id}`);

  let imgPath = req.body.photo;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imgPath = url + "/public/img/user/" + req.file.filename;
  }

  var temp = {
    photo: imgPath,
  };
  User.findByIdAndUpdate(
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

exports.uploadUserPhoto = upload.single("photo");

// module.exports.putPassword = catchAsync(async (req, res) => {
//   const user = await User.findById(req.params._id).select("+password");

//   if (!ObjectId.isValid(req.params.id))
//     return res.status(400).send(`No record with given id : ${req.params.id}`);

//   var temp = {
//     password: req.body.password,
//   };

//   User.findByIdAndUpdate(
//     req.params.id,
//     { $set: temp },
//     { new: true },
//     (err, doc) => {
//       if (!err) {
//         res.send(doc);
//       } else {
//         console.log(
//           "Error in User Update :" + JSON.stringify(err, undefined, 2)
//         );
//       }
//     }
//   );
// });

// module.exports.forgotPassword = (req, res) => {
//  crypto.randomBytes(32, (err,Buffer)=>{
//    if(err){
//      console.log(err);
//    }
//    const token =Buffer.toString("hex")
//    User.findOne({email:req.body.email})
//    .then(user=>{
//      if(!user){
//        return res.status(422).json({error :"User dont exists with that email" })
//      }
//      user.resetToken = token
//      user.expireToken = Date.now() + 3600000
//      user.save().then((result)=>{

//               transporter.sendMail(mailOptions,function(error,info){
//           if(err){
//             console.log(err);

//           }else{
//             console.log('Email sent :'+info.response);
//           }
//         });

//      })
//        res.json({message:"check your email"})
//    })
//  })
// };
