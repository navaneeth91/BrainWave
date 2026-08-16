import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("========================================");
        console.log("JWT RECEIVED");
        console.log("Decoded JWT:", decoded);
        console.log("Decoded userId:", decoded.userId);
        console.log("========================================");

        if (
            !decoded?.userId ||
            !mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token",
            });
        }

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        req.auth = {
            userId: user._id.toString(),
            user,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication",
        });
    }
};

export const protectEducator = async (req, res, next) => {
    try {
        if (!req.auth?.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (req.auth.user.role !== "educator") {
            return res.status(403).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};