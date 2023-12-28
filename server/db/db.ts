import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log('MongoDB connection SUCCESS');
  } catch (error) {
    console.log('MongoDB connection FAIL', error);
    process.exit(1);
  }
};
