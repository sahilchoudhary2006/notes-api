import 'dotenv/config';
import app from './app.js';
import connectDB from "./db/db.js";


const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {

    console.log(`Server is running on port ${PORT}`);

});

