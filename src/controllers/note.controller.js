import Note from "../models/note.models.js";

const getAllNotes = async (req, res) => {
    const notes = await Note.find();

    res.status(200).json({
    message: "Notes fetched successfully",
    data: notes
});

};

const getSingleNote = async (req, res) => {
   
    const note = await Note.findById(req.params.id);

    if(!note) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    res.status(200).json({
    message: "Note fetched successfully",
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

export { getAllNotes, getSingleNote, createNote };

