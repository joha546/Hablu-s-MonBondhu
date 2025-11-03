import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { logger } from "../utils/logger.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if(!name || !email || !password){
        return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if(userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } 
  catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } 
  catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const logout = async (req, res) => {
  // For stateless JWT, logout is handled client-side by deleting token.
  // For blacklisting, we can maintain a token store in Redis later.
  res.status(200).json({ message: "Logged out successfully" });
};
