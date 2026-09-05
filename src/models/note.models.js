import mongoose from "mongoose";

const listItemSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const listSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    type: { type: String, enum: ['checklist', 'bullet'], default: 'checklist' },
    items: [listItemSchema]
});

const drawingSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    data: { type: String, default: "[]" } // serialized strokes/paths JSON
});

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    lists: {
        type: [listSchema],
        default: []
    },
    drawings: {
        type: [drawingSchema],
        default: []
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    tags: [{
        name: { type: String, required: true },
        color: { type: String, default: "#3b82f6" } // Default to blue
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);
export default Note;
