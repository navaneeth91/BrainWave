import{clerkClient} from '@clerk/express'
import Course from '../models/Course.js'
import {v2 as cloudinary} from 'cloudinary'
import e from 'express'
//update role to eductaor
export const updateRoleToEducator=async(req,res)=>{
    try {
        const userId=req.auth.userId

        await clerkClient.users.updateUserMetadata(userId,{
            publicMetadata:{
                role:'educator',
            }
        })
        res.json({success:true,message:'you can publich a course now'})

    }
     catch (error) {
        res.json({success:false,message:error.message})
    }
}

//add new Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail not attached' });
        }

        // Upload thumbnail to Cloudinary first
        const imageUpload = await cloudinary.uploader.upload(imageFile.path);

        // Parse course data and attach thumbnail + educator
        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        // Now create the course
        await Course.create(parsedCourseData);

        res.json({ success: true, message: 'Course added' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//get Educator cources

export const getEducatorCourses=async(req,res)=>{
    try {
        const educator=req.auth.userId

        const courses=await Course.find({educator})
        res.json({success:true,courses})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//get educator dashboard data
export const educatorDashboardData= async(req,res)=>{
    try {
        const educator=req.auth.userId; 
        const courses=await Course.find({educator});
        const totalCourses=courses.length;

        const courseIds=courses.map(course=>course._id);

        //calclate toyal earings

         const purchases =await Purchase.find({
            courseId:{$in:courseIds},
            status:'Completed'
         });
         const totalEarnings=purchases.reduce((sum,purchase)=>sum+purchase.amount,0);

         //collect unique enrolled student Ids with their course titles

         const enrolledStudentsData=[];
         for(const course of courses)
         {
            const students =await User.find({
                _id:{$in:course.enrolledStudents}
            },'name imageUrl');
            students.forEach(student => {
                enrolledStudentsData.push({
                
                    courseTitle: course.courseTitle,
                    student
                });
            });
         }
         res.json({
            success:true,
            dashboardData:{
                totalCourses,
                totalEarnings,
                enrolledStudentsData
            }
         })
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

// get enrolled studentd data with Purchase data

export const getEnrolledStudentsData=async(req,res)=>{
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator});
        const courseIds = courses.map(course => course._id);
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'Completed'
        }).populate('userId', 'name imageUrl').populate('courseId','courseTitle')
        const enrolledStudents=purchases.map(purchase => ({
            student:purchase.userId,
            courseTitle:purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt

        }))
        res.json({success:true,enrolledStudents})
    }
    catch(error)
    {
        res.json({success:false,message:error.message})
    }
}