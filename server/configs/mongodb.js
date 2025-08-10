import mongoose from "mongoose";

const connectDB = async () => {

    mongoose.connection.on('connected', () => 
      console.log('✅ MongoDB database is connected'))

    await mongoose.connect(`${process.env.MONGODB_URI}/BrainWave`)

}
export default connectDB;
