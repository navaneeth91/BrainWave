import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import connectDB from "./configs/mongodb.js";
import connectCloudinary from "./configs/cloudinary.js";

import { stripeWebhooks } from "./controllers/webhooks.js";

import eductaorRouter from "./routes/educatorRoutes.js";
import courseRouter from "./routes/courseRoute.js";
import userRouter from "./routes/userRoutes.js";
import examRouter from "./routes/examRoutes.js";
import authRouter from "./routes/authRoutes.js";

const app = express();


// =====================================================
// DATABASE
// =====================================================

await connectDB();


// =====================================================
// CLOUDINARY
// =====================================================

await connectCloudinary();


// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",

        credentials: true,
    })
);


// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());


// =====================================================
// COOKIE PARSER
// =====================================================

app.use(cookieParser());


// =====================================================
// TEST
// =====================================================

app.get("/", (req, res) => {
    res.send("API Working");
});


// =====================================================
// AUTH
// =====================================================

app.use(
    "/api/auth",
    authRouter
);


// =====================================================
// EDUCATOR
// =====================================================

app.use(
    "/api/educator",
    eductaorRouter
);


// =====================================================
// COURSE
// =====================================================

app.use(
    "/api/course",
    courseRouter
);


// =====================================================
// USER
// =====================================================

app.use(
    "/api/user",
    userRouter
);


// =====================================================
// EXAM
// =====================================================

app.use(
    "/api/exam",
    examRouter
);


// =====================================================
// STRIPE WEBHOOK
// =====================================================

// Keep Stripe raw-body handling before normal JSON handling
// if your Stripe webhook requires the raw request body.

app.use(
    "/stripe",
    express.raw({
        type: "application/json",
    }),
    stripeWebhooks
);


// =====================================================
// SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server is running on port ${PORT}`
    );
});