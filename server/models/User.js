import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
            select: false,
        },

        imageUrl: {
            type: String,
            default: "",
        },

        role: {
            type: String,
            enum: ["student", "educator"],
            default: "student",
        },

        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
            },
        ],

        // ==========================================
        // GOOGLE AUTH
        // ==========================================

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        // ==========================================
        // PHONE AUTH
        // ==========================================

        phoneNumber: {
            type: String,
            unique: true,
            sparse: true,
        },

        phoneVerified: {
            type: Boolean,
            default: false,
        },

        // ==========================================
        // AUTH PROVIDER
        // ==========================================

        authProvider: {
            type: String,
            enum: [
                "local",
                "google",
                "phone",
                "hybrid",
            ],
            default: "local",
        },

        // ==========================================
        // EMAIL
        // ==========================================

        emailVerified: {
            type: Boolean,
            default: false,
        },

        emailVerificationTokenHash: {
            type: String,
            select: false,
        },

        emailVerificationExpiresAt: {
            type: Date,
            select: false,
        },

        // ==========================================
        // PASSWORD RESET
        // ==========================================

        passwordResetTokenHash: {
            type: String,
            select: false,
        },

        passwordResetExpiresAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

const User =
    mongoose.models.User ||
    mongoose.model("User", UserSchema);

export default User;