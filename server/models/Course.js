import mongoose  from "mongoose";

const lectureSchema=new mongoose.Schema({
    lectureId:{type:String,required:true},
    lectureTitle:{type:String,required:true},
    lectureDuration:{type:Number,required:true},
    lectureUrl:{type:String,required:true},
    lecturePublicId:{type:String,default:""},
    isPreviewFree:{type:Boolean,required:true},
    lectureOrder:{type:Number,required:true},
    // ==========================================
    // Automatic lecture transcription (faster-whisper)
    // Added for the BrainWave transcription feature. The transcript belongs
    // to this specific lecture. Existing courses simply keep the defaults.
    // ==========================================
    transcript:{type:String,default:""},
    transcriptionStatus:{
        type:String,
        enum:['not_started','processing','completed','failed'],
        default:'not_started'
    },
    transcriptionLanguage:{type:String,default:""},
    transcriptionDuration:{type:Number,default:0},
    // The Cloudinary publicId this transcript was generated from. Used to
    // invalidate a stale transcript when a lecture's video is replaced.
    transcriptionSourcePublicId:{type:String,default:""},
    // Safe, human-readable error message (no internal stack traces).
    transcriptionError:{type:String,default:""},
    transcriptionStartedAt:{type:Date,default:null},
    transcriptionCompletedAt:{type:Date,default:null},
},{_id:false})

const chapterSchema=new mongoose.Schema({
    chapterId:{type:String,required:true},
    chapterOrder:{type:Number,required:true},
    chapterTitle:{type:String,required:true},
    chapterContent:[lectureSchema],

},{_id:false})
const CourseSchema=new mongoose.Schema({
    courseTitle:{type:String,required:true},
    courseDescription:{type:String,required:true},
    courseThumbnail:{type:String,required:true},
    coursePrice:{type:Number,required:true},
    isPublished:{type:Boolean,default:true},
    discount:{type:Number,required:true ,min:0,max:100},
    courseContent:[chapterSchema],
    courseRatings:[
        { userid:{type:String},rating:{type:Number,min:1,max:5}}
    ],
    educator:{type:String,ref:'User',required:true},
    enrolledStudents:[
        {type:String,ref:'User'}
    ],


},{timestamps:true,minimize:false})

const Course=mongoose.model('Course',CourseSchema)
export default Course;