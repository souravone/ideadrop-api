import Idea from "../models/Idea.js";
import mongoose from "mongoose";

const getIdeas = async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });
    if (!isNaN(limit)) {
      query.limit(limit);
    }
    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }
    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    res.json(idea);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const createIdea = async (req, res, next) => {
  try {
    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary.trim() || !description.trim()) {
      res.status(400);
      throw new Error(`Title, summary and description are required`);
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
      user: req.user.id,
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const deleteIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }
    // const idea = await Idea.findByIdAndDelete(id);
    // if (!idea) {
    //   res.status(404);
    //   throw new Error("Idea not found");
    // }

    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }
    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to delete this idea");
    }
    await idea.deleteOne();
    res.json({ message: "Idea deleted successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const editIdea = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea not found");
    }
    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea not found");
    }

    if (idea.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this idea");
    }

    const { title, summary, description, tags } = req.body || {};
    if (!title?.trim() || !summary.trim() || !description.trim()) {
      res.status(400);
      throw new Error(`Title, summary and description are required`);
    }

    // const updatedIdea = await Idea.findByIdAndUpdate(
    //   id,
    //   {
    //     title,
    //     summary,
    //     description,
    //     tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
    //   },
    //   { new: true, runValidators: true }
    // );

    //   if (!updatedIdea) {
    //   res.status(404);
    //   throw new Error("idea not found");
    // }

    idea.title = title;
    idea.summary = summary;
    idea.description = description;
    idea.tags = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    const updatedIdea = await idea.save();

    res.json(updatedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export { getIdeas, getIdea, createIdea, editIdea, deleteIdea };
