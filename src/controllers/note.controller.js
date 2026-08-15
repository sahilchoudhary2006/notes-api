const getAllNotes = (req, res) => {
    res.send("All Notes");
};

const createNote = (req, res) => {

    console.log(req.body);

    res.status(201).json({
        message: "Note created successfully",
        data: req.body,
    });
};

export { getAllNotes, createNote };

