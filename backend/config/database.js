import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/IdCardProject');
        console.log("MongoDB Connected Successfully..");
    } catch (error) {
        console.log("MongoDB Error:", error);
        process.exit(1); // important for Render
    }
};

export default connectDB;
