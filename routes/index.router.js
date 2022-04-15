const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();
const Post = mongoose.model("Post");

const ctrlUser = require("../controllers/user.controller");
const ctrlPost = require("../controllers/post.controller");
const ctrlTeam = require("../controllers/team.controller");
const ctrlContact = require("../controllers/contact.controller");
const ctrlRole = require("../controllers/role.controller");
const ctrlSer = require("../controllers/services.controller");
const ctrlClient = require("../controllers/client.controller");

const jwtHelper = require("../config/jwtHelper");

router.post("/register", ctrlUser.register);
router.post("/authenticate", ctrlUser.authenticate);
router.get("/userProfile", jwtHelper.verifyJwtToken, ctrlUser.userProfile);
router.get("/all", ctrlUser.getall);
router.delete("/delete/:id", ctrlUser.deleteUser);

router.put("/put/:id", ctrlUser.putUser);

router.post("/forgetPassword", ctrlUser.forgetPassword);
router.post("/forgetPass/:email", ctrlUser.forgetPass);

router.patch("/resetPassword/:token", ctrlUser.resetPassword);
router.patch("/updatePassword", ctrlUser.updatePassword);

// post routing
router.post("/newpost", jwtHelper.verifyJwtToken, ctrlPost.createPost);
router.get("/allposts", ctrlPost.getall);
router.delete("/deletepost/:id", ctrlPost.deletepost);
router.put("/updatepost/:id", ctrlPost.updatepost);

//team routing

router.post(
  "/createteam",
  jwtHelper.verifyJwtToken,
  ctrlTeam.uploadTeamPhoto,
  ctrlTeam.resizeUserPhoto,
  ctrlTeam.createTeam
);

router.get("/allteams", ctrlTeam.getallTeam);
router.delete("/deleteteam/:id", ctrlTeam.deleteTeam);
router.put(
  "/updateteam/:id",
  ctrlTeam.uploadTeamPhoto,
  ctrlTeam.resizeUserPhoto,
  ctrlTeam.putteam
);

//contact routing
router.post("/contact", ctrlContact.createContact);
router.get("/allcontact", ctrlContact.getallContact);
router.delete("/deletecontact/:id", ctrlContact.deletecontact);
//rolerou ting
router.post("/role", ctrlRole.createRole);
router.put("/putrole", ctrlRole.putrole);
router.get("/allrole", ctrlRole.getallRole);

//avatar
router.put(
  "/updateavatar/:id",
  ctrlUser.uploadUserPhoto,
  ctrlUser.resizePhoto,
  ctrlUser.putavatar
);

//services
router.post("/newser", jwtHelper.verifyJwtToken, ctrlSer.createSer);
router.get("/allser", ctrlSer.getallSer);
router.delete("/deleteser/:id", ctrlSer.deleteSer);
router.put("/updateser/:id", ctrlSer.updateSer);

//client

router.post(
  "/createclient",
  jwtHelper.verifyJwtToken,
  ctrlClient.uploadClientPhoto,
  ctrlClient.resizeUserPhoto,
  ctrlClient.createClient
);
router.get("/allclient", ctrlClient.getallClient);
router.delete("/deleteclient/:id", ctrlClient.deleteClient);
router.put(
  "/updateclient/:id",
  ctrlClient.uploadClientPhoto,
  ctrlClient.resizeUserPhoto,
  ctrlClient.putClient
);

module.exports = router;
