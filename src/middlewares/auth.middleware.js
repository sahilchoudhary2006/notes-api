import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        throw new ApiError(401, "Authentication required");
    }
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
};


export default authMiddleware;

