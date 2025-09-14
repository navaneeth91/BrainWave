import { Webhook } from "svix";
import User from "../models/User.js";
import  Purchase  from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";

// API controller function to manage Clerk users in the database
export const clerkWebhooks = async (req, res) => {
  try {
    // Verify the webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET); // fixed typo: WECRET → SECRET

    await whook.verify(JSON.stringify(req.body),  {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })

    // Clerk sends body as: { data: {...}, type: "user.created" }
    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userdata = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.create(userdata)
        res.json({})
        break;
      }

      case 'user.updated': {
        const userdata = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userdata)
        res.json({ })
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.json({ success: false, message: error.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async(req,res)=>{
   const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  }
  catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  //handle the event

   switch (event.type) {
    case 'payment_intent.succeeded':{
      const paymentIntent = event.data.object;
      const paymentIntentId=paymentIntent.id;
      const session=await stripeInstance.checkout.sessions.list({ 
        payment_intent: paymentIntentId

      })

      const {purchaseId}= sessions.data[0].metadata;

      const purchaseData =await Purchase.findById(purchaseId);
      const userData= await User.findById(purchaseData.userId)
      const courseData =await Course.findById(purchaseData.courseId.toString());
      courseData.enrolledStudents.push(userData)
      await courseData.save();
      userData.enrolledCourses.push(courseData._id)
      await userData.save()

      purchaseData.status='Completed'
      await purchaseData.save();


      break; 
    }
    case 'payment_intent.payment_failed':{
       const paymentIntent = event.data.object;
      const paymentIntentId=paymentIntent.id;
      const session=await stripeInstance.checkout.sessions.list({ 
        payment_intent: paymentIntentId

      })

      const {purchaseId}= sessions.data[0].metadata;
      const purchaseData =await Purchase.findById(purchaseId);
      purchaseData.status='Failed';
      await purchaseData.save();
      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});


}