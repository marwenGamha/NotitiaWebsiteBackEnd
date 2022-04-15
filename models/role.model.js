const mongoose = require("mongoose");

var roleSchema = new mongoose.Schema({
  dashboard: {
    type: String,
    required: true,
  },
  valeur: {
    type: String,
    required: true,
  },
  services: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  client: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
