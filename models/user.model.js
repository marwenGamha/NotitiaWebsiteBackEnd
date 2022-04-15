const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

var userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: "Full name can't be empty",
  },
  email: {
    type: String,
    required: "Email can't be empty",
    unique: true,
  },
  password: {
    type: String,
    required: "Password can't be empty",
    minlength: [4, "Password must be atleast 4 character long"],
  },
  role: {
    type: String,
    enum: ["admin", "superAdmin"],
    default: "admin",
    required: "you need to put role",
  },
  creation_dt: { type: Date, require: true },

  photo: {
    type: String,
    default: "http://localhost:3000/public/img/user/default.png",
  },

  passwordChangedAt: Date,
  passwordRestToken: String,
  passwordResetExpires: Date,

  saltSecret: String,
});

// Custom validation for email
userSchema.path("email").validate((val) => {
  emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(val);
}, "Invalid e-mail.");

// Events
userSchema.pre("save", async function (next) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(this.password, salt, (err, hash) => {
      this.password = hash;
      this.saltSecret = salt;
      next();
    });
  });
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// Methods
userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXP,
  });
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordRestToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordRestToken);
  this.passwordResetExpires = Date.now() + 120 * 60 * 1000;
  return resetToken;
};

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model("User", userSchema);
