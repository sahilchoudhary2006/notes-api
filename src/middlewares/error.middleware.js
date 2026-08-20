const errorHandler = (err, req, res, next) => {  // express recognizes this as an error handling middleware because it has four parameters

    const statusCode = err.statusCode || 500;  
      res.status(statusCode).json({     // what does this do whenever some error occurs in the application, it will send a response with status code 500 (Internal Server Error) and a JSON object containing the error message
        success: false,
        message: err.message
    });

};

export default errorHandler;   // why to export this beacause our middleware exist in seprate file and we want to use it in our main application file (app.js) to handle errors globally. By exporting it, we can import it in app.js and use it as a middleware to catch and handle errors that occur in our routes or controllers.