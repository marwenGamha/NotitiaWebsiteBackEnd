const mongoose = require("mongoose");

const Role = mongoose.model("Role");

module.exports.createRole = (req, res) => {
  let newrole = new Role({
    dashboard: req.body.dashboard,
    user: req.body.user,
    valeur: req.body.valeur,
    team: req.body.team,
    contact: req.body.contact,
    client: req.body.client,
    services: req.body.services,
  });
  newrole.save((err, role) => {
    if (err) {
      console.log(
        "there is Error in creating  role :" + JSON.stringify(err, undefined, 2)
      );
    } else {
      res.send(role);
    }
  });
};

module.exports.putrole = (req, res) => {
  var temp = {
    dashboard: req.body.dashboard,
    user: req.body.user,
    valeur: req.body.valeur,
    team: req.body.team,
    contact: req.body.contact,
    client: req.body.client,
    services: req.body.services,
  };

  Role.findByIdAndUpdate(
    "6130a64c5822161f30fbd3d1",
    { $set: temp },
    { new: true },
    (err, doc) => {
      if (!err) {
        res.send(doc);
      } else {
        console.log(
          "Error in role Update :" + JSON.stringify(err, undefined, 2)
        );
      }
    }
  );
};

module.exports.getallRole = (req, res, next) => {
  Role.findById("6130a64c5822161f30fbd3d1", (err, docs) => {
    if (!err) {
      res.send(docs);
    } else {
      console.log(
        "Error in Retriving role :" + JSON.stringify(err, undefined, 2)
      );
    }
  });
};
