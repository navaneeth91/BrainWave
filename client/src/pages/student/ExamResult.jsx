import React, {
  useEffect,
  useState,
  useContext,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const ExamResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const {
    backendUrl,
    getToken,
  } = useContext(AppContext);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingCertificate, setGeneratingCertificate] =
    useState(false);

  // ========================================
  // FETCH EXAM RESULT
  // ========================================

  const fetchResult = async () => {
    try {
      setLoading(true);

      const token = await getToken();

      const { data } = await axios.get(
        `${backendUrl}/api/exam/attempt/${attemptId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!data.success) {
        toast.error(
          data.message || "Unable to load exam result"
        );

        navigate(-1);
        return;
      }

      setResult(data.attempt);
    } catch (error) {
      console.error(
        "Fetch result error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load exam result"
      );

      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD RESULT
  // ========================================

  useEffect(() => {
    if (attemptId) {
      fetchResult();
    }
  }, [attemptId]);

  // ========================================
  // GENERATE CERTIFICATE
  // ========================================

  const generateCertificate = async () => {
    try {
      if (!result?.courseId) {
        toast.error(
          "Course information not available"
        );
        return;
      }

      setGeneratingCertificate(true);

      const token = await getToken();

      const { data } = await axios.post(
        `${backendUrl}/api/user/generate-certificate/${result.courseId}`,
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
            "Unable to generate certificate"
        );
        return;
      }

      toast.success(
        "Certificate generated successfully!"
      );

      // Navigate to your EXISTING certificate page
      navigate(
        `/certificate/${data.certificate.certificateId}`
      );
    } catch (error) {
      console.error(
        "Certificate generation error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to generate certificate"
      );
    } finally {
      setGeneratingCertificate(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return <Loading />;
  }

  // ========================================
  // NO RESULT
  // ========================================

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">

          <div className="text-4xl mb-4">
            ⚠️
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            Result not found
          </h2>

          <p className="text-gray-500 mt-2">
            We couldn't find your exam result.
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

  // ========================================
  // RESULT VALUES
  // ========================================

  const passed = result.passed;

  const percentage = Number(
    result.percentage || 0
  );

  const score = Number(
    result.score || 0
  );

  const totalMarks = Number(
    result.totalMarks || 0
  );

  const passingScore = Number(
    result.passingScore || 0
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-2xl">

        {/* ========================================
            MAIN RESULT CARD
        ======================================== */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* ========================================
              HEADER
          ======================================== */}

          <div
            className={`p-8 text-center ${
              passed
                ? "bg-green-50"
                : "bg-red-50"
            }`}
          >

            <div className="text-6xl mb-4">
              {passed ? "🎉" : "📚"}
            </div>

            <h1
              className={`text-3xl font-bold ${
                passed
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {passed
                ? "Congratulations!"
                : "Keep Learning!"}
            </h1>

            <p className="mt-2 text-gray-600">

              {passed
                ? "You have successfully passed the final exam."
                : "You did not meet the passing score this time."}

            </p>

          </div>

          {/* ========================================
              RESULT CONTENT
          ======================================== */}

          <div className="p-8">

            {/* SCORE */}

            <div className="text-center">

              <p className="text-sm text-gray-500">
                Your Score
              </p>

              <p
                className={`text-6xl font-bold mt-2 ${
                  passed
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {percentage}%
              </p>

              <p className="text-gray-500 mt-2">
                {score} / {totalMarks} marks
              </p>

            </div>

            {/* ========================================
                STATISTICS
            ======================================== */}

            <div className="grid grid-cols-2 gap-4 mt-8">

              {/* Passing Score */}

              <div className="bg-gray-50 rounded-xl p-4 text-center">

                <p className="text-sm text-gray-500">
                  Passing Score
                </p>

                <p className="text-xl font-bold text-gray-800 mt-1">
                  {passingScore}%
                </p>

              </div>

              {/* Status */}

              <div className="bg-gray-50 rounded-xl p-4 text-center">

                <p className="text-sm text-gray-500">
                  Status
                </p>

                <p
                  className={`text-xl font-bold mt-1 ${
                    passed
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passed
                    ? "PASSED"
                    : "FAILED"}
                </p>

              </div>

            </div>

            {/* ========================================
                TIME EXPIRED
            ======================================== */}

            {result.timeExpired && (
              <div className="mt-5 p-4 rounded-lg bg-red-50 border border-red-200">

                <p className="text-sm text-red-700 text-center font-medium">
                  ⏰ The exam time limit was exceeded.
                </p>

              </div>
            )}

            {/* ========================================
                PASSED — CERTIFICATE
            ======================================== */}

            {passed && (
              <div className="mt-8 p-5 rounded-xl bg-orange-50 border border-orange-200 text-center">

                <div className="text-3xl mb-2">
                  🏆
                </div>

                <h2 className="font-bold text-gray-800">
                  Certificate Unlocked!
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  Congratulations! You passed the
                  final exam. Your certificate is ready.
                </p>

                <button
                  onClick={generateCertificate}
                  disabled={generatingCertificate}
                  className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                >
                  {generatingCertificate
                    ? "Generating..."
                    : "Generate Certificate"}
                </button>

              </div>
            )}

            {/* ========================================
                FAILED
            ======================================== */}

            {!passed && (
              <div className="mt-8 p-5 rounded-xl bg-red-50 border border-red-200 text-center">

                <div className="text-3xl mb-2">
                  📖
                </div>

                <h2 className="font-bold text-gray-800">
                  Exam Not Passed
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  You need at least{" "}
                  <span className="font-semibold">
                    {passingScore}%
                  </span>{" "}
                  to pass this exam.
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Your score was{" "}
                  <span className="font-semibold">
                    {percentage}%
                  </span>
                  .
                </p>

              </div>
            )}

            {/* ========================================
                ACTION BUTTONS
            ======================================== */}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">

              {/* Back to Course */}

              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                ← Back to Course
              </button>

              {/* Retry */}

              {!passed && (
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
                >
                  Try Again
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ExamResult;