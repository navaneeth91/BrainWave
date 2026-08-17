import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';

import eductaorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';

import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import examRouter from './routes/examRoutes.js';
import aiRouter from './routes/aiRoutes.js';

// Initialize Express
const app = express();

// Connect to Database
await connectDB();

// Connect to Cloudinary
await connectCloudinary();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(clerkMiddleware());

// ==========================================
// ROUTES
// ==========================================

// Test API
app.get('/', (req, res) => {
    res.send('API Working');
});

// Clerk Webhook
app.post(
    '/clerk',
    express.json(),
    clerkWebhooks
);

// Educator Routes
app.use(
    '/api/educator',
    express.json(),
    eductaorRouter
);

// Course Routes
app.use(
    '/api/course',
    express.json(),
    courseRouter
);

// User Routes
app.use(
    '/api/user',
    express.json(),
    userRouter
);

// Exam Routes
// IMPORTANT: express.json() is required here
// so req.body works inside createExam()
app.use(
    '/api/exam',
    express.json(),
    examRouter
);

// AI Routes (BrainWave AI Learning Assistant)
// Note: clerkMiddleware() runs globally above, so req.auth.userId is
// available inside the AI controller. The body limit is small because the
// frontend only sends a message + a short conversation history.
app.use(
    '/api/ai',
    express.json({ limit: '128kb' }),
    aiRouter
);

// Stripe Webhook
// IMPORTANT: Stripe requires raw body
app.use(
    '/stripe',
    express.raw({
        type: 'application/json'
    }),
    stripeWebhooks
);

// ==========================================
// PORT
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});