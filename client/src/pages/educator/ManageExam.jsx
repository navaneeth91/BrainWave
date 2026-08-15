import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Globe,
  Plus,
  Trash2,
  Trophy,
  Users,
  XCircle,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
} from "lucide-react";

const ManageExam = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { backendUrl, getToken } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  // Exam details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(3);

  // Question form
  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [marks, setMarks] = useState(1);

  // ==========================================
  // GET EXISTING EXAM
  // ==========================================

  const fetchExam = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/exam/educator`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message || "Unable to load exams");
        return;
      }

      const existingExam = data.exams?.find(
        (item) =>
          item.courseId?._id?.toString() === courseId?.toString() ||
          item.courseId?.toString() === courseId?.toString()
      );

      if (!existingExam) {
        setExam(null);
        setQuestions([]);
        return;
      }

      const examResponse = await axios.get(
        `${backendUrl}/api/exam/educator/${existingExam._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!examResponse.data.success) {
        toast.error(
          examResponse.data.message || "Unable to load exam"
        );
        return;
      }

      const loadedExam = examResponse.data.exam;

      setExam(loadedExam);

      setTitle(loadedExam.title || "");
      setDescription(loadedExam.description || "");
      setPassingScore(loadedExam.passingScore ?? 70);
      setTimeLimit(loadedExam.timeLimit ?? 30);
      setMaxAttempts(loadedExam.maxAttempts ?? 3);

      setQuestions(examResponse.data.questions || []);
    } catch (error) {
      console.error("Fetch exam error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load exam"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchExam();
    }
  }, [courseId]);

  // ==========================================
  // CREATE EXAM
  // ==========================================

  const createExam = async () => {
    try {
      if (!title.trim()) {
        toast.error("Enter exam title");
        return;
      }

      if (passingScore < 1 || passingScore > 100) {
        toast.error(
          "Passing score must be between 1 and 100"
        );
        return;
      }

      if (timeLimit < 1) {
        toast.error(
          "Time limit must be greater than 0"
        );
        return;
      }

      if (maxAttempts < 1) {
        toast.error(
          "Maximum attempts must be greater than 0"
        );
        return;
      }

      setSaving(true);

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/exam/create`,
        {
          courseId,
          title: title.trim(),
          description: description.trim(),
          passingScore: Number(passingScore),
          timeLimit: Number(timeLimit),
          maxAttempts: Number(maxAttempts),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message || "Unable to create exam"
        );
        return;
      }

      setExam(data.exam);

      toast.success(
        "Final exam created successfully!"
      );
    } catch (error) {
      console.error("Create exam error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to create exam"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ADD QUESTION
  // ==========================================

  const addQuestion = async () => {
    try {
      if (!exam?._id) {
        toast.error("Create the exam first");
        return;
      }

      if (!questionText.trim()) {
        toast.error("Enter the question");
        return;
      }

      if (
        !optionA.trim() ||
        !optionB.trim() ||
        !optionC.trim() ||
        !optionD.trim()
      ) {
        toast.error("Enter all four options");
        return;
      }

      if (correctAnswer < 0 || correctAnswer > 3) {
        toast.error("Select the correct answer");
        return;
      }

      if (marks < 1) {
        toast.error("Marks must be greater than 0");
        return;
      }

      setAddingQuestion(true);

      const token = await getToken();

      const options = [
        optionA.trim(),
        optionB.trim(),
        optionC.trim(),
        optionD.trim(),
      ];

      const { data } = await axios.post(
        `${backendUrl}/api/exam/question`,
        {
          examId: exam._id,
          questionText: questionText.trim(),
          options,
          correctAnswer: Number(correctAnswer),
          marks: Number(marks),
          order: questions.length + 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message || "Unable to add question"
        );
        return;
      }

      setQuestions((prev) => [
        ...prev,
        data.question,
      ]);

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer(0);
      setMarks(1);

      toast.success(
        "Question added successfully!"
      );
    } catch (error) {
      console.error("Add question error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to add question"
      );
    } finally {
      setAddingQuestion(false);
    }
  };

  // ==========================================
  // DELETE QUESTION
  // ==========================================

  const deleteQuestion = async (questionId) => {
    if (!questionId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      const token = await getToken();

      const { data } = await axios.delete(
        `${backendUrl}/api/exam/question/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message ||
            "Unable to delete question"
        );
        return;
      }

      setQuestions((prev) =>
        prev.filter(
          (question) =>
            question._id !== questionId
        )
      );

      toast.success(
        "Question deleted successfully"
      );
    } catch (error) {
      console.error(
        "Delete question error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to delete question"
      );
    }
  };

  // ==========================================
  // PUBLISH / UNPUBLISH
  // ==========================================

  const togglePublish = async () => {
    if (!exam?._id) {
      toast.error("Create the exam first");
      return;
    }

    if (
      !exam.isPublished &&
      questions.length === 0
    ) {
      toast.error(
        "Add at least one question before publishing"
      );
      return;
    }

    try {
      setPublishing(true);

      const token = await getToken();

      const { data } = await axios.patch(
        `${backendUrl}/api/exam/${exam._id}/publish`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message ||
            "Unable to update exam"
        );
        return;
      }

      setExam((prev) => ({
        ...prev,
        isPublished: data.isPublished,
      }));

      toast.success(data.message);
    } catch (error) {
      console.error(
        "Publish exam error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to update exam"
      );
    } finally {
      setPublishing(false);
    }
  };

  // ==========================================
  // CLEAR QUESTION FORM
  // ==========================================

  const clearQuestionForm = () => {
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer(0);
    setMarks(1);
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loading />;
  }

  // ==========================================
  // CALCULATIONS
  // ==========================================

  const totalMarks = questions.reduce(
    (total, question) =>
      total + Number(question.marks || 1),
    0
  );

  const hasQuestions = questions.length > 0;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ======================================
          TOP HEADER
      ====================================== */}

      <div className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            <div className="flex items-center gap-4">

              <button
                onClick={() =>
                  navigate("/educator/my-course")
                }
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition"
              >
                <ArrowLeft size={19} />
              </button>

              <div>

                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Trophy
                      size={15}
                      className="text-orange-600"
                    />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                    Assessment
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                  Final Exam Manager
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                  Create, manage and publish your course
                  final examination.
                </p>

              </div>

            </div>

            {/* Publish button */}

            {exam && (
              <button
                onClick={togglePublish}
                disabled={publishing}
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white shadow-sm transition disabled:opacity-60 ${
                  exam.isPublished
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {exam.isPublished ? (
                  <EyeOff size={17} />
                ) : (
                  <Globe size={17} />
                )}

                {publishing
                  ? "Updating..."
                  : exam.isPublished
                  ? "Unpublish Exam"
                  : "Publish Exam"}
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* ====================================
            OVERVIEW CARDS
        ==================================== */}

        {exam && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

            {/* Questions */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Questions
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {questions.length}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileQuestion
                    size={20}
                    className="text-blue-600"
                  />
                </div>

              </div>

            </div>

            {/* Total Marks */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Total Marks
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {totalMarks}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Trophy
                    size={20}
                    className="text-emerald-600"
                  />
                </div>

              </div>

            </div>

            {/* Time */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Time Limit
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {timeLimit}
                    <span className="text-sm font-medium text-slate-400 ml-1">
                      min
                    </span>
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Clock3
                    size={20}
                    className="text-purple-600"
                  />
                </div>

              </div>

            </div>

            {/* Passing */}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Passing Score
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {passingScore}
                    <span className="text-sm font-medium text-slate-400">
                      %
                    </span>
                  </p>
                </div>

                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <CheckCircle2
                    size={20}
                    className="text-orange-600"
                  />
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ====================================
            STATUS BANNER
        ==================================== */}

        {exam && (
          <div
            className={`rounded-2xl p-4 sm:p-5 mb-7 border ${
              exam.isPublished
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >

            <div className="flex items-start gap-3">

              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  exam.isPublished
                    ? "bg-emerald-100"
                    : "bg-amber-100"
                }`}
              >
                {exam.isPublished ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-600"
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className="text-amber-600"
                  />
                )}
              </div>

              <div>

                <p
                  className={`text-sm font-bold ${
                    exam.isPublished
                      ? "text-emerald-800"
                      : "text-amber-800"
                  }`}
                >
                  {exam.isPublished
                    ? "Exam is published"
                    : "Exam is currently a draft"}
                </p>

                <p
                  className={`text-xs mt-1 ${
                    exam.isPublished
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }`}
                >
                  {exam.isPublished
                    ? "Students can now access and take this final exam."
                    : "Add your questions and publish the exam when it is ready for students."}
                </p>

              </div>

            </div>

          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-7">

          {/* ==================================
              LEFT / MAIN CONTENT
          ================================== */}

          <div className="xl:col-span-2 space-y-7">

            {/* ==================================
                EXAM DETAILS
            ================================== */}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">

              <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <BookOpen
                      size={19}
                      className="text-orange-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Exam Details
                    </h2>

                    <p className="text-xs text-slate-400 mt-0.5">
                      Configure the basic examination settings
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">

                {/* Title */}

                <div className="mb-5">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Exam Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    disabled={!!exam}
                    placeholder="e.g. Python Programming Final Exam"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 disabled:text-slate-500 transition"
                  />

                </div>

                {/* Description */}

                <div className="mb-6">

                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    disabled={!!exam}
                    rows={4}
                    placeholder="Add instructions for students..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 disabled:text-slate-500 transition"
                  />

                </div>

                {/* Settings */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Passing Score
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={passingScore}
                        onChange={(e) =>
                          setPassingScore(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        disabled={!!exam}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 transition"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        %
                      </span>

                    </div>

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Time Limit
                    </label>

                    <div className="relative">

                      <input
                        type="number"
                        min="1"
                        value={timeLimit}
                        onChange={(e) =>
                          setTimeLimit(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        disabled={!!exam}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-14 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 transition"
                      />

                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        min
                      </span>

                    </div>

                  </div>

                  <div>

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Max Attempts
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={maxAttempts}
                      onChange={(e) =>
                        setMaxAttempts(
                          Number(
                            e.target.value
                          )
                        )
                      }
                      disabled={!!exam}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-slate-50 transition"
                    />

                  </div>

                </div>

                {/* Create */}

                {!exam && (
                  <button
                    onClick={createExam}
                    disabled={saving}
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white rounded-xl font-semibold text-sm shadow-sm transition"
                  >
                    <Save size={17} />

                    {saving
                      ? "Creating Exam..."
                      : "Create Final Exam"}
                  </button>
                )}

              </div>

            </section>

            {/* ==================================
                ADD QUESTION
            ================================== */}

            {exam && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">

                <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Plus
                          size={20}
                          className="text-blue-600"
                        />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800">
                          Add Question
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Create a multiple-choice question
                        </p>
                      </div>

                    </div>

                    <span className="hidden sm:block text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full">
                      Question {questions.length + 1}
                    </span>

                  </div>

                </div>

                <div className="p-5 sm:p-6">

                  {/* Question */}

                  <div className="mb-5">

                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Question
                    </label>

                    <textarea
                      value={questionText}
                      onChange={(e) =>
                        setQuestionText(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Type your question here..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition"
                    />

                  </div>

                  {/* Options */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {[
                      {
                        label: "A",
                        value: optionA,
                        setValue: setOptionA,
                      },
                      {
                        label: "B",
                        value: optionB,
                        setValue: setOptionB,
                      },
                      {
                        label: "C",
                        value: optionC,
                        setValue: setOptionC,
                      },
                      {
                        label: "D",
                        value: optionD,
                        setValue: setOptionD,
                      },
                    ].map((option) => (

                      <div key={option.label}>

                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Option {option.label}
                        </label>

                        <div className="relative">

                          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                            {option.label}
                          </span>

                          <input
                            type="text"
                            value={option.value}
                            onChange={(e) =>
                              option.setValue(
                                e.target.value
                              )
                            }
                            placeholder={`Enter option ${option.label}`}
                            className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition"
                          />

                        </div>

                      </div>

                    ))}

                  </div>

                  {/* Correct answer + marks */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Correct Answer
                      </label>

                      <select
                        value={correctAnswer}
                        onChange={(e) =>
                          setCorrectAnswer(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                      >
                        <option value={0}>
                          Option A
                        </option>

                        <option value={1}>
                          Option B
                        </option>

                        <option value={2}>
                          Option C
                        </option>

                        <option value={3}>
                          Option D
                        </option>
                      </select>

                    </div>

                    <div>

                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Marks
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={marks}
                        onChange={(e) =>
                          setMarks(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                      />

                    </div>

                  </div>

                  {/* Buttons */}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">

                    <button
                      onClick={addQuestion}
                      disabled={addingQuestion}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm transition"
                    >
                      <Plus size={17} />

                      {addingQuestion
                        ? "Adding Question..."
                        : "Add Question"}
                    </button>

                    <button
                      onClick={clearQuestionForm}
                      type="button"
                      className="px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm transition"
                    >
                      Clear
                    </button>

                  </div>

                </div>

              </section>
            )}

            {/* ==================================
                QUESTIONS
            ================================== */}

            {exam && (
              <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">

                <div className="px-5 sm:px-6 py-5 border-b border-slate-100">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                        <FileQuestion
                          size={19}
                          className="text-purple-600"
                        />
                      </div>

                      <div>
                        <h2 className="font-bold text-slate-800">
                          Exam Questions
                        </h2>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Review and manage your questions
                        </p>
                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-purple-50 text-purple-600">
                        {questions.length} Questions
                      </span>

                      <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                        {totalMarks} Marks
                      </span>

                    </div>

                  </div>

                </div>

                <div className="p-5 sm:p-6">

                  {!hasQuestions ? (

                    <div className="py-12 text-center">

                      <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FileQuestion
                          size={28}
                          className="text-slate-400"
                        />
                      </div>

                      <h3 className="font-semibold text-slate-700">
                        No questions yet
                      </h3>

                      <p className="text-sm text-slate-400 mt-1">
                        Add your first question above to
                        build the final exam.
                      </p>

                    </div>

                  ) : (

                    <div className="space-y-4">

                      {questions.map(
                        (question, index) => {

                          const correct =
                            Number(
                              question.correctAnswer
                            );

                          return (
                            <div
                              key={question._id}
                              className="border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 transition"
                            >

                              {/* Question header */}

                              <div className="bg-slate-50 px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3">

                                <div className="flex items-center gap-3">

                                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                                    {index + 1}
                                  </div>

                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                    Question {index + 1}
                                  </span>

                                </div>

                                <div className="flex items-center gap-3">

                                  <span className="text-xs font-semibold text-slate-500">
                                    {question.marks || 1}{" "}
                                    mark
                                    {Number(
                                      question.marks || 1
                                    ) !== 1
                                      ? "s"
                                      : ""}
                                  </span>

                                  <button
                                    onClick={() =>
                                      deleteQuestion(
                                        question._id
                                      )
                                    }
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                                    title="Delete question"
                                  >
                                    <Trash2 size={16} />
                                  </button>

                                </div>

                              </div>

                              {/* Question body */}

                              <div className="p-4 sm:p-5">

                                <p className="font-semibold text-slate-800 text-sm sm:text-base leading-relaxed">
                                  {question.questionText}
                                </p>

                                {/* Options */}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                                  {question.options?.map(
                                    (
                                      option,
                                      optionIndex
                                    ) => {

                                      const isCorrect =
                                        optionIndex ===
                                        correct;

                                      return (
                                        <div
                                          key={
                                            optionIndex
                                          }
                                          className={`relative flex items-center gap-3 p-3 rounded-xl border ${
                                            isCorrect
                                              ? "bg-emerald-50 border-emerald-200"
                                              : "bg-white border-slate-200"
                                          }`}
                                        >

                                          <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                              isCorrect
                                                ? "bg-emerald-500 text-white"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                          >
                                            {String.fromCharCode(
                                              65 +
                                                optionIndex
                                            )}
                                          </div>

                                          <span
                                            className={`text-sm ${
                                              isCorrect
                                                ? "text-emerald-700 font-medium"
                                                : "text-slate-600"
                                            }`}
                                          >
                                            {option}
                                          </span>

                                          {isCorrect && (
                                            <CheckCircle2
                                              size={17}
                                              className="ml-auto text-emerald-500 flex-shrink-0"
                                            />
                                          )}

                                        </div>
                                      );
                                    }
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>

                  )}

                </div>

              </section>
            )}

          </div>

          {/* ==================================
              RIGHT SIDEBAR
          ================================== */}

          <aside className="space-y-5">

            {/* Exam status */}

            {exam && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      exam.isPublished
                        ? "bg-emerald-50"
                        : "bg-amber-50"
                    }`}
                  >
                    {exam.isPublished ? (
                      <Globe
                        size={19}
                        className="text-emerald-600"
                      />
                    ) : (
                      <Eye
                        size={19}
                        className="text-amber-600"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      Publication
                    </h3>

                    <p className="text-xs text-slate-400">
                      Student visibility
                    </p>
                  </div>

                </div>

                <div
                  className={`rounded-xl p-4 ${
                    exam.isPublished
                      ? "bg-emerald-50"
                      : "bg-amber-50"
                  }`}
                >

                  <div className="flex items-center gap-2">

                    {exam.isPublished ? (
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />
                    ) : (
                      <AlertCircle
                        size={17}
                        className="text-amber-600"
                      />
                    )}

                    <span
                      className={`text-sm font-bold ${
                        exam.isPublished
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {exam.isPublished
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>

                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      exam.isPublished
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {exam.isPublished
                      ? "Students can access this exam."
                      : "Students cannot access this exam until it is published."}
                  </p>

                </div>

                <button
                  onClick={togglePublish}
                  disabled={publishing}
                  className={`w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    exam.isPublished
                      ? "border border-red-200 text-red-600 hover:bg-red-50"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {publishing
                    ? "Updating..."
                    : exam.isPublished
                    ? "Unpublish Exam"
                    : "Publish Exam"}
                </button>

              </div>
            )}

            {/* Exam configuration */}

            {exam && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

                <h3 className="font-bold text-slate-800">
                  Exam Configuration
                </h3>

                <div className="mt-5 space-y-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Clock3
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Time limit
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {timeLimit} min
                    </span>

                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Trophy
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Passing score
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {passingScore}%
                    </span>

                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Users
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Max attempts
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {maxAttempts}
                    </span>

                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <FileQuestion
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        Total questions
                      </span>

                    </div>

                    <span className="text-sm font-semibold text-slate-700">
                      {questions.length}
                    </span>

                  </div>

                </div>

              </div>
            )}

            {/* Publishing checklist */}

            {exam && (
              <div className="bg-slate-800 rounded-2xl p-5 text-white">

                <div className="flex items-center gap-2 mb-4">

                  <CheckCircle2
                    size={18}
                    className="text-orange-400"
                  />

                  <h3 className="font-bold">
                    Publishing Checklist
                  </h3>

                </div>

                <div className="space-y-3">

                  <div className="flex items-center gap-3">

                    {title.trim() ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-red-400"
                      />
                    )}

                    <span className="text-xs text-slate-300">
                      Exam title configured
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    {questions.length > 0 ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-red-400"
                      />
                    )}

                    <span className="text-xs text-slate-300">
                      At least one question
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    {passingScore > 0 ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-red-400"
                      />
                    )}

                    <span className="text-xs text-slate-300">
                      Passing score configured
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    {timeLimit > 0 ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-400"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        className="text-red-400"
                      />
                    )}

                    <span className="text-xs text-slate-300">
                      Time limit configured
                    </span>

                  </div>

                </div>

              </div>
            )}

          </aside>

        </div>

      </main>
    </div>
  );
};

export default ManageExam;