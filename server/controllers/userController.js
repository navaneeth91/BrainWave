import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import CourseProgress from "../models/CourseProgress.js";
import Certificate from "../models/Certificate.js";
export const getUserData = async(req,res)=>{
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId);
        if(!user)
        {
            return res.json({success:false,message:"User Not Found"})
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
//users Enrolled Courses with Lecture Links
 export const userEnrolledCourses = async(req,res)=>{
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate('enrolledCourses');
        if(!userData)
        {
            return res.json({success:false,message:"User Not Found"})
        }
        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

//purchase course
export const purchaseCourse=async(req,res)=>{
    try {
        const userId=req.auth.userId;
        const{courseId}=req.body;
        const {origin}=req.headers;
        const userData=await User.findById(userId);
        const courseData=await Course.findById(courseId); 
        console.log("purchaseCourse body:", req.body);
        console.log("User Data:", userData);
        console.log("Course Data:", courseData);
        if(!userData || !courseData)
        {
            return res.json({success:false,message:"User or Course Not Found"})
        }
        const purchaseData={
            courseId:courseData._id,
            userId,
            amount:(courseData.coursePrice-courseData.discount *courseData.coursePrice/100).toFixed(2),
        }
        const newPurchase=await Purchase.create(purchaseData);

        const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY);

        const currency= process.env.CURRENCY.toLowerCase();

        const line_items=[{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle,
                    description: courseData.courseDescription,
                },
                unit_amount: Math.floor(newPurchase.amount) * 100,
            },
            quantity: 1,
        }]

        const session=await stripeInstance.checkout.sessions.create({
            success_url:`${origin}/loading/my-enrollments`,
            cancel_url:`${origin}/`,
            line_items,
            mode:'payment',
            metadata:{
                purchaseId:newPurchase._id.toString(),

            }
        })
        res.json({ success: true, sessionUrl: session.url });


    } catch (error) {
        res.json({success:false,message:error.message})
    }
}


