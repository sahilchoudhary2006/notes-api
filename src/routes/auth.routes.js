import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import registerSchema from "../validators/auth.validator.js";

const router = Router();

router.post("/register",  validate(registerSchema), registerUser);


export default router;

