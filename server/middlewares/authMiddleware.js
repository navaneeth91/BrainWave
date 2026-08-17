import { clerkClient } from "@clerk/express";


//middleware  to (prtect educator routes)

export const protectEducator=async(req,res,next)=>{
    try {
         const userId=req.auth?.userId

         if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
         }

         const response=await clerkClient.users.getUser(userId)

         if(response.publicMetadata.role!=='educator')
         {
            return res.status(403).json({ success: false, message: 'Unauthorized Access. Educator role required.' });
         }
         next()

    } catch (error) {
        res.status(401).json({success:false,message: 'Authentication failed. Please login again.'})
    }
}