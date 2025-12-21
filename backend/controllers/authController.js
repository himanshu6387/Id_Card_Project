import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// export const login = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { email, password } = req.body;

//     // 1️⃣ Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 2️⃣ Compare password using bcrypt here
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // 3️⃣ Generate token
//     const token = generateToken(user._id);
//     console.log(token)

//     // 4️⃣ Send response
//     res.json({
//       _id: user._id,
//       email: user.email,
//       role: user.role,
//       collegeName: user.collegeName,
//       token,

//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // ✅ normalize inputs
    email = email.trim().toLowerCase();
    password = password.trim();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      collegeName: user.collegeName,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
