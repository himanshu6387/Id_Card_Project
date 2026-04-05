import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";

import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();

// console.log(process.env.CLOUDINARY_API_KEY)

// ✅ Connect DB
connectDB();

// ✅ Allowed Origins
const allowedOrigins = [
  "https://id-card-project-six.vercel.app",
  "https://www.allaroundaid.com",
  "https://allaroundaid.com",
  "http://localhost:5173",
];

// ✅ CORS (this alone handles OPTIONS correctly)
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ❌ DO NOT USE app.options("*")

// ✅ Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/college", collegeRoutes);
app.use("/api/student", studentRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.send("✅ ID Card Project API is running");
});


// ✅ Start Server
const PORT = process.env.PORT || 5500;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
