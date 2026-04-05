import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const MONGO_URI =
            process.env.NODE_ENV === "production"
                ? process.env.MONGO_URI   // SRV (Render)
                : process.env.MONGO_LOCAL // non-SRV (local)

        await mongoose.connect(MONGO_URI);

        console.log("MongoDB Connected Successfully..");
    } catch (error) {
        console.log("MongoDB Error:", error);
        process.exit(1); // important for Render
    }
};

export default connectDB;
