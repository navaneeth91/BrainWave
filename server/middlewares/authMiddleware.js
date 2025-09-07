import { clerkClient } from "@clerk/express";


//middleware  to (prtect educator routes)

export const protectEducator=async(req,res,next)=>{
    try {
         const userId=req.auth.userId
         const response=await clerkClient.users.getUser(userId)

         if(response.publicMetadata.role!=='educator')
         {
            return res.json({success:false,message: 'Unauthorized Acess'})
         }
         next()

    } catch (error) {
        res.json({success:false,message: error.message})
    }
}