import { Router } from "express";
import validate from "../middlewares/validate.middleware.js";
import noteSchema, { updateNoteSchema, noteQuerySchema } from "../validators/note.validator.js";
import authMiddleware from "../middlewares/auth.middleware.js";

import {
    getAllNotes,
    getSingleNote,
    createNote,
    updateNote,
    deleteNote
} from "../controllers/note.controller.js";


const router = Router();

router.get("/", authMiddleware, validate(noteQuerySchema, "query"), getAllNotes);
router.get("/:id", authMiddleware, getSingleNote);

router.post("/", authMiddleware, validate(noteSchema), createNote);

router.patch("/:id", authMiddleware, validate(updateNoteSchema), updateNote);

router.delete("/:id", authMiddleware, deleteNote);

export default router;