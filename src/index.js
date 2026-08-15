import app from './app.js';
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config();


const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

});

