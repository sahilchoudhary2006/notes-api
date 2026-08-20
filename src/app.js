import express from 'express';
import noteRouter from "./routes/note.routes.js";
import errorHandler from "./middlewares/error.middleware.js";

const app = express();


app.use(express.json());

app.use("/api/v1/notes", noteRouter);

// app.get("/test-error", (req, res) => {         // this only for testing the error handling middleware, you can remove it later
//     throw new Error("This is a test error");  
// });

app.use(errorHandler);


export default app;