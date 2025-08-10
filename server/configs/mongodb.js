import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB database is connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB connection disconnected');
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/BrainWave`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err);
    process.exit(1); // Exit process if DB fails
  }
};

export default connectDB;
