import { Mongoose } from "mongoose";
const CourseProgressSchema=new Mongoose.Schema({
    userId:{type:String,ref:'User',required:true},
    courseId:{type:String,ref:'Course',required:true},
    completed:{type:Boolean,default:false},
   Lecturescompleted:[
       
    ],       
},{minimize:false})

export const CourseProgress=Mongoose.model('CourseProgress',CourseProgressSchema);