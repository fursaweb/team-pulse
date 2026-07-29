import nodemailer from "nodemailer";
import { envConfig } from "../../config/env";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const smtpOptions: SMTPTransport.Options = {
  host: envConfig.smtpHost,
  port: envConfig.smtpPort,
  secure: envConfig.smtpSecure,
  auth: {
    user: envConfig.smtpUser,
    pass: envConfig.smtpPassword,
  },
};

export const transporter = nodemailer.createTransport(smtpOptions);
