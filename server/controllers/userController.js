import Stripe from "stripe";

import Course from "../models/Course.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import CourseProgress from "../models/CourseProgress.js";
import Certificate from "../models/Certificate.js";
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";

const freeCoursesMode =
    process.env.FREE_COURSES_MODE !== "false";


// =====================================================
// GET LOGGED-IN USER DATA
// =====================================================

export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Get User Data Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GET USER ENROLLED COURSES
// =====================================================

export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const user = await User.findById(userId)
            .populate("enrolledCourses");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            enrolledCourses: user.enrolledCourses || [],
        });
    } catch (error) {
        console.error("Get Enrolled Courses Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// PURCHASE COURSE
// =====================================================

export const purchaseCourse = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const { courseId } = req.body;
        const { origin } = req.headers;

        if (!courseId) {
            return res.json({
                success: false,
                message: "Course ID is required",
            });
        }

        const userData = await User.findById(userId);
        const courseData = await Course.findById(courseId);

        if (!userData || !courseData) {
            return res.json({
                success: false,
                message: "User or Course Not Found",
            });
        }

        const alreadyEnrolled =
            userData.enrolledCourses.some(
                (enrolledCourseId) =>
                    enrolledCourseId.toString() ===
                    courseData._id.toString()
            );

        if (alreadyEnrolled) {
            return res.json({
                success: true,
                sessionUrl: `${origin}/loading/my-enrollments`,
            });
        }

        // FREE COURSES
        if (freeCoursesMode) {
            await Purchase.create({
                courseId: courseData._id,
                userId: userData._id,
                amount: 0,
                status: "Completed",
            });

            if (
                !courseData.enrolledStudents.some(
                    (id) =>
                        id.toString() === userData._id.toString()
                )
            ) {
                courseData.enrolledStudents.push(userData._id);
                await courseData.save();
            }

            userData.enrolledCourses.push(courseData._id);
            await userData.save();

            return res.json({
                success: true,
                sessionUrl: `${origin}/loading/my-enrollments`,
            });
        }

        // PAID COURSE
        const amount = (
            courseData.coursePrice -
            (courseData.discount * courseData.coursePrice) / 100
        ).toFixed(2);

        const purchaseData = {
            courseId: courseData._id,
            userId: userData._id,
            amount,
        };

        const newPurchase =
            await Purchase.create(purchaseData);

        const stripeInstance = new Stripe(
            process.env.STRIPE_SECRET_KEY
        );

        const currency =
            process.env.CURRENCY.toLowerCase();

        const line_items = [
            {
                price_data: {
                    currency,
                    product_data: {
                        name: courseData.courseTitle,
                        description:
                            courseData.courseDescription,
                    },
                    unit_amount:
                        Math.floor(Number(newPurchase.amount)) *
                        100,
                },
                quantity: 1,
            },
        ];

        const session =
            await stripeInstance.checkout.sessions.create({
                success_url:
                    `${origin}/loading/my-enrollments`,
                cancel_url: `${origin}/`,
                line_items,
                mode: "payment",
                metadata: {
                    purchaseId:
                        newPurchase._id.toString(),
                },
            });

        return res.json({
            success: true,
            sessionUrl: session.url,
        });
    } catch (error) {
        console.error("Purchase Course Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// UPDATE COURSE PROGRESS
// =====================================================

export const updateCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const { courseId, lectureId } = req.body;

        if (!courseId || !lectureId) {
            return res.json({
                success: false,
                message:
                    "Course ID and Lecture ID are required",
            });
        }

        const course =
            await Course.findById(courseId);

        if (!course) {
            return res.json({
                success: false,
                message: "Course Not Found",
            });
        }

        let progressData =
            await CourseProgress.findOne({
                userId,
                courseId,
            });

        if (!progressData) {
            progressData =
                await CourseProgress.create({
                    userId,
                    courseId,
                    lectureCompleted: [lectureId],
                    completed: false,
                });
        } else {
            if (
                !progressData.lectureCompleted.includes(
                    lectureId
                )
            ) {
                progressData.lectureCompleted.push(
                    lectureId
                );
            }

            await progressData.save();
        }

        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            if (
                Array.isArray(
                    chapter.chapterContent
                )
            ) {
                totalLectures +=
                    chapter.chapterContent.length;
            }
        });

        const completedLectures =
            progressData.lectureCompleted.length;

        const isCompleted =
            totalLectures > 0 &&
            completedLectures >= totalLectures;

        progressData.completed = isCompleted;

        await progressData.save();

        return res.json({
            success: true,
            message: isCompleted
                ? "Course Completed Successfully"
                : "Progress Updated Successfully",

            completed: isCompleted,

            progressData: {
                courseId:
                    progressData.courseId,
                lectureCompleted:
                    progressData.lectureCompleted,
                completed:
                    progressData.completed,
                completedLectures,
                totalLectures,
            },
        });
    } catch (error) {
        console.error(
            "Update Course Progress Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GET COURSE PROGRESS
// =====================================================

export const getCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const { courseId } = req.params;

        if (!courseId) {
            return res.json({
                success: false,
                message: "Course ID is required",
            });
        }

        const course =
            await Course.findById(courseId);

        if (!course) {
            return res.json({
                success: false,
                message: "Course Not Found",
            });
        }

        const progressData =
            await CourseProgress.findOne({
                userId,
                courseId,
            });

        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            if (
                Array.isArray(
                    chapter.chapterContent
                )
            ) {
                totalLectures +=
                    chapter.chapterContent.length;
            }
        });

        if (!progressData) {
            return res.json({
                success: true,

                progressData: {
                    courseId,
                    lectureCompleted: [],
                    completed: false,
                    completedLectures: 0,
                    totalLectures,
                },
            });
        }

        const completedLectures =
            progressData.lectureCompleted.length;

        const isCompleted =
            totalLectures > 0 &&
            completedLectures >= totalLectures;

        return res.json({
            success: true,

            progressData: {
                courseId:
                    progressData.courseId,
                lectureCompleted:
                    progressData.lectureCompleted,
                completed: isCompleted,
                completedLectures,
                totalLectures,
            },
        });
    } catch (error) {
        console.error(
            "Get Course Progress Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// ADD / UPDATE COURSE RATING
// =====================================================

export const addUserRating = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const {
            courseId,
            rating,
        } = req.body;

        const ratingValue = Number(rating);

        if (
            !courseId ||
            !ratingValue ||
            ratingValue < 1 ||
            ratingValue > 5
        ) {
            return res.json({
                success: false,
                message: "Invalid Input",
            });
        }

        const courseData =
            await Course.findById(courseId);

        if (!courseData) {
            return res.json({
                success: false,
                message: "Course Not Found",
            });
        }

        const user =
            await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User Not Found",
            });
        }

        const enrolled =
            user.enrolledCourses.some(
                (id) =>
                    id.toString() ===
                    courseId.toString()
            );

        if (!enrolled) {
            return res.json({
                success: false,
                message:
                    "User Not Enrolled in the Course",
            });
        }

        const existingRatingIndex =
            courseData.courseRatings.findIndex(
                (r) =>
                    r.userid.toString() ===
                    userId.toString()
            );

        if (existingRatingIndex !== -1) {
            courseData.courseRatings[
                existingRatingIndex
            ].rating = ratingValue;
        } else {
            courseData.courseRatings.push({
                userid: user._id,
                rating: ratingValue,
            });
        }

        await courseData.save();

        return res.json({
            success: true,
            message: "Rating Submitted Successfully",
        });
    } catch (error) {
        console.error("Rating Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GENERATE CERTIFICATE
// =====================================================

export const generateCertificate = async (
    req,
    res
) => {
    try {
        const userId = req.auth.userId;

        const { courseId } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const course =
            await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // COURSE COMPLETION
        const progress =
            await CourseProgress.findOne({
                userId,
                courseId,
            });

        if (!progress || !progress.completed) {
            return res.status(400).json({
                success: false,
                message:
                    "Please complete the course before generating the certificate",
            });
        }

        // EXAM
        const exam =
            await Exam.findOne({
                courseId,
                isPublished: true,
            });

        if (!exam) {
            return res.status(404).json({
                success: false,
                message:
                    "Final exam is not available for this course",
            });
        }

        // PASSED ATTEMPT
        const passedAttempt =
            await ExamAttempt.findOne({
                userId,
                examId: exam._id,
                passed: true,
            }).sort({
                completedAt: -1,
            });

        if (!passedAttempt) {
            return res.status(403).json({
                success: false,
                message:
                    "You must pass the final exam before receiving the certificate",
            });
        }

        // EXISTING CERTIFICATE
        const existingCertificate =
            await Certificate.findOne({
                userId,
                courseId,
            });

        if (existingCertificate) {
            return res.status(200).json({
                success: true,
                message:
                    "Certificate already exists",
                certificate:
                    existingCertificate,
            });
        }

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const certificateId =
            `CERT-${Date.now()}-${Math.floor(
                1000 +
                    Math.random() *
                        9000
            )}`;

        const verificationCode =
            `VERIFY-${Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase()}`;

        const certificate =
            await Certificate.create({
                certificateId,
                userId,
                courseId,

                studentName:
                    user.name ||
                    "Student",

                courseTitle:
                    course.courseTitle,

                ceoName:
                    "Navaneeth Siliveri",

                ceoSignature:
                    "",

                issuedAt:
                    new Date(),

                verificationCode,
            });

        return res.status(201).json({
            success: true,
            message:
                "Certificate generated successfully",
            certificate,
        });
    } catch (error) {
        console.error(
            "Generate Certificate Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GET CERTIFICATE
// =====================================================

export const getCertificate = async (
    req,
    res
) => {
    try {
        const userId = req.auth.userId;

        const { courseId } = req.params;

        const certificate =
            await Certificate.findOne({
                userId,
                courseId,
            });

        if (!certificate) {
            return res.json({
                success: false,
                message:
                    "Certificate not found",
            });
        }

        return res.json({
            success: true,
            certificate,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GET ALL USER CERTIFICATES
// =====================================================

export const getUserCertificates = async (
    req,
    res
) => {
    try {
        const userId = req.auth.userId;

        const certificates =
            await Certificate.find({
                userId,
            })
                .populate(
                    "courseId",
                    "courseTitle courseThumbnail"
                )
                .sort({
                    issuedAt: -1,
                });

        return res.json({
            success: true,
            certificates,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// GET CERTIFICATE BY ID
// =====================================================

export const getCertificateById = async (
    req,
    res
) => {
    try {
        const userId = req.auth.userId;

        const { certificateId } = req.params;

        const certificate =
            await Certificate.findOne({
                certificateId,
                userId,
            }).populate(
                "courseId",
                "courseTitle courseThumbnail"
            );

        if (!certificate) {
            return res.json({
                success: false,
                message:
                    "Certificate not found",
            });
        }

        return res.json({
            success: true,
            certificate,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// =====================================================
// VERIFY CERTIFICATE
// =====================================================

export const verifyCertificate = async (
    req,
    res
) => {
    try {
        const { certificateId } =
            req.params;

        if (!certificateId) {
            return res.json({
                success: false,
                message:
                    "Certificate ID is required",
            });
        }

        const certificate =
            await Certificate.findOne({
                certificateId,
            }).populate(
                "courseId"
            );

        if (!certificate) {
            return res.json({
                success: false,
                message:
                    "Certificate not found",
            });
        }

        return res.json({
            success: true,
            message:
                "Certificate is valid",
            certificate,
        });
    } catch (error) {
        console.error(
            "Certificate Verification Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};