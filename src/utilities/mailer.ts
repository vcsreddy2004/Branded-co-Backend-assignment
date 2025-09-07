import nodemailer from 'nodemailer';
import config from '../config';
export async function sendOTP(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USER,  
      pass: config.GMAIL_APP_PASSWORD   
    }
  });
  const mailOptions = {
    from: `"AuthX" <${config.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP for Registration is: ${otp}`,
    html: `<p>Your <strong>OTP for Registration</strong> is: <b>${otp}</b></p>`
  };
  await transporter.sendMail(mailOptions);
}
export async function sendResetOTP(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.GMAIL_USER,  
      pass: config.GMAIL_APP_PASSWORD   
    }
  });
  const mailOptions = {
    from: `"AuthX" <${config.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP to reset password is: ${otp}`,
    html: `<p>Your <strong>OTP to Reset Password</strong> is: <b>${otp}</b></p>`
  };
  await transporter.sendMail(mailOptions);
}