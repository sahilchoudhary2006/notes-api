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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const Note = mongoose.model("Note", noteSchema);
export default Note;
