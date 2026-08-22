import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import noteSchema, { updateNoteSchema } from "../validators/note.validator.js";

import {
    getAllNotes,
    getSingleNote,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/note.controller.js";


const router = Router();

router.get("/", getAllNotes);
router.get("/:id", getSingleNote);

router.post("/", validate(noteSchema), createNote);

router.patch("/:id", validate(updateNoteSchema), updateNote);

router.delete("/:id", deleteNote);

export default router;