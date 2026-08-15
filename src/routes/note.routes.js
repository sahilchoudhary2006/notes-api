import { Router } from "express";

import {
    getAllNotes,
    createNote
} from "../controllers/note.controller.js";

const router = Router();

router.get("/", getAllNotes);

router.post("/", createNote);

export default router;