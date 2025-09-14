import express from 'express';
import cors from 'cors';
import  'dotenv/config';
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import eductaorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

//initalize express
const app=express()

//connect to database
await  connectDB();
await connectCloudinary();


//middlewares
app.use(cors())
app.use(clerkMiddleware())

// Routes
app.get('/',(req, res)=>res.send("API Working"))
app.post("/webhooks/clerk", express.raw({ type: "application/json" }), clerkWebhooks);
app.use('/api/educator',express.json(),eductaorRouter)
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter);
app.use('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//port
const PORT=process.env.PORT||5000

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})
