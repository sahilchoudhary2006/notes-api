import { Router } from "express";

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

router.post("/", createNote);

router.patch("/:id", updateNote);

router.delete("/:id", deleteNote);

export default router;