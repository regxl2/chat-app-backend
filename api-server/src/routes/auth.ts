import express from "express";
import {
    signUp,
    login,
    resendOtp,
    passwordResetRequest,
    passResetOtpVerification, signUpOtpVerification, changePassword
} from "../contollers/authController";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/verify-signup-otp", signUpOtpVerification);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/login", login);
authRouter.post("/forgot-password", passwordResetRequest);
authRouter.post("/verify-reset-otp", passResetOtpVerification);
authRouter.post("/change-password", changePassword);