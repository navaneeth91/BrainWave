import mongoose from "mongoose";

const examQuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (options) {
          return options.length >= 2 && options.length <= 6;
        },
        message: "A question must have between 2 and 6 options.",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

const ExamQuestion =
  mongoose.models.ExamQuestion ||
  mongoose.model("ExamQuestion", examQuestionSchema);

export default ExamQuestion;