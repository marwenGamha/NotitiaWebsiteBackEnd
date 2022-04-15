const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class SendEmailToUs {
  constructor(user) {
    this.to = user.email;
    this.fullName = user.fullName;
    this.number = user.number;
    this.subjectt = user.subject;
    this.message = user.message;

    this.form = `Notitia<${process.env.EMAIL_USERNAME}>`;
    // try this later `marwen Gamha<${process.env.EMAIL_USERNAME}>`;
  }

  newwTransport() {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //send the actual email

  sendd(template, subject) {
    //1) Render html based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      fullName: this.fullName,
      email: this.to,
      number: this.number,
      subjectt: this.subjectt,
      message: this.message,
      subject,
    });

    //2) Define email options
    const mailOptions = {
      from: this.from,
      to: process.env.COMPANY_EMAIL,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    //3) create a transport and send email

    this.newwTransport().sendMail(mailOptions);
  }
  sendSociety() {
    this.sendd("newMsg", `we get new msg from : ${this.fullName} `);
  }
};
