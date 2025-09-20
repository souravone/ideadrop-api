import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import ideaRouter from "./routes/ideaRoutes.js";
import authRouter from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 4567;
const app = express();

connectDB();

const allowedOrigins = [
  "http://localhost:3000",
  "https://ideadrop-ui-mu.vercel.app/",
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/ideas", ideaRouter);
app.use("/api/auth", authRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
