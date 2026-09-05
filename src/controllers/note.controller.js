import Note from "../models/note.models.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


const getAllNotes = async (req, res) => {

    const { page, limit, search, sort } = req.validated.query;

    const skip = (page - 1) * limit;

    const sortOrder = sort === "oldest" ? 1 : -1;

    const filter = {
        userId: req.userId,
    };

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    if (req.validated.query.type) {
        if (req.validated.query.type === 'drawing') {
            filter["drawings.0"] = { $exists: true };
        } else if (req.validated.query.type === 'list') {
            filter["lists.0"] = { $exists: true };
        } else if (req.validated.query.type === 'text') {
            filter["drawings.0"] = { $exists: false };
            filter["lists.0"] = { $exists: false };
        }
    }

    const notes = await Note.find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit);

    const totalNotes = await Note.countDocuments(filter);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
        message: "Notes fetched successfully",
        data: notes,
        search: search || null,
        sort,
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


