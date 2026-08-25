import Note from "../models/note.models.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";



const getAllNotes = async (req, res) => {

    const page = Math.max(Number(req.query.page) || 1, 1);
   const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
   
    const skip = (page - 1) * limit;

    const notes = await Note.find({ userId: req.userId })
    .skip(skip)
    .limit(limit);

    const totalNotes = await Note.countDocuments({ userId: req.userId });

    const totalPages = Math.ceil(totalNotes / limit);

   res.status(200).json({
    message: "Notes fetched successfully",
    data: notes,
    pagination: {
        page,
        limit,
        totalNotes,
        totalPages
    }
});


};


const getSingleNote = asyncHandler(async (req, res) => {
   const note = await Note.findOne({
    _id: req.params.id,
    userId: req.userId,
});

    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    res.status(200).json({
        message: "Note fetched successfully",
        data: note
    });
});


const updateNote = async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: "Invalid note ID"
    });
}
   
const note = await Note.findOneAndUpdate(
    {
        _id: req.params.id,
        userId: req.userId,
    },
    req.body,
    { new: true }
);
   
   if (!note) {
    return res.status(404).json({
        message: "Note not found"
    });

  }

  res.status(200).json({
    message: "Note updated successfully",
    data: note
});

};

const deleteNote = async (req, res) => {

    

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: "Invalid note ID"
    });
}

   const note = await Note.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
});

   if (!note) {
    return res.status(404).json({
        message: "Note not found"
    });
  }

  res.status(200).json({
    message: "Note deleted successfully",
    data: note
});

};


const createNote = async (req, res) => {

    const userId = req.userId;

    const note = await Note.create({
    ...req.body,
    userId,
});

    res.status(201).json({
        message: "Note created successfully",
        data: note,
    });

    
};

export { getAllNotes, getSingleNote, createNote, updateNote, deleteNote };


