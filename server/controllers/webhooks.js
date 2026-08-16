import Purchase from "../models/Purchase.js";
import Course from "../models/Course.js";
import Stripe from "stripe";
import User from "../models/User.js";
import mongoose from "mongoose";

const stripeInstance = new Stripe(
    process.env.STRIPE_SECRET_KEY
);


// =====================================================
// FIND USER FROM PURCHASE
// =====================================================

const findUserFromPurchase = async (purchase) => {
    try {
        const userId = purchase?.userId;

        if (!userId) {
            return null;
        }

        // New authentication system:
        // Purchase.userId should contain MongoDB ObjectId
        if (mongoose.Types.ObjectId.isValid(userId)) {
            const user = await User.findById(userId);

            if (user) {
                return user;
            }
        }

        // Old Clerk purchases
        // Only use this if your old User model still has clerkId.
        if (typeof userId === "string" && userId.startsWith("user_")) {
            const oldUser = await User.findOne({
                clerkId: userId,
            });

            if (oldUser) {
                return oldUser;
            }
        }

        return null;
    } catch (error) {
        console.error(
            "findUserFromPurchase error:",
            error.message
        );

        return null;
    }
};


// =====================================================
// STRIPE WEBHOOK
// =====================================================

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event =
            stripeInstance.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
    } catch (err) {
        console.error(
            "Stripe webhook signature error:",
            err.message
        );

        return res
            .status(400)
            .send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            // ==========================================
            // PAYMENT SUCCESS
            // ==========================================

            case "payment_intent.succeeded": {

                const paymentIntent =
                    event.data.object;

                const paymentIntentId =
                    paymentIntent.id;

                const sessions =
                    await stripeInstance
                        .checkout.sessions.list({
                            payment_intent:
                                paymentIntentId,
                        });

                if (!sessions.data.length) {
                    throw new Error(
                        "No checkout session found for this payment"
                    );
                }

                const purchaseId =
                    sessions.data[0].metadata
                        ?.purchaseId;

                if (!purchaseId) {
                    throw new Error(
                        "Purchase ID missing from Stripe metadata"
                    );
                }

                const purchaseData =
                    await Purchase.findById(
                        purchaseId
                    );

                if (!purchaseData) {
                    throw new Error(
                        "Purchase not found"
                    );
                }

                const userData =
                    await findUserFromPurchase(
                        purchaseData
                    );

                const courseData =
                    await Course.findById(
                        purchaseData.courseId
                    );

                if (userData && courseData) {

                    // ==================================
                    // ADD STUDENT TO COURSE
                    // ==================================

                    const alreadyCourseStudent =
                        courseData.enrolledStudents.some(
                            (id) =>
                                id.toString() ===
                                userData._id.toString()
                        );

                    if (!alreadyCourseStudent) {

                        courseData.enrolledStudents.push(
                            userData._id
                        );

                        await courseData.save();
                    }


                    // ==================================
                    // ADD COURSE TO USER
                    // ==================================

                    const alreadyEnrolled =
                        userData.enrolledCourses.some(
                            (courseId) =>
                                courseId.toString() ===
                                courseData._id.toString()
                        );

                    if (!alreadyEnrolled) {

                        userData.enrolledCourses.push(
                            courseData._id
                        );

                        await userData.save();
                    }
                }

                // ==================================
                // UPDATE PURCHASE
                // ==================================

                purchaseData.status =
                    "Completed";

                await purchaseData.save();

                break;
            }


            // ==========================================
            // PAYMENT FAILED
            // ==========================================

            case "payment_intent.payment_failed": {

                const paymentIntent =
                    event.data.object;

                const paymentIntentId =
                    paymentIntent.id;

                const sessions =
                    await stripeInstance
                        .checkout.sessions.list({
                            payment_intent:
                                paymentIntentId,
                        });

                if (sessions.data.length) {

                    const purchaseId =
                        sessions.data[0]
                            .metadata?.purchaseId;

                    if (purchaseId) {

                        const purchaseData =
                            await Purchase.findById(
                                purchaseId
                            );

                        if (purchaseData) {

                            purchaseData.status =
                                "Failed";

                            await purchaseData.save();
                        }
                    }
                }

                break;
            }


            default:
                break;
        }

        return res.json({
            received: true,
        });

    } catch (error) {

        console.error(
            "Webhook handling error:",
            error
        );

        return res
            .status(500)
            .send("Internal Server Error");
    }
};