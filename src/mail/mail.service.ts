import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

@Injectable()
export class MailService {
  async sendMail(subject: string, html: string, sendMailTo: string) {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_SERVICE_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: sendMailTo,
      subject: subject,
      html: html,
    };
    try {
      transporter.sendMail(mailOptions);
      return true;
    } catch (e) {
      console.log({ mailError: e.message });
      return false;
    }
  }
}
