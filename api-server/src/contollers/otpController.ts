import nodemailer from "nodemailer";
import {Otp} from "../models/dbModels";
import dotenv from "dotenv";

dotenv.config();


const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    }
});

const sendOTPEmail = (toEmail: string, subject: string,  message: string) => {
    const mailOptions = {
        from: {
            name: "KMM Chat",
            address: process.env.GMAIL_USER || ""
        },
        to: toEmail,
        subject: subject,
        text: message
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(info.response);
        }
    });
}

const generateOTP = () => {
    let otp = "";
    for (let i = 1; i <= 4; i++) {
        otp += Math.floor(10 * Math.random())
    }
    return otp;
}

const otpExpiry = () => {
    // after 5 minutes the otp will expire
    const minutes = 5 * 60 * 1000;
    return new Date(Date.now() + minutes);
}

const sendOtp = async (email: string, code: string, subject: string, message: string)=> {
    const expiry = otpExpiry();
    const existingOtp = await Otp.findOne({userEmail: email});
    if (existingOtp) {
        await Otp.deleteOne({userEmail: email});
    }
    await Otp.create({
        userEmail:email,
        code,
        expiry
    });
    // sendOTPEmail(email, subject, message);
    // In testing, you might comment this out

    return {message: 'OTP sent to your email'};
}

export const sendOtpForSignUp = async (email: string) => {
    const code = generateOTP();
    const subject = "Verify Your KMM Chat Account";
    const message = `Your One-Time Password (OTP) is: ${code} for signing up on the KMM Chat. Please do not share it with anyone and use it within the next 5 minutes.`;
    return await sendOtp(email, code, subject, message);
}

export const sendOtpForPassReset = async (email: string) => {
    const code = generateOTP();
    const subject = "Password Reset Request";
    const message = `Your One-Time Password (OTP) is: ${code} for password reset on the KMM Chat. Please do not share it with anyone and use it within the next 5 minutes.`;
    return await sendOtp(email, code, subject, message);
}

export const otpValidation = async(code: string, email: string) => {
    const otp = await Otp.findOne({userEmail: email});
    if(otp){
        const otpCode = otp.code
        const createdAt = new Date(otp.createdAt);
        const timeDiff = Date.now() - createdAt.getTime();
        const fiveMinutes = 5*60*1000;
        if(timeDiff>fiveMinutes) return false;
        return otpCode == code;
    }
    return false;
}