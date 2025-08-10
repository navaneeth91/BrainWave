import { Webhook } from "svix";
import User from "../models/User.js";

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
      case "user.created": {
        const userdata = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name+ " "+data.last_name,
          imageUrl: data.image_url,
        }
        await User.create(userdata)
        res.json({})
        break;
      }

      case "user.updated": {
        const userdata = {
          email: data.email_addresses[0].email_address,
          name: data.first_name +" " +data.last_name ,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userdata)
        res.json({ })
        break;
      }

      case "user.deleted": {
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
