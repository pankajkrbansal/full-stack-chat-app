import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({
  path: "../.env",
});

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const connectDB = async (uri) => {
  try {
    let data = await mongoose.connect(uri, {
      dbName: process.env.DATABASE_NAME,
    });
    console.log("Connected to DB", data.connection.host);
  } catch (err) {
    throw err;
  }
};

const sendToken = async (res, user, httpCode, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(httpCode).cookie("jwt-token", token, cookieOptions).json({
    success: true,
    message,
  });
};

const emitEvent = async (req, event, users, data) => {
  console.log("Event Emitted", event);
};

export { connectDB, sendToken, cookieOptions, emitEvent };
