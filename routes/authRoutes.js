import express from "express";
import {
  createUser,
  loginUser,
  logoutUser,
  refreshToken,
} from "../controller/authController.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh", refreshToken);

export default router;
