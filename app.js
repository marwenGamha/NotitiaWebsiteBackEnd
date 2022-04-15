require("./config/config");
require("./models/db");
require("./config/passportConfig");
const rateLimit = require("express-rate-limit");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");

const rtsIndex = require("./routes/index.router");

var app = express();

const Limiter = rateLimit({
  max: 10000, //request /hour
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP,Please try again in an hour!",
});

app.use("/api", Limiter);

// middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use("/api", rtsIndex);
app.use("/public/img/team", express.static(path.join("public/img/team")));
app.use("/public/img/user", express.static(path.join("public/img/user")));
app.use("/public/img/clientt", express.static(path.join("public/img/clientt")));

// error handler
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    var valErrors = [];
    Object.keys(err.errors).forEach((key) =>
      valErrors.push(err.errors[key].message)
    );
    res.status(422).send(valErrors);
  } else {
    console.log(err);
  }
});

// start server
app.listen(process.env.PORT, () =>
  console.log(`Server started at port : ${process.env.PORT}`)
);
