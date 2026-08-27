const validate = (schema, source = "body") => {
    return (req, res, next) => {

        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            });
        }

        req.validated = req.validated || {};
        req.validated[source] = result.data;

        next();
    };
};

export default validate;