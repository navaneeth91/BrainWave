import { Webhook } from "svix";
import User from "../models/User.js";
import { response } from "express";

//api controller function to mange clerk user with  database

export const clerkWebhooks=async(req,res)=>{
    try{
        const whook=new Webhook(process.env.CLERK_WEBHOOK_WECRET)
        await whook.verify(JSON.stringify(req.body),{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp":req.headers["svix-timestamp"],
            "svix-signature":req.headers["svix-signature"]
            
            
        })
        const [data,type]=req.body

        switch(type){
            case 'user.created':{
                    const userdata={
                        _id:data.id,
                        email:data.email_addresses[0].email_address,
                        name:data.first_name+" "+data.last_name,
                        imageUrl:data.image_url,
                    }
                    await User.create(userdata)
                    res.json({})
                    break;
            }
            case 'user.updated':{
                    const userdata={
                        _id:data.id,
                        email:data.email_address[0].email_address,
                        name:data.first_name+" "+data.last_name,
                        imageUrl:data.image_url,
                    }
                    await User.findByIdAndUpdate(data.id,userdata)
                    res.json({})
                    break;
            }
             case 'user.deleted':{
                await User.findByIdAndDelete(data.id)
                res.json({})
                    break;
             }


            default:break;
        }
    }
    catch(error)
    {
        res.json({success:false, message:error.message})
    }
}