import Note from "../models/note.models.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";



const getAllNotes = async (req, res) => {
    const notes = await Note.find();

    res.status(200).json({
    message: "Notes fetched successfully",
    data: notes
});

};


const getSingleNote = asyncHandler(async (req, res) => {
    const note = await Note.findById(req.params.id);

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
   
    const note = await Note.findByIdAndUpdate(
    req.params.id,
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

   const note = await Note.findByIdAndDelete(req.params.id);

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

    const note = await Note.create(req.body);

    res.status(201).json({
        message: "Note created successfully",
        data: note,
    });

    
};

export { getAllNotes, getSingleNote, createNote, updateNote, deleteNote };
