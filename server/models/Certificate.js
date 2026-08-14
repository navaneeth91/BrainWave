import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: String,
      required: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    courseTitle: {
      type: String,
      required: true,
    },

    ceoName: {
      type: String,
      default: "Navaneeth Siliveri",
    },

    ceoSignature: {
      type: String,
      default: "",
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);

export default Certificate;