import { Webhook } from "svix";
import User from "../models/User.js";

// API controller function to manage Clerk users in the database
export const clerkWebhooks = async (req, res) => {
  try {
    // Verify the webhook signature
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET); // fixed typo: WECRET → SECRET

    const payload = JSON.stringify(req.body);
    const headers = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    await whook.verify(payload, headers);

    // Clerk sends body as: { data: {...}, type: "user.created" }
    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userdata = {
          _id: data.id,
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        await User.create(userdata);
        res.status(200).json({ success: true });
        break;
      }

      case "user.updated": {
        const userdata = {
          email: data.email_addresses[0]?.email_address,
          name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userdata);
        res.status(200).json({ success: true });
        break;
      }

      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.status(200).json({ success: true });
        break;
      }

      default:
        res.status(400).json({ success: false, message: "Unknown event type" });
        break;
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
