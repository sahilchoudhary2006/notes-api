const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

         if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.issues
            })
         }

         next();
    }
}

export default validate;