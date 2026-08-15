import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const {
    backendUrl,
    getToken,
  } = useContext(AppContext);

  // =========================
  // STATE
  // =========================

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(null);

  const [attempt, setAttempt] = useState(null);

  const timerRef = useRef(null);

  // =========================
  // START / RESUME EXAM
  // =========================

  const startExam = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/exam/${examId}/start`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message);
        navigate(-1);
        return null;
      }

      setAttempt(data.attempt);

      return data.attempt;
    } catch (error) {
      console.error("Start exam error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to start exam"
      );

      navigate(-1);

      return null;
    }
  };

  const submitExam = async () => {
  try {
    if (!attempt?.attemptId) {
      toast.error("Exam attempt not found");
      return;
    }

    const token = await getToken();

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })
    );

    const { data } = await axios.post(
      `${backendUrl}/api/exam/${examId}/submit`,
      {
        attemptId: attempt.attemptId,
        answers: formattedAnswers,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data.success) {
      toast.error(data.message);
      return;
    }

    toast.success("Exam submitted successfully!");

    // Go to result page
    navigate(`/student/exam-result/${attempt.attemptId}`);
  } catch (error) {
    console.error("Submit exam error:", error);

    toast.error(
      error.response?.data?.message ||
        "Unable to submit exam"
    );
  }
  };
  const handleSubmitExam = () => {
  const unanswered =
    questions.length -
    Object.keys(answers).length;

  if (unanswered > 0) {
    const confirmSubmit = window.confirm(
      `You have ${unanswered} unanswered question${
        unanswered > 1 ? "s" : ""
      }. Are you sure you want to submit?`
    );

    if (!confirmSubmit) {
      return;
    }
  } else {
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your exam?"
    );

    if (!confirmSubmit) {
      return;
    }
  }

  submitExam();
  };
  // =========================
  // FETCH EXAM
  // =========================

  const fetchExam = async () => {
    try {
      setLoading(true);

      // Start or resume attempt first
      const examAttempt = await startExam();

      if (!examAttempt) {
        return;
      }

      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/exam/${examId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(data.message);
        navigate(-1);
        return;
      }

      setExam(data.exam);
      setQuestions(data.questions || []);

      // =========================
      // SERVER-BASED TIMER
      // =========================

      if (
        data.exam?.timeLimit &&
        examAttempt?.startedAt
      ) {
        const startedAt = new Date(
          examAttempt.startedAt
        ).getTime();

        const now = Date.now();

        const elapsedSeconds = Math.floor(
          (now - startedAt) / 1000
        );

        const totalSeconds =
          data.exam.timeLimit * 60;

        const remainingSeconds = Math.max(
          totalSeconds - elapsedSeconds,
          0
        );

        setTimeLeft(remainingSeconds);
      }
    } catch (error) {
      console.error(
        "Fetch exam error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load exam"
      );

      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD EXAM
  // =========================

  useEffect(() => {
    if (examId) {
      fetchExam();
    }
  }, [examId]);

  // =========================
  // TIMER
  // =========================

  useEffect(() => {
    if (timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      clearInterval(timerRef.current);

      toast.error(
        "⏰ Time is up!"
      );

      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (
          prev === null ||
          prev <= 1
        ) {
          clearInterval(
            timerRef.current
          );

          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(
        timerRef.current
      );
    };
  }, [timeLeft]);

  // =========================
  // FORMAT TIME
  // =========================

  const formatTime = (seconds) => {
    if (seconds === null) {
      return "--:--";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    const remainingSeconds =
      seconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =========================
  // SELECT ANSWER
  // =========================

  const handleAnswer = (
    questionId,
    optionIndex
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  // =========================
  // NEXT QUESTION
  // =========================

  const handleNext = () => {
    setCurrentQuestion((prev) =>
      Math.min(
        prev + 1,
        questions.length - 1
      )
    );
  };

  // =========================
  // PREVIOUS QUESTION
  // =========================

  const handlePrevious = () => {
    setCurrentQuestion((prev) =>
      Math.max(prev - 1, 0)
    );
  };

  // =========================
  // CURRENT QUESTION
  // =========================

  const question =
    questions[currentQuestion];

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return <Loading />;
  }

  // =========================
  // EXAM NOT AVAILABLE
  // =========================

  if (
    !exam ||
    questions.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">

          <div className="text-4xl mb-4">
            🎓
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Exam not available
          </h2>

          <p className="text-gray-500 mt-2">
            This exam could not be loaded.
          </p>

          <button
            onClick={() => navigate(-1)}
            className="mt-5 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold"
          >
            Go Back
          </button>

        </div>

      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* ================================= */}
        {/* EXAM HEADER */}
        {/* ================================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">

          <div className="flex items-center justify-between gap-4">

            {/* Exam information */}

            <div>

              <div className="flex items-center gap-2">

                <span className="text-2xl">
                  🎓
                </span>

                <h1 className="text-2xl font-bold text-gray-800">
                  {exam.title}
                </h1>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                Final Assessment
              </p>

            </div>

            {/* Question + Timer */}

            <div className="flex items-center gap-6">

              {/* Question counter */}

              <div className="text-right">

                <p className="text-sm text-gray-500">
                  Question
                </p>

                <p className="text-lg font-bold text-gray-800">
                  {currentQuestion + 1} /{" "}
                  {questions.length}
                </p>

              </div>

              {/* Timer */}

              <div
                className={`px-4 py-2 rounded-lg border ${
                  timeLeft !== null &&
                  timeLeft <= 60
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-orange-50 border-orange-200 text-orange-600"
                }`}
              >

                <p className="text-xs font-medium">
                  Time Left
                </p>

                <p className="text-lg font-bold">
                  ⏱️ {formatTime(timeLeft)}
                </p>

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* PROGRESS BAR */}
          {/* ================================= */}

          <div className="w-full bg-gray-200 rounded-full h-2 mt-5">

            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    questions.length) *
                  100
                }%`,
              }}
            />

          </div>

        </div>

        {/* ================================= */}
        {/* QUESTION CARD */}
        {/* ================================= */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          {/* Question number */}

          <p className="text-sm text-gray-500 mb-3">
            Question {currentQuestion + 1}
          </p>

          {/* Question */}

          <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
            {question.questionText}
          </h2>

          {/* ================================= */}
          {/* OPTIONS */}
          {/* ================================= */}

          <div className="mt-6 space-y-3">

            {question.options?.map(
              (option, index) => {

                const selected =
                  answers[
                    question._id
                  ] === index;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      handleAnswer(
                        question._id,
                        index
                      )
                    }
                    className={`w-full text-left p-4 rounded-lg border transition ${
                      selected
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      {/* Option letter */}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                          selected
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(
                          65 + index
                        )}
                      </div>

                      {/* Option */}

                      <span className="text-gray-800">
                        {option}
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>

          {/* ================================= */}
          {/* NAVIGATION */}
          {/* ================================= */}

          <div className="flex items-center justify-between mt-8">

            {/* Previous */}

            <button
              type="button"
              onClick={handlePrevious}
              disabled={
                currentQuestion === 0
              }
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              ← Previous
            </button>

            {/* Next / Submit */}

            {currentQuestion <
            questions.length - 1 ? (

              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
              >
                Next →
              </button>

            ) : (

              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
                >
                Submit Exam ✓
              </button>

            )}

          </div>

        </div>

        {/* ================================= */}
        {/* ANSWER STATUS */}
        {/* ================================= */}

        <div className="mt-4 text-center">

          <p className="text-sm text-gray-500">

            Answered{" "}

            <span className="font-semibold text-gray-700">
              {Object.keys(answers).length}
            </span>

            {" "}of{" "}

            <span className="font-semibold text-gray-700">
              {questions.length}
            </span>

            {" "}questions

          </p>

        </div>

      </div>

    </div>
  );
};

export default Exam;