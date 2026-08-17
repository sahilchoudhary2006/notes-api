import { Router } from "express";

import {
    getAllNotes,
    getSingleNote,
    createNote,
    updateNote
} from "../controllers/note.controller.js";


const router = Router();

router.get("/", getAllNotes);
router.get("/:id", getSingleNote);

router.post("/", createNote);

router.patch("/:id", updateNote);

export default router;