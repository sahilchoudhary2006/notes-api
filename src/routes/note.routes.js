import { Router } from "express";

import {
    getAllNotes,
    getSingleNote,
    createNote
} from "../controllers/note.controller.js";

const router = Router();

router.get("/", getAllNotes);
router.get("/:id", getSingleNote);

router.post("/", createNote);

export default router;