import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import User from "../models/User.js";
import { getAuthCookieOptions, clearAuthCookieOptions } from "../utils/authCookies.js";
import { sendEmail } from "../services/emailService.js";
import {
    getGoogleAuthUrl,
    getGoogleProfileFromCode,
    verifyGoogleIdToken,
} from "../services/googleAuthService.js";
import { sendOtp, verifyOtp } from "../services/otpProvider.js";

const phoneCooldownStore = new Map();

const createToken = (user) => {
    const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    console.log("========================================");
    console.log("JWT CREATED");
    console.log("MongoDB User ID:", user._id.toString());
    console.log("JWT Token:", token);
    console.log("========================================");

    return token;
};
const setAuthCookie = (res, user) => {
    res.cookie("token", createToken(user), getAuthCookieOptions());
};

const toSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email || "",
    imageUrl: user.imageUrl || "",
    role: user.role,
    enrolledCourses: user.enrolledCourses || [],
    phoneNumber: user.phoneNumber || "",
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
});

const normalizeEmail = (email) => email.trim().toLowerCase();

const passwordStrongEnough = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

const createHash = (value) => crypto.createHash("sha256").update(value).digest("hex");

const getResetUrl = (token) => `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

const getVerificationUrl = (token) => `${process.env.FRONTEND_URL}/login?verifyToken=${token}`;

const upsertGoogleUser = async (payload) => {
    const googleId = payload.sub;
    const email = payload.email ? normalizeEmail(payload.email) : "";
    const name = payload.name || "Google User";
    const imageUrl = payload.picture || "";

    let user = await User.findOne({ googleId });
    if (!user && email) user = await User.findOne({ email });

    if (user) {
        user.googleId = googleId;
        if (!user.email && email) user.email = email;
        if (!user.name) user.name = name;
        if (!user.imageUrl && imageUrl) user.imageUrl = imageUrl;
        user.emailVerified = user.emailVerified || Boolean(payload.email_verified);
        user.authProvider = user.authProvider === "local" ? "hybrid" : "google";
        await user.save();
        return user;
    }

    return User.create({
        name,
        email,
        imageUrl,
        googleId,
        emailVerified: Boolean(payload.email_verified),
        authProvider: "google",
        role: "student",
    });
};

export const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!passwordStrongEnough(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
        });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: "student",
        authProvider: "local",
    });

    setAuthCookie(res, user);

    return res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: toSafeUser(user),
    });
};

export const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user || !user.password) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    setAuthCookie(res, user);

    return res.status(200).json({
        success: true,
        message: "Login successful",
        user: toSafeUser(user),
    });
};

export const logout = async (_req, res) => {
    res.clearCookie("token", clearAuthCookieOptions());
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

export const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        success: true,
        user: toSafeUser(req.auth.user),
    });
};

export const googleAuth = async (_req, res) => {
    try {
        const url = getGoogleAuthUrl();
        return res.status(200).json({ success: true, url });
    } catch (error) {
        return res.status(503).json({ success: false, message: error.message });
    }
};

export const googleAuthCallback = async (req, res) => {
    const code = req.query?.code || req.body?.code;
    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?google=failed`);
    }

    try {
        const profile = await getGoogleProfileFromCode(code);
        const user = await upsertGoogleUser(profile);
        setAuthCookie(res, user);
        return res.redirect(`${process.env.FRONTEND_URL}/login?google=success`);
    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?google=failed`);
    }
};

export const googleAuthWithIdToken = async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        return res.status(400).json({ success: false, message: "Google token is required" });
    }

    try {
        const payload = await verifyGoogleIdToken(idToken);
        const user = await upsertGoogleUser(payload);
        setAuthCookie(res, user);
        return res.status(200).json({
            success: true,
            message: "Google login successful",
            user: toSafeUser(user),
        });
    } catch (error) {
        return res.status(401).json({ success: false, message: "Google authentication failed" });
    }
};

export const sendPhoneOtp = async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const parsed = parsePhoneNumberFromString(phoneNumber);
    if (!parsed || !parsed.isValid()) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const normalized = parsed.number;
    const existingCooldown = phoneCooldownStore.get(normalized);
    const now = Date.now();
    const cooldownMs = Number(process.env.OTP_RESEND_COOLDOWN_MS || 60000);

    if (existingCooldown && now < existingCooldown) {
        const retryAfter = Math.ceil((existingCooldown - now) / 1000);
        return res.status(429).json({
            success: false,
            message: `Please wait ${retryAfter}s before requesting another OTP`,
            retryAfter,
        });
    }

    try {
        await sendOtp(normalized);
        phoneCooldownStore.set(normalized, now + cooldownMs);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            cooldownSeconds: Math.ceil(cooldownMs / 1000),
            expiresInSeconds: Number(process.env.OTP_EXPIRES_IN_SECONDS || 600),
        });
    } catch (error) {
        return res.status(503).json({ success: false, message: error.message });
    }
};

export const verifyPhoneOtp = async (req, res) => {
    const { phoneNumber, otp, name } = req.body;
    if (!phoneNumber || !otp) {
        return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
    }

    const parsed = parsePhoneNumberFromString(phoneNumber);
    if (!parsed || !parsed.isValid()) {
        return res.status(400).json({ success: false, message: "Invalid phone number" });
    }

    const normalized = parsed.number;

    let approved = false;
    try {
        approved = await verifyOtp(normalized, otp);
    } catch (error) {
        return res.status(503).json({ success: false, message: error.message });
    }

    if (!approved) {
        return res.status(401).json({ success: false, message: "Invalid or expired OTP" });
    }

    let user = await User.findOne({ phoneNumber: normalized });
    if (!user) {
        user = await User.create({
            name: name?.trim() || "Phone User",
            email: `${normalized.replace("+", "")}@phone.brainwave.local`,
            phoneNumber: normalized,
            phoneVerified: true,
            authProvider: "phone",
            role: "student",
        });
    } else {
        user.phoneVerified = true;
        if (!user.authProvider || user.authProvider === "local") {
            user.authProvider = "hybrid";
        }
        await user.save();
    }

    setAuthCookie(res, user);
    return res.status(200).json({
        success: true,
        message: "Phone verification successful",
        user: toSafeUser(user),
    });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (user) {
        const rawToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetTokenHash = createHash(rawToken);
        user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        const resetUrl = getResetUrl(rawToken);
        try {
            await sendEmail({
                to: user.email,
                subject: "BrainWave password reset",
                text: `Reset your password: ${resetUrl}`,
                html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
            });
        } catch (error) {
            return res.status(503).json({ success: false, message: error.message });
        }
    }

    return res.status(200).json({
        success: true,
        message: "If this email exists, a password reset link has been sent",
    });
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ success: false, message: "Token and password are required" });
    }

    if (!passwordStrongEnough(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
        });
    }

    const tokenHash = createHash(token);
    const user = await User.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.authProvider = user.authProvider === "phone" ? "hybrid" : (user.authProvider || "local");
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password reset successful",
    });
};

export const verifyEmail = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Verification token is required" });
    }

    const tokenHash = createHash(token);
    const user = await User.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() },
    }).select("+emailVerificationTokenHash +emailVerificationExpiresAt");

    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Email verified successfully" });
};

export const resendVerification = async (req, res) => {
    const user = req.auth?.user;
    if (!user?.email) {
        return res.status(400).json({ success: false, message: "User email is not available" });
    }

    if (user.emailVerified) {
        return res.status(200).json({ success: true, message: "Email is already verified" });
    }

    const dbUser = await User.findById(user._id).select("+emailVerificationTokenHash +emailVerificationExpiresAt");
    const rawToken = crypto.randomBytes(32).toString("hex");
    dbUser.emailVerificationTokenHash = createHash(rawToken);
    dbUser.emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await dbUser.save();

    const verifyUrl = getVerificationUrl(rawToken);
    try {
        await sendEmail({
            to: dbUser.email,
            subject: "Verify your BrainWave email",
            text: `Verify your email: ${verifyUrl}`,
            html: `<p>Verify your email using this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        });
    } catch (error) {
        return res.status(503).json({ success: false, message: error.message });
    }

    return res.status(200).json({
        success: true,
        message: "Verification email sent",
    });
};
