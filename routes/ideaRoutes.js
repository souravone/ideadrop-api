import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createIdea,
  deleteIdea,
  editIdea,
  getIdea,
  getIdeas,
} from "../controller/ideaController.js";

const router = express.Router();

router.get("/", getIdeas);
router.get("/:id", getIdea);

router.post("/", protect, createIdea);

router.put("/:id", protect, editIdea);
router.delete("/:id", protect, deleteIdea);

export default router;
