import nodemailer from "nodemailer";
const htmlToText = require("html-to-text");
import ejs from "ejs";
import path from "path";

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = `Admin <creamy-corner@mail.com>`;
    // this.otp = otp;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      // service: "gmail",
      // host: "smtp.gmail.com",
      // port: "587",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
        // user: process.env.EMAIL_GMAIL,
        // pass: process.env.PASSWORD_GMAIL,
      },
    });
  }

  // async send(template, subject) {
  //   const html = await ejs.renderFile(`${__dirname}/../views/${template}.ejs`, {
  //     email: this.to,
  //     url: this.url,
  //     // otp: this.otp,
  //     subject,
  //   });

  async send(template, subject) {
    const html = await ejs.renderFile(
      path.join(__dirname, `../views/${template}.ejs`),
      {
        email: this.to,
        url: this.url,
        subject,
      }
    );

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcomeEmail", "Welcome to the Creamy Corner!");
  }

  async sendPasswordReset() {
    await this.send(
      "ResetPasswordEmail",
      // "Your password reset token (valid for only 10 minutes)"
      "Password reset token"
    );
  }
}

export default Email;
