import express from "express";
import rateLimit from "express-rate-limit";
import { body } from "express-validator";
import {
    forgotPassword,
    getCurrentUser,
    googleAuth,
    googleAuthCallback,
    googleAuthWithIdToken,
    login,
    logout,
    register,
    resendVerification,
    resetPassword,
    sendPhoneOtp,
    verifyEmail,
    verifyPhoneOtp,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later.",
    },
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many OTP attempts. Please try again later.",
    },
});

authRouter.post(
    "/register",
    authLimiter,
    [
        body("name").trim().notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isString().withMessage("Password is required"),
    ],
    register
);

authRouter.post(
    "/login",
    authLimiter,
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isString().withMessage("Password is required"),
    ],
    login
);

authRouter.post("/logout", logout);
authRouter.get("/me", protect, getCurrentUser);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleAuthCallback);
authRouter.post("/google/callback", googleAuthCallback);
authRouter.post("/google", googleAuthWithIdToken);

authRouter.post("/send-phone-otp", otpLimiter, sendPhoneOtp);
authRouter.post("/verify-phone-otp", otpLimiter, verifyPhoneOtp);

authRouter.post("/forgot-password", authLimiter, forgotPassword);
authRouter.post("/reset-password", authLimiter, resetPassword);

authRouter.post("/verify-email", verifyEmail);
authRouter.post("/resend-verification", protect, resendVerification);

export default authRouter;
