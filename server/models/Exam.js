import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },

    educatorId: {
        type: String,
        required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    passingScore: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 70,
    },

    timeLimit: {
      type: Number,
      required: true,
      min: 1,
      default: 30,
    },

    maxAttempts: {
      type: Number,
      required: true,
      min: 1,
      default: 3,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Exam =
  mongoose.models.Exam ||
  mongoose.model("Exam", examSchema);

export default Exam;