// UPDATE USER COURSE PROGRESS
export const updateCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId, lectureId } = req.body;

        if (!courseId || !lectureId) {
            return res.json({
                success: false,
                message: "Course ID and Lecture ID are required"
            });
        }

        // Check whether the course exists
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({
                success: false,
                message: "Course Not Found"
            });
        }

        // Find existing progress
        let progressData = await CourseProgress.findOne({
            userId,
            courseId
        });

        // Create progress document if it doesn't exist
        if (!progressData) {
            progressData = await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId],
                completed: false
            });
        } else {

            // Don't add the same lecture twice
            if (!progressData.lectureCompleted.includes(lectureId)) {
                progressData.lectureCompleted.push(lectureId);
            }

            await progressData.save();
        }

        // Calculate total lectures in the course
        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });

        // Check whether all lectures are completed
        const completedLectures =
            progressData.lectureCompleted.length;

        const isCompleted =
            totalLectures > 0 &&
            completedLectures >= totalLectures;

        // Update completed status
        if (progressData.completed !== isCompleted) {
            progressData.completed = isCompleted;
            await progressData.save();
        }

        return res.json({
            success: true,
            message: isCompleted
                ? "Course Completed Successfully"
                : "Progress Updated Successfully",
            completed: isCompleted,
            progressData: {
                courseId: progressData.courseId,
                lectureCompleted: progressData.lectureCompleted,
                completed: progressData.completed,
                completedLectures,
                totalLectures
            }
        });

    } catch (error) {
        console.error("Update Course Progress Error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};
//get user course progress
// GET USER COURSE PROGRESS
export const getCourseProgress = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.json({
                success: false,
                message: "Course ID is required"
            });
        }

        // Find course progress
        const progressData = await CourseProgress.findOne({
            userId,
            courseId
        });

        // Find the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({
                success: false,
                message: "Course Not Found"
            });
        }

        // Calculate total lectures
        let totalLectures = 0;

        course.courseContent.forEach((chapter) => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });

        // If user has no progress yet
        if (!progressData) {
            return res.json({
                success: true,
                progressData: {
                    courseId,
                    lectureCompleted: [],
                    completed: false,
                    completedLectures: 0,
                    totalLectures
                }
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
                courseId: progressData.courseId,
                lectureCompleted: progressData.lectureCompleted,
                completed: isCompleted,
                completedLectures,
                totalLectures
            }
        });

    } catch (error) {
        console.error("Get Course Progress Error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};
export const addUserRating = async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;
  const ratingValue = Number(rating);

  if (!userId || !courseId || !ratingValue || ratingValue < 1 || ratingValue > 5) {
    return res.json({ success: false, message: "Invalid Input" });
  }

  try {
    const courseData = await Course.findById(courseId);
    if (!courseData) return res.json({ success: false, message: "Course Not Found" });

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.json({ success: false, message: "User Not Enrolled in the Course" });
    }

    const existingRatingIndex = courseData.courseRatings.findIndex(
      r => r.userid.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      courseData.courseRatings[existingRatingIndex].rating = ratingValue;
    } else {
      courseData.courseRatings.push({ userid: userId, rating: ratingValue });
    }

    await courseData.save();
    return res.json({ success: true, message: "Rating Submitted Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
// GENERATE COURSE CERTIFICATE
export const generateCertificate = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.params;
        // Get logged-in user's details
        const user = await User.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        // Find the course
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({
                success: false,
                message: "Course not found"
            });
        }

        // Find student's course progress
        const progress = await CourseProgress.findOne({
            userId,
            courseId
        });

        if (!progress) {
            return res.json({
                success: false,
                message: "Course progress not found"
            });
        }

        // Check whether course is completed
        if (!progress.completed) {
            return res.json({
                success: false,
                message: "Complete the course before generating the certificate"
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
            userId,
            courseId
        });

        if (existingCertificate) {
            return res.json({
                success: true,
                message: "Certificate already generated",
                certificate: existingCertificate
            });
        }

        // Generate unique certificate ID
        const certificateId =
            "BW-" +
            Date.now().toString(36).toUpperCase();

        // Generate verification code
        const verificationCode =
            Math.random().toString(36).substring(2, 10).toUpperCase();

        // Create certificate
        const certificate = await Certificate.create({
            certificateId,
            userId,
            courseId,
            studentName: user.name,
            courseTitle: course.courseTitle,
            educatorName: "BrainWave",
            issuedAt: new Date(),
            verificationCode
        });

        return res.json({
            success: true,
            message: "Certificate generated successfully",
            certificate
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

// GET COURSE CERTIFICATE
export const getCertificate = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { courseId } = req.params;

        const certificate = await Certificate.findOne({
            userId,
            courseId
        });

        if (!certificate) {
            return res.json({
                success: false,
                message: "Certificate not found"
            });
        }

        return res.json({
            success: true,
            certificate
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};
// GET ALL CERTIFICATES OF LOGGED-IN USER
export const getUserCertificates = async (req, res) => {
    try {
        const userId = req.auth.userId;

        const certificates = await Certificate.find({ userId })
            .populate("courseId", "courseTitle courseThumbnail")
            .sort({ issuedAt: -1 });

        return res.json({
            success: true,
            certificates
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};
// GET CERTIFICATE BY CERTIFICATE ID
export const getCertificateById = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({
            certificateId,
            userId
        }).populate(
            "courseId",
            "courseTitle courseThumbnail"
        );

        if (!certificate) {
            return res.json({
                success: false,
                message: "Certificate not found"
            });
        }

        return res.json({
            success: true,
            certificate
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};
// VERIFY COURSE CERTIFICATE
export const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        if (!certificateId) {
            return res.json({
                success: false,
                message: "Certificate ID is required"
            });
        }

        const certificate = await Certificate.findOne({
            certificateId
        }).populate("courseId");

        if (!certificate) {
            return res.json({
                success: false,
                message: "Certificate not found"
            });
        }

        return res.json({
            success: true,
            message: "Certificate is valid",
            certificate
        });

    } catch (error) {
        console.error("Certificate verification error:", error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};