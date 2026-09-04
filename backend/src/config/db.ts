import mongoose from 'mongoose';

let isDbConnected = false;

export const connectDB = async (): Promise<boolean> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI environment variable is missing in production environment!');
    } else {
      console.log('ℹ️ MONGODB_URI not provided. Operating in high-performance in-memory persistence mode.');
    }
    isDbConnected = false;
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isDbConnected = true;
    console.log('✅ Connected to MongoDB Atlas database successfully.');

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
      isDbConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Connection Disconnected.');
      isDbConnected = false;
    });

    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB connection attempt failed. Continuing with active in-memory store fallback.');
    isDbConnected = false;
    return false;
  }
};

export const checkDbConnection = (): boolean => {
  return isDbConnected && mongoose.connection.readyState === 1;
};

export const disconnectDB = async (): Promise<void> => {
  if (isDbConnected) {
    await mongoose.disconnect();
    isDbConnected = false;
    console.log('👋 MongoDB disconnected gracefully.');
  }
};
