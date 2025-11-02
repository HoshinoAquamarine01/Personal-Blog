import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); 

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connected successfully to: ${conn.connection.name}`);
    console.log(`📍 Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed!");
    console.error(error.message);
    process.exit(1); // Dừng server nếu lỗi
  }
};

export default connectDB;
