const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.fullName.split(" ")[0];
    this.url = url;
    this.form = process.env.EMAIL_USERNAME;
    // try this later `marwen Gamha<${process.env.EMAIL_USERNAME}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //send the actual email

  async send(template, subject) {
    //1) Render html based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    //3) create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }
  sendWelcome() {
    this.send("welcome", "We have received your message");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset link(valid for 2 hour) "
    );
  }
};

// orginal

// const sendEmail = async (options) => {

//   // 1) create a transporter
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: process.env.EMAIL_USERNAME,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     // html :`
//     // <p>You requested for password reset</p>
//     // <h5>click in this <a href="google.com">link</a> to reset password</h5> `
//   };

//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
