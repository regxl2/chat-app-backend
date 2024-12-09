import express from "express";
import {
    signUp,
    login,
    resendOtpForSignUp,
    passwordResetRequest,
    passResetOtpVerification, signUpOtpVerification, changePassword, resendOtpForPassReset, authenticate
} from "../contollers/authController";
import {authMiddleware} from "../middlewares/authMiddleware";

export const authRouter = express.Router();

authRouter.get("/authenticate", authMiddleware, authenticate);
authRouter.post("/signup", signUp);
authRouter.post("/verify-signup-otp", signUpOtpVerification);
authRouter.post("/resend-otp-signup", resendOtpForSignUp);
authRouter.post("/login", login);
authRouter.post("/forgot-password", passwordResetRequest);
authRouter.post("/verify-reset-otp", passResetOtpVerification);
authRouter.post("/resend-otp-pass", resendOtpForPassReset);
authRouter.post("/change-password", changePassword);