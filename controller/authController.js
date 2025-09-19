import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({ name, email, password });

    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401);
      throw new Error("Invalid credential");
    }

    const isMatched = await user.matchPassword(password);
    if (!isMatched) {
      res.status(401);
      throw new Error("Invalid credential");
    }
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
};

const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log("refreshing token...");

    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      res.status(401);
      throw new Error("No user");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m"
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    next(err);
  }
};

export { createUser, loginUser, logoutUser, refreshToken };
