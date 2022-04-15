const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, (err) => {
  if (!err) {
    console.log("MongoDB connection succeeded.");
  } else {
    console.log(
      "Error in MongoDB connection : " + JSON.stringify(err, undefined, 2)
    );
  }
});

require("./user.model");
require("./post.model");
require("./team.model");
require("./contact.model");
require("./role.model");
require("./services.model");
require("./client.model");

module.exports = mongoose;
