import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";

///get user data
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
        res.json({success:true,session_url:session.url})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//UPDATE USER COURSE PROGRESS
 export const updateCourseProgress=async(req,res)=>{    
    try {
        const userId=req.auth.userId;
        const{courseId,lectureId}=req.body;
        const progressData=await CourseProgress.findOne({userId,courseId});
        if(progressData)
        {
            if(progressData.lectureCompleted.includes(lectureId))
            {
                return res.json({success:true,message:"Lecture Already Marked as Completed"})
            }
           progressData.lectureCompleted.push(lectureId);
           await progressData.save();
        }
        else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted:[lectureId]
            });
        }
        return res.json({success:true,message:"Progress Updated Successfully"});
    }
    catch(error)
    {
        return res.json({success:false,message:error.message});
    }
}

//get user course progress
export const getCourseProgress=async(req,res)=>{
    try {
        const userId=req.auth.userId;
        const{courseId}=req.body;
        const progressData=await CourseProgress.findOne({userId});
        if(!progressData)
        {
            return res.json({success:false,message:"No Progress Data Found"});
        }
        return res.json({success:true,progressData});
    }
    catch(error)
    {
        return res.json({success:false,message:error.message});
    }
}

//add user rating to course
export const addUserRating=async(req,res)=>{

        const userId=req.auth.userId;
        const{courseId,rating}=req.body;
        
        if(!userId||!courseId||!rating||rating<1||rating>5)
        {
            return res.json({success:false,message:"Invalid Input"});
        }
        try {
            const courseData=await Course.findById(courseId);
            if(!courseData)
            {
                return res.json({success:false,message:"Course Not Found"});
            }
            const user=await User.findById(userId);
            if(!user|| !user.enrolledCourses.includes(courseId))
            {
                return res.json({success:false,message:"User Not Enrolled in the Course"});
            }
            const existingRatingIndex=courseData.courseRatings.findIndex(r=>r.userid===userId);
            if(existingRatingIndex!==-1)
            {
                courseData.courseRatings[existingRatingIndex].rating=rating;
            }
            else{
                courseData.courseRatings.push({userid:userId,rating})
            }
            await courseData.save();
            return res.json({success:true,message:"Rating Submitted Successfully"});
        }
        catch(error)
        {
            return res.json({success:false,message:error.message});
        }
    }
